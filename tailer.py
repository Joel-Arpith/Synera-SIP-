import os
import json
import time
import requests
import subprocess
import signal
import sys
from dotenv import load_dotenv

load_dotenv()

# Configuration
LOG_PATH = os.getenv("SURICATA_LOG_PATH", "/var/log/suricata/eve.json")
BACKEND_URL = f"http://localhost:{os.getenv('PORT', '3001')}/api/ingest"
INGEST_SECRET = os.getenv("INGEST_SECRET")

def tail_suricata_logs():
    print(f"[START] Monitoring Suricata logs: {LOG_PATH}")
    
    # Use tail -F to handle log rotation gracefully
    cmd = ["tail", "-n", "0", "-F", LOG_PATH]
    
    try:
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        
        while True:
            line = process.stdout.readline()
            if not line:
                if process.poll() is not None:
                    break
                continue
                
            try:
                data = json.loads(line)
                if data.get("event_type") == "alert":
                    process_alert(data)
            except json.JSONDecodeError:
                continue
            except Exception as e:
                print(f"[ERROR] {e}")

    except KeyboardInterrupt:
        print("\n[STOP] Shutting down tailer...")
        process.terminate()
    except Exception as e:
        print(f"[FATAL] {e}")
        sys.exit(1)

def process_alert(data):
    alert_info = data.get("alert", {})
    
    # Standardize data for backend ingestion
    payload = {
        "timestamp": data.get("timestamp"),
        "src_ip": data.get("src_ip"),
        "src_port": data.get("src_port"),
        "dest_ip": data.get("dest_ip"),
        "dest_port": data.get("dest_port"),
        "proto": data.get("proto"),
        "signature": alert_info.get("signature"),
        "severity": str(alert_info.get("severity")),
        "category": alert_info.get("category"),
        "payload": data
    }

    try:
        response = requests.post(
            BACKEND_URL,
            json=payload,
            headers={"x-ingest-secret": INGEST_SECRET},
            timeout=5
        )
        if response.status_code == 200:
            status = response.json().get("status")
            if status == "suppressed":
                print(f"[SUPPRESSED] {payload['src_ip']} -> {payload['signature']}")
            else:
                print(f"[INGESTED] {payload['src_ip']} -> {payload['signature']}")
        else:
            print(f"[ERROR] Backend returned {response.status_code}")
    except Exception as e:
        print(f"[ERROR] Failed to send to backend: {e}")

if __name__ == "__main__":
    if not os.path.exists(LOG_PATH):
        print(f"[WAIT] Waiting for log file at {LOG_PATH}...")
        # Ensure directory exists for tail -F to watch
        log_dir = os.path.dirname(LOG_PATH)
        if not os.path.exists(log_dir):
            os.makedirs(log_dir, exist_ok=True)
        # Create dummy file if it doesn't exist to prevent tail error
        with open(LOG_PATH, 'a'):
            os.utime(LOG_PATH, None)

    tail_suricata_logs()
