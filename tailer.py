#!/usr/bin/env python3
"""
Suricata eve.json tailer — inotify-based, handles log rotation.
Normalises severity and retries failed POSTs.
"""

import os
import sys
import json
import time
import requests
import inotify.adapters
import inotify.constants
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

LOG_PATH      = os.getenv("SURICATA_LOG_PATH", "/var/log/suricata/eve.json")
BACKEND_URL   = f"http://localhost:{os.getenv('PORT', '3001')}/api/ingest"
INGEST_SECRET = os.getenv("INGEST_SECRET", "")
LOG_DIR       = str(Path(LOG_PATH).parent)
LOG_FILE      = Path(LOG_PATH).name

# Suricata numeric severity → named level
SEVERITY_MAP = {"1": "critical", "2": "high", "3": "medium", "4": "low"}


def normalize_severity(raw):
    if raw is None:
        return "low"
    s = str(raw).strip()
    return SEVERITY_MAP.get(s, s.lower() if s.lower() in SEVERITY_MAP.values() else "low")


def send_alert(alert: dict, retries: int = 3):
    for attempt in range(1, retries + 1):
        try:
            resp = requests.post(
                BACKEND_URL,
                json=alert,
                headers={"x-ingest-secret": INGEST_SECRET},
                timeout=5,
            )
            if resp.status_code == 200:
                return
            print(f"[tailer] Backend {resp.status_code}: {resp.text[:120]}", file=sys.stderr)
        except Exception as e:
            print(f"[tailer] Send error (attempt {attempt}/{retries}): {e}", file=sys.stderr)
        if attempt < retries:
            time.sleep(attempt * 0.5)


def process_line(line: str):
    line = line.strip()
    if not line:
        return
    try:
        event = json.loads(line)
    except json.JSONDecodeError:
        return

    if event.get("event_type") != "alert":
        return

    alert_meta = event.get("alert", {})
    src_ip     = event.get("src_ip")
    signature  = alert_meta.get("signature")

    # Drop if missing required fields
    if not src_ip or not signature:
        return

    payload = {
        "timestamp":  event.get("timestamp"),
        "src_ip":     src_ip,
        "src_port":   event.get("src_port"),
        "dest_ip":    event.get("dest_ip"),
        "dest_port":  event.get("dest_port"),
        "proto":      event.get("proto"),
        "in_iface":   event.get("in_iface"),
        "signature":  signature,
        "severity":   normalize_severity(alert_meta.get("severity")),
        "category":   alert_meta.get("category"),
        "action":     alert_meta.get("action"),
        "payload":    event,   # full raw event stored for reference
    }

    # Include TLS/HTTP/DNS metadata when present
    for key in ("tls", "http", "dns", "app_proto"):
        if key in event:
            payload[key] = event[key]

    send_alert(payload)


def tail_file():
    print(f"[tailer] Watching {LOG_PATH}")

    while not os.path.exists(LOG_PATH):
        print("[tailer] Waiting for log file...")
        time.sleep(2)

    inot = inotify.adapters.Inotify()
    inot.add_watch(
        LOG_DIR,
        inotify.constants.IN_CREATE | inotify.constants.IN_MOVED_TO,
    )
    inot.add_watch(
        LOG_PATH,
        inotify.constants.IN_MODIFY      |
        inotify.constants.IN_CLOSE_WRITE |
        inotify.constants.IN_DELETE_SELF |
        inotify.constants.IN_MOVE_SELF,
    )

    fh = open(LOG_PATH, "r")
    fh.seek(0, 2)  # seek to end — don't replay old events on start
    print("[tailer] Started")

    try:
        for event in inot.event_gen(yield_nones=False):
            (_, type_names, path, filename) = event

            if "IN_MODIFY" in type_names:
                for line in fh:
                    process_line(line)

            elif any(t in type_names for t in ("IN_DELETE_SELF", "IN_MOVE_SELF", "IN_CLOSE_WRITE")):
                print("[tailer] Rotation detected — reopening")
                fh.close()
                time.sleep(0.5)
                while not os.path.exists(LOG_PATH):
                    time.sleep(0.5)
                fh = open(LOG_PATH, "r")
                inot.add_watch(
                    LOG_PATH,
                    inotify.constants.IN_MODIFY      |
                    inotify.constants.IN_DELETE_SELF |
                    inotify.constants.IN_MOVE_SELF,
                )
                print("[tailer] Reopened")

            elif "IN_CREATE" in type_names and filename == LOG_FILE:
                print("[tailer] New log file — switching")
                fh.close()
                time.sleep(0.3)
                fh = open(LOG_PATH, "r")

    except KeyboardInterrupt:
        print("[tailer] Stopped")
    finally:
        fh.close()


if __name__ == "__main__":
    while True:
        try:
            tail_file()
        except Exception as e:
            print(f"[tailer] Crashed: {e} — restarting in 3s", file=sys.stderr)
            time.sleep(3)
