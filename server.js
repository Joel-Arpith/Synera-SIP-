require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Supabase client using Service Role Key (bypasses RLS)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'CyberIDS Backend is running', timestamp: new Date() });
});

// Example route: Subscribe to blocked_ips realtime
// (Though typically the frontend does this, the backend might need it for local firewall sync)
app.get('/ips', async (req, res) => {
  const { data, error } = await supabase
    .from('blocked_ips')
    .select('*');
  
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Handle auto-blocking (called by tailer.py or internal logic)
app.post('/block', async (req, res) => {
    const { ip, reason } = req.body;
    
    // In search of secret logic...
    if (req.headers['x-ingest-secret'] !== process.env.INGEST_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    // Insert into Supabase
    const { data, error } = await supabase
        .from('blocked_ips')
        .upsert({ ip, reason, created_at: new Date() });

    if (error) return res.status(500).json({ error: error.message });

    // TODO: Execute local iptables command to block IP
    console.log(`[BLOCK] Blocking IP: ${ip} for reason: ${reason}`);
    
    res.json({ success: true, message: `Blocked ${ip}` });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`[CyberIDS] Backend listening on port ${port}`);
});
