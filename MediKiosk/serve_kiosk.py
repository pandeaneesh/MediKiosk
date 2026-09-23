import http.server
import socketserver
import os
import sys
import socket

PORT = 5175
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))

class MediKioskWebHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=PROJECT_ROOT, **kwargs)

    def do_GET(self):
        clean_path = self.path.split("?")[0].split("#")[0]
        if clean_path in ("/", "/index.html", ""):
            self.path = "/standalone_kiosk.html"
        return super().do_GET()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

def run_web_server():
    os.chdir(PROJECT_ROOT)
    socketserver.TCPServer.allow_reuse_address = True
    try:
        hostname = socket.gethostname()
        try:
            local_ip = socket.gethostbyname(hostname)
        except Exception:
            local_ip = "127.0.0.1"

        with socketserver.TCPServer(("0.0.0.0", PORT), MediKioskWebHandler) as httpd:
            print(f"\n====================================================================")
            print(f"       MediKiosk Universal Server LIVE on All Network Interfaces     ")
            print(f"====================================================================")
            print(f" [1] Local PC:        http://localhost:{PORT}")
            print(f" [2] LAN / Wi-Fi:     http://{local_ip}:{PORT}")
            print(f" [3] Any Server / IP: http://0.0.0.0:{PORT} (Accessible by any device)")
            print(f" [4] Direct File:     {os.path.join(PROJECT_ROOT, 'standalone_kiosk.html')}")
            print(f"====================================================================\n")
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping MediKiosk web server...")
    except Exception as e:
        print(f"\n[!] Web server notification: {e}")

if __name__ == "__main__":
    run_web_server()
