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

# Install project dependencies
npm install
pip3 install requests watchdog --break-system-packages

# Download MaxMind GeoLite2 (requires free account + license key)
echo "Download GeoLite2-City.mmdb from:"
echo "https://www.maxmind.com/en/geolite2/signup"
echo "Place it in project root as GeoLite2-City.mmdb"

# Set Suricata permissions
sudo chmod 644 /var/log/suricata/eve.json

# Configure Suricata interface
echo "Edit /etc/suricata/suricata.yaml"
echo "Set your network interface (eth0 or wlan0)"

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
