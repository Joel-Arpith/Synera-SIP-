#!/usr/bin/env python3
"""
Robust Suricata log tailer using inotify.
Handles log rotation, file deletion, re-creation.
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

LOG_PATH = os.getenv(
  "SURICATA_LOG_PATH", 
  "/var/log/suricata/eve.json"
)
BACKEND_URL = f"http://localhost:{os.getenv('PORT', '3001')}/api/ingest"
INGEST_SECRET = os.getenv("INGEST_SECRET", "")
LOG_DIR = str(Path(LOG_PATH).parent)
LOG_FILE = str(Path(LOG_PATH).name)


def send_alert(alert: dict):
  try:
    requests.post(
      BACKEND_URL,
      json=alert,
      headers={"x-ingest-secret": INGEST_SECRET},
      timeout=5
    )
  except Exception as e:
    print(f"[tailer] Send error: {e}", file=sys.stderr)


def process_line(line: str):
  line = line.strip()
  if not line:
    return
  try:
    parsed = json.loads(line)
    if parsed.get("event_type") == "alert":
      # Standardize fields for backend
      alert_info = parsed.get("alert", {})
      payload = {
        "timestamp": parsed.get("timestamp"),
        "src_ip": parsed.get("src_ip"),
        "src_port": parsed.get("src_port"),
        "dest_ip": parsed.get("dest_ip"),
        "dest_port": parsed.get("dest_port"),
        "proto": parsed.get("proto"),
        "signature": alert_info.get("signature"),
        "severity": str(alert_info.get("severity")),
        "category": alert_info.get("category"),
        "payload": parsed
      }
      send_alert(payload)
  except json.JSONDecodeError:
    pass  # skip malformed lines


def tail_file():
  print(f"[tailer] Watching {LOG_PATH}")
  
  # Wait for file to exist
  while not os.path.exists(LOG_PATH):
    print("[tailer] Waiting for log file...")
    time.sleep(2)

  inotify_instance = inotify.adapters.Inotify()
  
  # Watch both the file and directory
  # Directory watch catches log rotation (new file creation)
  inotify_instance.add_watch(
    LOG_DIR,
    inotify.constants.IN_CREATE | 
    inotify.constants.IN_MOVED_TO
  )
  inotify_instance.add_watch(
    LOG_PATH,
    inotify.constants.IN_MODIFY |
    inotify.constants.IN_CLOSE_WRITE |
    inotify.constants.IN_DELETE_SELF |
    inotify.constants.IN_MOVE_SELF
  )

  file_handle = open(LOG_PATH, "r")
  file_handle.seek(0, 2)  # seek to end

  print("[tailer] Tailing started")

  try:
    for event in inotify_instance.event_gen(yield_nones=False):
      (_, type_names, path, filename) = event

      # File modified — read new lines
      if "IN_MODIFY" in type_names:
        for line in file_handle:
          process_line(line)

      # File rotated or deleted — reopen
      elif any(t in type_names for t in [
        "IN_DELETE_SELF", 
        "IN_MOVE_SELF",
        "IN_CLOSE_WRITE"
      ]):
        print("[tailer] Log rotation detected, reopening")
        file_handle.close()
        time.sleep(1)
        
        # Wait for new file
        while not os.path.exists(LOG_PATH):
          time.sleep(0.5)
        
        file_handle = open(LOG_PATH, "r")
        inotify_instance.add_watch(
          LOG_PATH,
          inotify.constants.IN_MODIFY |
          inotify.constants.IN_DELETE_SELF |
          inotify.constants.IN_MOVE_SELF
        )
        print("[tailer] Reopened successfully")

      # New file created in dir (rotation variant)
      elif "IN_CREATE" in type_names and filename == LOG_FILE:
        print("[tailer] New log file created, switching")
        file_handle.close()
        time.sleep(0.5)
        file_handle = open(LOG_PATH, "r")

  except KeyboardInterrupt:
    print("[tailer] Stopped")
  finally:
    file_handle.close()


if __name__ == "__main__":
  # Auto-restart on crash
  while True:
    try:
      tail_file()
    except Exception as e:
      print(f"[tailer] Crashed: {e}. Restarting in 3s")
      time.sleep(3)
