import os
import json
import time
import requests
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

# Configuration
LOG_PATH = os.getenv("SURICATA_LOG_PATH", "/var/log/suricata/eve.json")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
INGEST_SECRET = os.getenv("INGEST_SECRET")
BACKEND_URL = f"http://localhost:{os.getenv('PORT', '3001')}"

# Supabase Client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

class SuricataLogHandler(FileSystemEventHandler):
    def __init__(self, filename):
        self.filename = filename
        self.file = open(filename, 'r')
        self.file.seek(0, 2)  # Go to end of file

    def on_modified(self, event):
        if event.src_path == self.filename:
            self.process_new_lines()

    def process_new_lines(self):
        while True:
            line = self.file.readline()
            if not line:
                break
            try:
                data = json.loads(line)
                if data.get("event_type") == "alert":
                    self.handle_alert(data)
            except Exception as e:
                print(f"[ERROR] Parsing line: {e}")

    def handle_alert(self, data):
        alert = data.get("alert", {})
        payload = {
            "timestamp": data.get("timestamp"),
            "src_ip": data.get("src_ip"),
            "src_port": data.get("src_port"),
            "dest_ip": data.get("dest_ip"),
            "dest_port": data.get("dest_port"),
            "signature": alert.get("signature"),
            "category": alert.get("category"),
            "severity": alert.get("severity"),
            "proto": data.get("proto"),
            "payload": data
        }

        print(f"[ALERT] {payload['src_ip']} -> {payload['dest_ip']} | {payload['signature']}")

        # Push to Supabase
        try:
            supabase.table("alerts").insert(payload).execute()
        except Exception as e:
            print(f"[ERROR] Pushing to Supabase: {e}")

        # Check for auto-blocking
        if os.getenv("AUTO_BLOCK_ENABLED") == "true":
            self.check_auto_block(payload['src_ip'])

    def check_auto_block(self, ip):
        # Notify backend to handle blocking logic
        try:
            requests.post(
                f"{BACKEND_URL}/block",
                json={"ip": ip, "reason": "Suricata Alert Threshold Reached"},
                headers={"x-ingest-secret": INGEST_SECRET},
                timeout=5
            )
        except Exception as e:
            print(f"[ERROR] Contacting backend for blocking: {e}")

if __name__ == "__main__":
    if not os.path.exists(LOG_PATH):
        print(f"[WAIT] Waiting for log file at {LOG_PATH}...")
        while not os.path.exists(LOG_PATH):
            time.sleep(1)

    print(f"[START] Tailing Suricata logs: {LOG_PATH}")
    
    event_handler = SuricataLogHandler(LOG_PATH)
    observer = Observer()
    observer.schedule(event_handler, path=os.path.dirname(LOG_PATH), recursive=False)
    observer.start()

    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()
