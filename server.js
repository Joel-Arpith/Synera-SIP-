require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const cors = require('cors');
const geoip = require('geoip-lite');
const { exec } = require('child_process');
const { explainAlert } = require('./llm');

const app = express();
const port = process.env.PORT || 3001;

// Supabase client (Service Role)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.use(cors());
app.use(express.json());

// In-memory Deduplication & Strike Tracking
const alertWindow = new Map(); // key: signature+src_ip, value: { count, lastSeen }
const strikes = new Map(); // key: src_ip, value: { count, lastAlertTime }

const WINDOW_MS = 60 * 1000; // 60s for deduplication
const STRIKE_WINDOW_MS = 5 * 60 * 1000; // 5 min for auto-block

// ─── Slow Scan Tracker ───────────────────────────────────
class SlowScanTracker {
  constructor() {
    // ip → { ports: Set, firstSeen: timestamp }
    this.tracker = new Map();
    this.WINDOW_MS = 30 * 60 * 1000; // 30 minutes
    this.PORT_THRESHOLD = 15; // unique ports

    // Clean up old entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  track(src_ip, dest_port) {
    const now = Date.now();
    
    if (!this.tracker.has(src_ip)) {
      this.tracker.set(src_ip, { 
        ports: new Set(), 
        firstSeen: now 
      });
    }

    const entry = this.tracker.get(src_ip);
    
    // Reset window if expired
    if (now - entry.firstSeen > this.WINDOW_MS) {
      entry.ports.clear();
      entry.firstSeen = now;
    }

    entry.ports.add(dest_port);

    // Trigger if threshold exceeded
    if (entry.ports.size >= this.PORT_THRESHOLD) {
      entry.ports.clear(); // reset after alert
      return {
        triggered: true,
        portCount: entry.ports.size,
        windowMinutes: this.WINDOW_MS / 60000
      };
    }

    return { triggered: false };
  }

  cleanup() {
    const now = Date.now();
    for (const [ip, entry] of this.tracker.entries()) {
      if (now - entry.firstSeen > this.WINDOW_MS) {
        this.tracker.delete(ip);
      }
    }
  }
}

const slowScanTracker = new SlowScanTracker();

// --- Enrichment Logic ---
function classifyAttack(category) {
    if (!category) return "UNKNOWN";
    const c = category.toLowerCase();
    if (c.includes("information leak") || c.includes("recon")) return "RECONNAISSANCE";
    if (c.includes("denial of service") || c.includes("dos")) return "DOS";
    if (c.includes("admin privilege") || c.includes("exploit")) return "EXPLOIT";
    if (c.includes("malware") || c.includes("trojan")) return "MALWARE";
    return "UNKNOWN";
}

function getGeo(ip) {
    const geo = geoip.lookup(ip);
    if (!geo) return { country: "Unknown", city: "Unknown", lat: 0, lng: 0 };
    return {
        country: geo.country,
        city: geo.city,
        lat: geo.ll[0],
        lng: geo.ll[1]
    };
}

// --- Blocking Logic ---
async function blockIP(ip, reason, alertCount) {
    if (ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('127.')) {
        console.log(`[SKIP] Internal IP ${ip} ignored for blocking.`);
        return;
    }

    console.log(`[ACTION] Blocking IP ${ip} for: ${reason}`);
    
    // Execute iptables
    exec(`sudo iptables -A INPUT -s ${ip} -j DROP`, (err) => {
        if (err) console.error(`[ERROR] iptables failed for ${ip}: ${err.message}`);
    });

    // Log to Supabase
    const { data: geo } = getGeo(ip);
    await supabase.from('blocked_ips').upsert({
        ip,
        reason,
        timestamp: new Date().toISOString(),
        alert_count: alertCount,
        country: geo.country,
        unblocked: false
    });
}

// --- Endpoints ---

// Ingest from Python Log Tailer
app.post('/api/ingest', async (req, res) => {
    // 0. Secret Validation
    const secret = req.headers['x-ingest-secret'];
    if (secret !== process.env.INGEST_SECRET) {
        console.warn(`[AUTH] Unauthorized ingestion attempt from ${req.ip}`);
        return res.status(403).json({ error: 'Unauthorized: Invalid secret' });
    }

    const alert = req.body;
    const { src_ip, signature, category, severity, timestamp } = alert;

    // 1. Deduplication
    const dedupKey = `${signature}:${src_ip}`;
    const now = Date.now();
    const existing = alertWindow.get(dedupKey);

    if (existing && (now - existing.lastSeen < WINDOW_MS)) {
        existing.count++;
        existing.lastSeen = now;
        
        // Update existing alert in Supabase (if needed, or just let it group)
        // For production simplicity, we'll only push unique alerts or updates
        if (existing.count > 3) {
            console.log(`[DEDUP] Suppressing alert from ${src_ip} (${signature}) - count: ${existing.count}`);
            return res.json({ status: 'suppressed', count: existing.count });
        }
    } else {
        alertWindow.set(dedupKey, { count: 1, lastSeen: now });
    }

    // 2. Enrichment
    const attack_type = classifyAttack(category);
    const geo = getGeo(src_ip);
    
    const enrichedAlert = {
        ...alert,
        attack_type,
        ...geo,
        grouped: (existing?.count > 1),
        count: existing ? existing.count : 1
    };

    // 3. Store in Supabase
    
    // Check for slow scan pattern
    if (alert.dest_port) {
        const scanCheck = slowScanTracker.track(alert.src_ip, alert.dest_port);
        if (scanCheck.triggered) {
            const slowScanAlert = {
                ...alert,
                signature: "SLOW SCAN - Multiple ports over extended window",
                attack_type: "RECONNAISSANCE",
                severity: "high",
                category: "Slow Port Scan",
                grouped: false,
                count: scanCheck.portCount
            };
            // Enrich synthetic alert
            const sGeo = getGeo(alert.src_ip);
            await supabase.from('alerts').insert({ ...slowScanAlert, ...sGeo }).select();
        }
    }

    const { data, error } = await supabase.from('alerts').insert(enrichedAlert).select();
    if (error) return res.status(500).json({ error: error.message });

    // 4. Auto-Blocking Engine
    const sev = (severity || "").toLowerCase();
    if (sev === "high" || sev === "critical" || sev === "1") {
        const strike = strikes.get(src_ip) || { count: 0, lastAlertTime: 0 };
        if (now - strike.lastAlertTime > STRIKE_WINDOW_MS) {
            strike.count = 1;
        } else {
            strike.count++;
        }
        strike.lastAlertTime = now;
        strikes.set(src_ip, strike);

        if (strike.count >= 5) {
            await blockIP(src_ip, `Exceeded 5 ${sev} alerts in 5 mins`, strike.count);
        }
    }

    // ─── LLM Explanation (async, non-blocking) ──────────────
    // Fire and forget — explanation field updates in background
    // Dashboard picks it up via Supabase Realtime UPDATE event
    explainAlert(data[0]).catch(err => {
        console.error('[llm] Unhandled error:', err.message);
    });

    res.json({ status: 'success', data });
});

app.get('/api/alerts', async (req, res) => {
    const { data, error } = await supabase.from('alerts').select('*').order('timestamp', { ascending: false }).limit(50);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.get('/api/stats', async (req, res) => {
    // Basic aggregation (in production, use RPC or pre-computed stats)
    const { data: alerts } = await supabase.from('alerts').select('attack_type, severity, src_ip');
    
    const stats = {
        total: alerts.length,
        byType: {},
        bySeverity: {},
        topIPs: {}
    };

    alerts.forEach(a => {
        stats.byType[a.attack_type] = (stats.byType[a.attack_type] || 0) + 1;
        stats.bySeverity[a.severity] = (stats.bySeverity[a.severity] || 0) + 1;
        stats.topIPs[a.src_ip] = (stats.topIPs[a.src_ip] || 0) + 1;
    });

    res.json(stats);
});

app.post('/api/unblock-ip', async (req, res) => {
    const { ip } = req.body;
    console.log(`[ACTION] Unblocking IP ${ip}`);
    
    exec(`sudo iptables -D INPUT -s ${ip} -j DROP`, (err) => {
        if (err) console.error(`[ERROR] iptables delete failed for ${ip}: ${err.message}`);
    });

    const { error } = await supabase.from('blocked_ips').update({ unblocked: true }).eq('ip', ip);
    if (error) return res.status(500).json({ error: error.message });
    
    res.json({ success: true });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`[CyberIDS] Monitoring active on port ${port}`);
});
