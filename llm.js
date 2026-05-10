const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function explainAlert(alert) {
  try {
    if (!alert || !alert.id) {
      console.error('[llm] Invalid alert object provided');
      return;
    }

    if (process.env.LLM_ENABLED !== 'true') {
      console.log('[llm] AI explanations are disabled in settings');
      return;
    }

    // Checking severity threshold
    const minSeverity = process.env.LLM_MIN_SEVERITY || 'high';
    const severities = ['low', 'medium', 'high', 'critical'];
    if (severities.indexOf(alert.severity) < severities.indexOf(minSeverity)) {
      console.log(`[llm] Skipping explanation: alert severity (${alert.severity}) below threshold (${minSeverity})`);
      await supabase.from('alerts').update({ explanation_status: 'skipped' }).eq('id', alert.id);
      return;
    }

    console.log(`[llm] Generating explanation for alert ${alert.id}...`);

    const prompt = `
      You are an expert Cybersecurity Analyst. Explain this network intrusion alert to a non-technical small business owner.
      
      Alert Details:
      - Time: ${alert.timestamp}
      - Signature: ${alert.signature}
      - Category: ${alert.category}
      - Source IP: ${alert.src_ip} (${alert.city || 'Unknown'}, ${alert.country || 'Unknown'})
      - Target: ${alert.dest_ip}:${alert.dest_port}
      - Protocol: ${alert.proto}
      
      Respond only with a JSON object in this format:
      {
        "situation": "What actually happened in plain English",
        "exposure": "What the risk is to the business",
        "guidance": "1-2 simple steps the owner should take"
      }
    `;

    const model = process.env.OPENROUTER_MODEL || 'mistralai/mistral-7b-instruct:free';
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'https://synera-sip.vercel.app',
        'X-Title': 'Synera-SIP'
      },
      body: JSON.stringify({
        model,
        max_tokens: parseInt(process.env.LLM_MAX_TOKENS) || 200,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!res.ok) {
      const errorMsg = await res.text();
      throw new Error(`OpenRouter API error: ${res.status} - ${errorMsg}`);
    }

    const data = await res.json();
    const text = data.choices[0].message.content;

    const { error: updateError } = await supabase
      .from('alerts')
      .update({
        explanation: text,
        explanation_status: 'generated',
        explanation_generated_at: new Date().toISOString()
      })
      .eq('id', alert.id);

    if (updateError) throw updateError;

    console.log(`[llm] Success: Explanation saved for alert ${alert.id}`);

  } catch (err) {
    console.error(`[llm] Error for alert ${alert.id}:`, err.message);
    const { error: failUpdateError } = await supabase
      .from('alerts')
      .update({ explanation_status: 'failed' })
      .eq('id', alert.id);
    
    if (failUpdateError) {
      console.error('[llm] Critical: Failed to update error status', failUpdateError.message);
    }
  }
}

module.exports = { explainAlert };
