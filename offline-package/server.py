#!/usr/bin/env python3
"""Local launcher for Python Academy Offline."""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import os
import threading
import webbrowser

ROOT = Path(__file__).resolve().parent / "app"
os.chdir(ROOT)


class AcademyHandler(SimpleHTTPRequestHandler):
    extensions_map = {
        **SimpleHTTPRequestHandler.extensions_map,
        ".wasm": "application/wasm",
        ".mjs": "text/javascript",
        ".webmanifest": "application/manifest+json",
    }

    def log_message(self, format, *args):
        return


server = ThreadingHTTPServer(("127.0.0.1", 0), AcademyHandler)
url = f"http://127.0.0.1:{server.server_port}/"
threading.Timer(0.6, lambda: webbrowser.open(url)).start()
print(f"Python Academy Offline is running at {url}")
print("Keep this window open. Press Ctrl+C to stop.")
try:
    server.serve_forever()
except KeyboardInterrupt:
    pass
finally:
    server.server_close()
