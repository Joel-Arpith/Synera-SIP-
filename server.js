require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const cors = require('cors');
const geoip = require('geoip-lite');
const { exec } = require('child_process');
const { explainAlert } = require('./llm');

const app = express();
const port = process.env.PORT || 3001;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.use(cors());
app.use(express.json());

// ─── Constants ────────────────────────────────────────────────
const DEDUP_WINDOW_MS   = 30 * 1000;       // 30s window
const DEDUP_SUPPRESS_AT = 20;              // suppress after 20 identical hits
const STRIKE_WINDOW_MS  = 5 * 60 * 1000;  // 5 min for auto-block
const STRIKE_THRESHOLD  = parseInt(process.env.STRIKE_THRESHOLD) || 5;

const alertWindow = new Map();
const strikes     = new Map();

// ─── Severity normalisation ───────────────────────────────────
// Suricata uses numeric severity: 1=critical/high, 2=medium, 3=low
// Some rules emit strings already. Normalise everything to our vocabulary.
function normalizeSeverity(raw) {
    if (!raw && raw !== 0) return 'low';
    const s = String(raw).trim().toLowerCase();
    if (s === '1' || s === 'critical') return 'critical';
    if (s === '2' || s === 'high')     return 'high';
    if (s === '3' || s === 'medium')   return 'medium';
    if (s === '4' || s === 'low')      return 'low';
    return 'low';
}

// ─── Attack classification ────────────────────────────────────
function classifyAttack(category, signature) {
    const haystack = ((category || '') + ' ' + (signature || '')).toLowerCase();
    if (/recon|scan|probe|information leak|info leak|discovery/.test(haystack)) return 'RECONNAISSANCE';
    if (/dos|denial.of.service|flood|amplif/.test(haystack))                   return 'DOS';
    if (/exploit|shellcode|overflow|injection|traversal|rce|lfi|rfi/.test(haystack)) return 'EXPLOIT';
    if (/malware|trojan|botnet|c2|c&c|rat|ransomware|backdoor/.test(haystack)) return 'MALWARE';
    if (/brute.force|credential|auth|login/.test(haystack))                    return 'EXPLOIT';
    return 'UNKNOWN';
}

// ─── GeoIP ───────────────────────────────────────────────────
function getGeo(ip) {
    if (!ip) return { country: 'Unknown', city: 'Unknown', lat: 0, lng: 0 };
    const geo = geoip.lookup(ip);
    if (!geo) return { country: 'Unknown', city: 'Unknown', lat: 0, lng: 0 };
    return { country: geo.country, city: geo.city || 'Unknown', lat: geo.ll[0], lng: geo.ll[1] };
}

// ─── IP validation ────────────────────────────────────────────
const IP_REGEX = /^(\d{1,3}\.){3}\d{1,3}$|^[\da-fA-F:]+$/;
function isValidIP(ip) {
    if (!ip || !IP_REGEX.test(ip)) return false;
    if (ip.includes('.')) return ip.split('.').every(o => parseInt(o, 10) <= 255);
    return true;
}

function isPrivateIP(ip) {
    return ip.startsWith('192.168.') ||
           ip.startsWith('10.')      ||
           ip.startsWith('172.16.')  ||
           ip.startsWith('172.17.')  ||
           ip.startsWith('172.18.')  ||
           ip.startsWith('172.19.')  ||
           ip.startsWith('172.2')    ||
           ip.startsWith('172.3')    ||
           ip.startsWith('127.')     ||
           ip === '::1';
}

// ─── Slow Scan Tracker ───────────────────────────────────────
class SlowScanTracker {
    constructor() {
        this.tracker  = new Map();
        this.WINDOW   = 30 * 60 * 1000;
        this.THRESHOLD = 15;
        setInterval(() => this._cleanup(), 5 * 60 * 1000);
    }

    track(src_ip, dest_port) {
        if (!src_ip || !dest_port) return { triggered: false };
        const now = Date.now();
        if (!this.tracker.has(src_ip)) {
            this.tracker.set(src_ip, { ports: new Set(), firstSeen: now });
        }
        const entry = this.tracker.get(src_ip);
        if (now - entry.firstSeen > this.WINDOW) {
            entry.ports.clear();
            entry.firstSeen = now;
        }
        entry.ports.add(dest_port);
        const portCount = entry.ports.size;
        if (portCount >= this.THRESHOLD) {
            entry.ports.clear();
            return { triggered: true, portCount };
        }
        return { triggered: false };
    }

    _cleanup() {
        const now = Date.now();
        for (const [ip, entry] of this.tracker.entries()) {
            if (now - entry.firstSeen > this.WINDOW) this.tracker.delete(ip);
        }
    }
}

const slowScanTracker = new SlowScanTracker();

// ─── Auto-block ───────────────────────────────────────────────
async function blockIP(ip, reason, alertCount) {
    if (!isValidIP(ip)) { console.warn(`[SKIP] Bad IP format: ${ip}`); return; }
    if (isPrivateIP(ip)) { console.log(`[SKIP] Private IP ${ip} not blocked`); return; }

    console.log(`[BLOCK] ${ip} — ${reason}`);
    exec('sudo iptables -A INPUT -s ' + ip + ' -j DROP', err => {
        if (err) console.error(`[ERROR] iptables: ${err.message}`);
    });

    const geo = getGeo(ip);
    await supabase.from('blocked_ips').upsert({
        ip, reason, alert_count: alertCount,
        timestamp: new Date().toISOString(),
        country: geo.country,
        unblocked: false
    });
}

// ─── Core ingest logic (shared by /api/ingest and /api/test) ──
async function processAlert(rawAlert) {
    const {
        src_ip, signature, category, timestamp,
        src_port, dest_ip, dest_port, proto, payload
    } = rawAlert;

    // Required field guard
    if (!src_ip || !signature) {
        return { error: 'Missing required fields: src_ip, signature' };
    }

    const severity    = normalizeSeverity(rawAlert.severity);
    const attack_type = classifyAttack(category, signature);
    const geo         = getGeo(src_ip);
    const now         = Date.now();

    // Deduplication
    const dedupKey = `${signature}:${src_ip}`;
    const existing = alertWindow.get(dedupKey);

    if (existing && (now - existing.lastSeen < DEDUP_WINDOW_MS)) {
        existing.count++;
        existing.lastSeen = now;
        if (existing.count > DEDUP_SUPPRESS_AT) {
            console.log(`[DEDUP] Suppressed (${existing.count}x): ${src_ip} — ${signature}`);
            return { status: 'suppressed', count: existing.count };
        }
    } else {
        alertWindow.set(dedupKey, { count: 1, lastSeen: now });
    }

    const enriched = {
        src_ip, src_port, dest_ip, dest_port, proto,
        signature, category, severity, attack_type,
        timestamp: timestamp || new Date().toISOString(),
        payload: payload || null,
        ...geo,
        grouped: existing?.count > 1,
        count: existing ? existing.count : 1,
    };

    // Slow scan detection
    if (dest_port) {
        const scan = slowScanTracker.track(src_ip, dest_port);
        if (scan.triggered) {
            const sGeo = getGeo(src_ip);
            await supabase.from('alerts').insert({
                ...enriched,
                signature: `Slow port scan detected (${scan.portCount} ports)`,
                attack_type: 'RECONNAISSANCE',
                severity: 'high',
                category: 'Port Scan',
                grouped: false,
                count: scan.portCount,
                ...sGeo,
            });
        }
    }

    const { data, error } = await supabase.from('alerts').insert(enriched).select();
    if (error) return { error: error.message };

    // Strike tracking for auto-block
    if (severity === 'critical' || severity === 'high') {
        const strike = strikes.get(src_ip) || { count: 0, lastAlertTime: 0 };
        strike.count = (now - strike.lastAlertTime > STRIKE_WINDOW_MS) ? 1 : strike.count + 1;
        strike.lastAlertTime = now;
        strikes.set(src_ip, strike);

        if (strike.count >= STRIKE_THRESHOLD) {
            await blockIP(src_ip, `${strike.count} high/critical alerts in 5 min`, strike.count);
        }
    }

    explainAlert(data[0]).catch(err => console.error('[llm]', err.message));

    console.log(`[INGEST] ${severity.toUpperCase()} ${attack_type} from ${src_ip} — ${signature}`);
    return { status: 'ok', data };
}

// ─── Routes ───────────────────────────────────────────────────

// Primary ingest from tailer (requires secret)
app.post('/api/ingest', async (req, res) => {
    if (req.headers['x-ingest-secret'] !== process.env.INGEST_SECRET) {
        console.warn(`[AUTH] Rejected ingest from ${req.ip}`);
        return res.status(403).json({ error: 'Unauthorized' });
    }
    const result = await processAlert(req.body);
    if (result.error) return res.status(result.error === 'Missing required fields: src_ip, signature' ? 400 : 500).json(result);
    res.json(result);
});

// Test alert injection — no secret needed, always marks as test
app.post('/api/test-alert', async (req, res) => {
    const templates = {
        portscan: {
            src_ip: '45.33.32.156', src_port: 0,
            dest_ip: '192.168.0.103', dest_port: 22,
            proto: 'TCP',
            signature: 'ET SCAN Nmap SSH Version Detection',
            category: 'Attempted Information Leak',
            severity: '2',
        },
        exploit: {
            src_ip: '198.51.100.42', src_port: 4444,
            dest_ip: '192.168.0.103', dest_port: 80,
            proto: 'TCP',
            signature: 'ET WEB_SERVER SQL Injection Attempt',
            category: 'Web Application Attack',
            severity: '1',
        },
        malware: {
            src_ip: '203.0.113.99', src_port: 8080,
            dest_ip: '192.168.0.103', dest_port: 443,
            proto: 'TCP',
            signature: 'ET MALWARE Possible C2 Beacon',
            category: 'Malware Command and Control Activity Detected',
            severity: '1',
        },
    };

    const type     = req.body.type || 'portscan';
    const template = templates[type] || templates.portscan;
    const alert    = { ...template, ...req.body, timestamp: new Date().toISOString() };

    // Allow override but strip the type key
    delete alert.type;

    const result = await processAlert(alert);
    if (result.error) return res.status(400).json(result);
    res.json(result);
});

app.get('/api/alerts', async (req, res) => {
    const { data, error } = await supabase
        .from('alerts').select('*')
        .order('timestamp', { ascending: false }).limit(50);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

app.get('/api/stats', async (req, res) => {
    const { data: alerts } = await supabase.from('alerts').select('attack_type, severity, src_ip');
    const stats = { total: alerts.length, byType: {}, bySeverity: {}, topIPs: {} };
    alerts.forEach(a => {
        stats.byType[a.attack_type]  = (stats.byType[a.attack_type]  || 0) + 1;
        stats.bySeverity[a.severity] = (stats.bySeverity[a.severity] || 0) + 1;
        stats.topIPs[a.src_ip]       = (stats.topIPs[a.src_ip]       || 0) + 1;
    });
    res.json(stats);
});

app.post('/api/unblock-ip', async (req, res) => {
    const { ip } = req.body;
    if (!isValidIP(ip)) return res.status(400).json({ error: 'Invalid IP address' });

    exec('sudo iptables -D INPUT -s ' + ip + ' -j DROP', err => {
        if (err) console.error(`[ERROR] iptables unblock failed: ${err.message}`);
    });

    const { error } = await supabase.from('blocked_ips').update({ unblocked: true }).eq('ip', ip);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`[CyberIDS] Listening on port ${port}`);
    startRealtimeListener();
});

// ─── Realtime bridge ─────────────────────────────────────────
// Frontend writes to Supabase; Pi reacts here via Realtime.
// This lets the dashboard trigger iptables without needing direct Pi access.
function startRealtimeListener() {
    supabase
        .channel('block-commands')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'blocked_ips' }, async (payload) => {
            const { ip, reason, alert_count } = payload.new;
            if (!ip || !isValidIP(ip)) return;
            if (isPrivateIP(ip)) {
                console.log(`[REALTIME] Skipping private IP block: ${ip}`);
                return;
            }
            console.log(`[REALTIME] Block command received for ${ip}`);
            exec('sudo iptables -A INPUT -s ' + ip + ' -j DROP', err => {
                if (err) console.error(`[REALTIME] iptables block failed for ${ip}: ${err.message}`);
                else console.log(`[REALTIME] Blocked ${ip} via iptables`);
            });
        })
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'blocked_ips' }, async (payload) => {
            const { ip, unblocked } = payload.new;
            if (!unblocked || !ip || !isValidIP(ip)) return;
            console.log(`[REALTIME] Unblock command received for ${ip}`);
            exec('sudo iptables -D INPUT -s ' + ip + ' -j DROP', err => {
                if (err) console.error(`[REALTIME] iptables unblock failed for ${ip}: ${err.message}`);
                else console.log(`[REALTIME] Unblocked ${ip} via iptables`);
            });
        })
        .subscribe(status => {
            console.log(`[REALTIME] Block command channel: ${status}`);
        });
}
