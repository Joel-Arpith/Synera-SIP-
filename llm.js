/**
 * LLM Alert Explanation Engine
 * Calls Claude Haiku only for HIGH/CRITICAL alerts.
 * Async fire-and-forget — never blocks alert pipeline.
 * Rate limited to prevent cost spikes during DDoS.
 */

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── Rate Limiter ────────────────────────────────────────
class RateLimiter {
  constructor(maxPerMinute) {
    this.max = maxPerMinute;
    this.calls = [];
  }

  canCall() {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    // Drop calls older than 1 minute
    this.calls = this.calls.filter(t => t > oneMinuteAgo);
    if (this.calls.length >= this.max) return false;
    this.calls.push(now);
    return true;
  }

  queueSize() {
    return this.calls.length;
  }
}

const rateLimiter = new RateLimiter(
  parseInt(process.env.LLM_RATE_LIMIT_PER_MINUTE) || 20
);

// ─── Severity Gate ───────────────────────────────────────
const SEVERITY_LEVELS = { low: 0, medium: 1, high: 2, critical: 3 };
const MIN_SEVERITY = process.env.LLM_MIN_SEVERITY || 'high';

function shouldExplain(severity) {
  if (process.env.LLM_ENABLED !== 'true') return false;
  if (!process.env.ANTHROPIC_API_KEY) return false;
  return (SEVERITY_LEVELS[severity] || 0) >= 
         (SEVERITY_LEVELS[MIN_SEVERITY] || 2);
}

// ─── Prompt Builder ──────────────────────────────────────
function buildPrompt(alert) {
  return `You are a cybersecurity analyst explaining a network alert to a non-technical small business owner.

Alert details:
- What triggered: ${alert.signature}
- Attack category: ${alert.attack_type}
- Attacker IP: ${alert.src_ip}
- Attacker location: ${alert.city || 'Unknown'}, ${alert.country || 'Unknown'}
- Target port: ${alert.dest_port} (${getPortService(alert.dest_port)})
- Protocol: ${alert.proto}
- Severity: ${alert.severity.toUpperCase()}
- Times seen: ${alert.count || 1}

Respond in exactly this JSON format, nothing else:
{
  "what_happened": "One sentence, plain English, what the attacker did.",
  "why_it_matters": "One sentence, what damage this could cause.",
  "action": "One sentence, what the business owner should do right now.",
  "threat_level": "One of: Low Risk / Moderate Risk / High Risk / Critical Threat"
}

Rules:
- No technical jargon
- No speculation beyond the data given
- No mention of IP reputation unless country is known high-risk
- Max 20 words per field
- Always recommend action even if just "Monitor closely"`;
}

// ─── Port → Service Name ─────────────────────────────────
function getPortService(port) {
  const services = {
    21: 'FTP', 22: 'SSH', 23: 'Telnet', 25: 'SMTP',
    53: 'DNS', 80: 'HTTP', 110: 'POP3', 143: 'IMAP',
    443: 'HTTPS', 445: 'SMB/Windows File Share',
    3306: 'MySQL Database', 3389: 'Remote Desktop (RDP)',
    5432: 'PostgreSQL Database', 6379: 'Redis',
    8080: 'Web Server', 8443: 'HTTPS Alternate',
    27017: 'MongoDB Database'
  };
  return services[port] || 'Unknown Service';
}

// ─── Claude API Call ─────────────────────────────────────
async function callClaude(prompt) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: parseInt(process.env.LLM_MAX_TOKENS) || 200,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Claude API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('');

  // Strip markdown fences if present
  const clean = text.replace(/```json|```/g, '').trim();
  return JSON.parse(clean);
}

// ─── Main Export ─────────────────────────────────────────
/**
 * Fire-and-forget. Call this AFTER saving alert to Supabase.
 * Updates the explanation field async — never blocks pipeline.
 */
async function explainAlert(alert) {
  // Gate checks
  if (!shouldExplain(alert.severity)) return;
  if (!rateLimiter.canCall()) {
    console.log(`[llm] Rate limit hit. Queue: ${rateLimiter.queueSize()}/min`);
    await updateExplanationStatus(alert.id, null, 'skipped');
    return;
  }

  console.log(`[llm] Generating explanation for alert ${alert.id}`);

  try {
    const prompt = buildPrompt(alert);
    const explanation = await callClaude(prompt);

    // Save structured explanation back to Supabase
    await supabase
      .from('alerts')
      .update({
        explanation: JSON.stringify(explanation),
        explanation_status: 'generated',
        explanation_generated_at: new Date().toISOString()
      })
      .eq('id', alert.id);

    console.log(`[llm] Explanation saved for alert ${alert.id}`);

  } catch (err) {
    console.error(`[llm] Failed for alert ${alert.id}:`, err.message);
    await updateExplanationStatus(alert.id, null, 'failed');
  }
}

async function updateExplanationStatus(id, explanation, status) {
  await supabase
    .from('alerts')
    .update({ explanation, explanation_status: status })
    .eq('id', id);
}

module.exports = { explainAlert, shouldExplain };
