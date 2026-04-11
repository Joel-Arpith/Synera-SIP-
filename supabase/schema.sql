-- CyberIDS Schema Definition

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE blocked_ips;

-- Alerts Table
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
    severity INT,
    proto TEXT,
    payload JSONB
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_alerts_timestamp ON alerts (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_src_ip ON alerts (src_ip);

-- Blocked IPs Table
CREATE TABLE IF NOT EXISTS blocked_ips (
    ip TEXT PRIMARY KEY,
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- RLS Policies
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;

-- Basic Service Role Policy: Can do everything
-- Basic Anon Policy: Read-only for dashboard (if desired, or restrict further)
CREATE POLICY "Enable read for authenticated users" 
ON alerts FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Enable read for authenticated users" 
ON blocked_ips FOR SELECT 
TO authenticated 
USING (true);
