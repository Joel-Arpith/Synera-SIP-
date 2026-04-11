#!/bin/bash
set -e

echo "=== CyberIDS Setup Script ==="

# System update
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Python3 + pip
sudo apt install -y python3 python3-pip

# Install Suricata
sudo apt install -y suricata
sudo suricata-update

# Enable promiscuous mode (see all LAN traffic)
sudo ip link set eth0 promisc on

# Persist across reboots via systemd
sudo bash -c 'cat > /etc/systemd/system/promisc.service << EOF
[Unit]
Description=Enable promiscuous mode on eth0
After=network.target

[Service]
Type=oneshot
ExecStart=/sbin/ip link set eth0 promisc on
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF'

sudo systemctl enable promisc
sudo systemctl start promisc

# Enable Emerging Threats open ruleset (40,000+ signatures)
sudo suricata-update enable-source et/open
sudo suricata-update
sudo systemctl restart suricata

# Install project dependencies
npm install express cors dotenv @supabase/supabase-js geoip-lite
pip3 install requests watchdog python-dotenv inotify --break-system-packages

# Download MaxMind GeoLite2 (requires free account + license key)
echo "Download GeoLite2-City.mmdb from:"
echo "https://www.maxmind.com/en/geolite2/signup"
echo "Place it in project root as GeoLite2-City.mmdb"

# Set Suricata permissions
sudo chmod 644 /var/log/suricata/eve.json

# Configure Suricata interface
echo "Edit /etc/suricata/suricata.yaml"
echo "Set your network interface (eth0 or wlan0)"

# Enable IPv6 monitoring
sudo sed -i 's/af-packet:/af-packet:\n  - interface: eth0\n    address-family: AF_INET6/' \
  /etc/suricata/suricata.yaml

Also add to the HOME_NET variable in suricata.yaml:
sudo sed -i 's|HOME_NET: "\[192.168.0.0/16.*\]"|HOME_NET: "[192.168.0.0/16,10.0.0.0/8,172.16.0.0/12,::/0]"|' \
  /etc/suricata/suricata.yaml

# Enable JA3
sudo sed -i 's/ja3-fingerprints: no/ja3-fingerprints: yes/' \
  /etc/suricata/suricata.yaml

# Enable extended TLS logs
sudo python3 - << 'PYEOF'
import re

config_path = "/etc/suricata/suricata.yaml"
with open(config_path, "r") as f:
    content = f.read()

tls_block = """      - tls:
          extended: yes
          fingerprint: yes
          ja3: yes"""

content = content.replace(
    "      - tls:\n          extended: yes",
    tls_block
)

with open(config_path, "w") as f:
    f.write(content)
PYEOF

# Register custom rules with Suricata
echo "rule-files:" >> /etc/suricata/suricata.yaml
echo "  - /home/pi/cyber-ids/supabase/custom.rules" >> \
  /etc/suricata/suricata.yaml
sudo systemctl restart suricata

# Setup iptables persistence
sudo apt install -y iptables-persistent

# Create systemd service for backend
sudo bash -c 'cat > /etc/systemd/system/cyberids.service << EOF
[Unit]
Description=CyberIDS Backend Service
After=network.target

[Service]
WorkingDirectory=/home/pi/cyber-ids
ExecStart=/usr/bin/node server.js
Restart=always
User=root
EnvironmentFile=/home/pi/cyber-ids/.env

[Install]
WantedBy=multi-user.target
EOF'

# Create systemd service for Python log tailer
sudo bash -c 'cat > /etc/systemd/system/cyberids-tailer.service << EOF
[Unit]
Description=CyberIDS Suricata Log Tailer
After=cyberids.service

[Service]
WorkingDirectory=/home/pi/cyber-ids
ExecStart=/usr/bin/python3 tailer.py
Restart=always
User=root
EnvironmentFile=/home/pi/cyber-ids/.env

[Install]
WantedBy=multi-user.target
EOF'

sudo systemctl daemon-reload
sudo systemctl enable cyberids cyberids-tailer suricata

echo ""
echo "=== Setup Complete ==="
echo "1. Configure your Supabase project with /supabase/schema.sql"
echo "2. cp .env.example .env && nano .env"
echo "3. sudo systemctl start suricata cyberids cyberids-tailer"
