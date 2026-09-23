import http.server
import socketserver
import json
import urllib.parse
import os
import sys

PORT = 8088

# Try importing pymongo and connecting to MongoDB
try:
    from pymongo import MongoClient
    DEFAULT_MONGO_URI = os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/medikiosk_enterprise")
    client = MongoClient(DEFAULT_MONGO_URI, serverSelectionTimeoutMS=2000)
    client.admin.command('ping')
    mongo_db = client.get_database("medikiosk_enterprise")
    is_mongo_active = True
    print("[Mongo GUI Engine] Connected to MongoDB instance at:", DEFAULT_MONGO_URI)
except Exception as err:
    is_mongo_active = False
    client = None
    mongo_db = None
    print("[Mongo GUI Engine] Local MongoDB daemon not active. Running with Edge Mirror Mode.")

# Import SQLite Edge DB as fallback reader so data is always viewable
sys.path.insert(0, os.path.abspath('backend'))
try:
    from config.sqlite_config import execute_query
except Exception:
    execute_query = None

class MongoGUIHandler(http.server.BaseHTTPRequestHandler):
    def _send_json(self, data, status=200):
        body = json.dumps(data, default=str).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        self.wfile.write(body)

    def _send_html(self, filepath):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.end_headers()
            self.wfile.write(content.encode('utf-8'))
        except Exception as e:
            self.send_response(404)
            self.end_headers()
            self.wfile.write(f"File not found: {e}".encode('utf-8'))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_GET(self):
        url = urllib.parse.urlparse(self.path)
        path = url.path
        query = urllib.parse.parse_qs(url.query)

        if path == "/" or path == "/gui":
            return self._send_html("mongo_gui.html")

        if path == "/api/status":
            return self._send_json({
                "status": "ONLINE",
                "isMongoActive": is_mongo_active,
                "mongoUri": os.getenv("MONGO_URI", "mongodb://127.0.0.1:27017/medikiosk_enterprise"),
                "databaseName": "medikiosk_enterprise"
            })

        if path == "/api/collections":
            collections = []
            if is_mongo_active and mongo_db is not None:
                try:
                    cols = mongo_db.list_collection_names()
                    for c in cols:
                        cnt = mongo_db[c].count_documents({})
                        collections.append({"name": c, "count": cnt, "type": "MongoDB Native"})
                except Exception as e:
                    print("Mongo list error:", e)

            # Mirror SQLite tables if Mongo collections are empty or offline
            if execute_query:
                try:
                    tables = ["patients", "local_master_doctors", "kiosk_fleet_status", "offline_queue_tickets"]
                    for t in tables:
                        rows = execute_query(f"SELECT COUNT(*) as c FROM {t}")
                        cnt = rows[0]["c"] if rows else 0
                        if not any(col["name"] == t for col in collections):
                            collections.append({"name": t, "count": cnt, "type": "Edge SQLite Mirror"})
                except Exception:
                    pass

            return self._send_json({"success": True, "collections": collections})

        if path == "/api/documents":
            col_name = query.get("collection", ["patients"])[0]
            search = query.get("search", [""])[0].strip()

            docs = []
            if is_mongo_active and mongo_db is not None and col_name in mongo_db.list_collection_names():
                try:
                    filter_q = {}
                    if search:
                        filter_q = {"$or": [
                            {"full_name": {"$regex": search, "$options": "i"}},
                            {"patient_id": {"$regex": search, "$options": "i"}},
                            {"abha_number": {"$regex": search, "$options": "i"}},
                            {"aadhaar_number": {"$regex": search, "$options": "i"}}
                        ]}
                    cursor = mongo_db[col_name].find(filter_q).limit(100)
                    for d in cursor:
                        if "_id" in d:
                            d["_id"] = str(d["_id"])
                        docs.append(d)
                except Exception as e:
                    print("Mongo fetch error:", e)

            if not docs and execute_query:
                try:
                    table_name = col_name if col_name in ["patients", "local_master_doctors", "kiosk_fleet_status", "offline_queue_tickets"] else "patients"
                    if search:
                        rows = execute_query(f"SELECT * FROM {table_name} WHERE full_name LIKE ? OR patient_id LIKE ? OR abha_number LIKE ? OR aadhaar_number LIKE ? LIMIT 100", 
                                             (f"%{search}%", f"%{search}%", f"%{search}%", f"%{search}%"))
                    else:
                        rows = execute_query(f"SELECT * FROM {table_name} LIMIT 100")
                    docs = rows
                except Exception as e:
                    print("SQLite fetch error:", e)

            return self._send_json({"success": True, "collection": col_name, "count": len(docs), "documents": docs})

        self._send_json({"error": "Not Found"}, status=404)

def run_gui_server():
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("0.0.0.0", PORT), MongoGUIHandler) as httpd:
        print(f"\n=======================================================")
        print(f"  [Mongo GUI] Studio & Data Viewer Online")
        print(f"  URL: http://localhost:{PORT}/gui")
        print(f"=======================================================\n")
        httpd.serve_forever()

if __name__ == "__main__":
    run_gui_server()
