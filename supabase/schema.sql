-- CyberIDS Expanded Schema

-- Enable Realtime for existing tables (if not already)
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE blocked_ips;

-- Alerts Table Expansion
CREATE TABLE IF NOT EXISTS alerts (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    timestamp TIMESTAMPTZ,
    src_ip TEXT,
    src_port INT,
    dest_ip TEXT,
    dest_port INT,
    signature TEXT,
    category TEXT,
    severity TEXT, -- "low" | "medium" | "high" | "critical"
    proto TEXT,
    attack_type TEXT, -- "RECONNAISSANCE" | "DOS" | "EXPLOIT" | "MALWARE" | "UNKNOWN"
    country TEXT,
    city TEXT,
    lat FLOAT,
    lng FLOAT,
    grouped BOOLEAN DEFAULT FALSE,
    count INT DEFAULT 1,
    payload JSONB
);

-- Indexing
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_src_ip ON alerts (src_ip);
CREATE INDEX IF NOT EXISTS idx_alerts_attack_type ON alerts (attack_type);

-- Blocked IPs
CREATE TABLE IF NOT EXISTS blocked_ips (
    ip TEXT PRIMARY KEY,
    reason TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    alert_count INT DEFAULT 1,
    country TEXT,
    unblocked BOOLEAN DEFAULT FALSE
);

-- System Config
CREATE TABLE IF NOT EXISTS system_config (
    id TEXT PRIMARY KEY DEFAULT 'settings',
    auto_block_enabled BOOLEAN DEFAULT TRUE,
    strike_threshold INT DEFAULT 5,
    window_minutes INT DEFAULT 5,
    email_notifications BOOLEAN DEFAULT FALSE,
    alert_email TEXT
);

-- Initial Config
INSERT INTO system_config (id, auto_block_enabled, strike_threshold, window_minutes)
VALUES ('settings', TRUE, 5, 5)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for authenticated users" ON alerts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for authenticated users" ON blocked_ips FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable read for authenticated users" ON system_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "Enable write for service_role" ON alerts FOR ALL TO service_role USING (true);
CREATE POLICY "Enable write for service_role" ON blocked_ips FOR ALL TO service_role USING (true);
CREATE POLICY "Enable update for authenticated admins" ON system_config FOR UPDATE TO authenticated USING (true);
