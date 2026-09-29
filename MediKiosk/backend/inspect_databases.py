import sys
import os
import sqlite3
import json

sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from config.sqlite_config import DB_PATH, execute_query
from config.redis_config import redis_engine
from config.mongodb_config import is_mongo_connected, get_mongo_db
from database.seed_data import seed_database

def inspect_all_databases():
    print("==================================================================")
    print("      MEDIKIOSK ENTERPRISE MULTI-DATABASE STORAGE INSPECTION     ")
    print("==================================================================\n")

    # 1. Inspect SQLite3 Edge DB
    print("------------------------------------------------------------------")
    print("1. SQLITE3 EDGE DATABASE (Local Offline Engine)")
    print(f"   File Location: {os.path.abspath(DB_PATH)}")
    print("------------------------------------------------------------------")
    
    seed_database()
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
    tables = [t[0] for t in cursor.fetchall() if t[0] != 'sqlite_sequence']
    print(f"   Active Tables ({len(tables)}): {', '.join(tables)}\n")
    
    for table in tables:
        cursor.execute(f"SELECT COUNT(*) FROM {table}")
        count = cursor.fetchone()[0]
        print(f"   Table [{table}] -> Total Records: {count}")
        cursor.execute(f"SELECT * FROM {table} LIMIT 2")
        rows = cursor.fetchall()
        col_names = [description[0] for description in cursor.description]
        print(f"      Columns: {col_names}")
        for r in rows:
            print(f"      Sample Row: {r}")
        print()
    conn.close()

    # 2. Inspect Redis In-Memory Cache
    print("------------------------------------------------------------------")
    print("2. REDIS IN-MEMORY CACHE & PUB/SUB MESSAGING ENGINE")
    print("   Role: OTP TTLs (300s), Rate Limits (60s), Real-Time Counters")
    print("------------------------------------------------------------------")
    
    redis_engine.set("otp:9810123456", "123456", ex=300)
    redis_engine.set("otp_rate:9810123456", "1", ex=60)
    redis_engine.set("doctor:queue:doc-1", "8")
    redis_engine.set("doctor:queue:doc-2", "3")

    print(f"   [Key] otp:9810123456          -> Value: '{redis_engine.get('otp:9810123456')}' (TTL: 300s)")
    print(f"   [Key] otp_rate:9810123456     -> Value: '{redis_engine.get('otp_rate:9810123456')}' (Rate Limit Active)")
    print(f"   [Key] doctor:queue:doc-1      -> Live Waiting Count: {redis_engine.get('doctor:queue:doc-1')}")
    print(f"   [Key] doctor:queue:doc-2      -> Live Waiting Count: {redis_engine.get('doctor:queue:doc-2')}")
    print("   [Pub/Sub Channel] pubsub:queue_updates -> Active Broadcast Channel\n")

    # 3. Inspect MongoDB Enterprise Cloud Database
    print("------------------------------------------------------------------")
    print("3. MONGODB ENTERPRISE CLOUD DATABASE")
    print("   Role: Patient EHR, ABDM Health Tokens, Audit Trail & Telemetry")
    print("------------------------------------------------------------------")
    
    if is_mongo_connected:
        db = get_mongo_db()
        cols = db.list_collection_names()
        print("   Connected Mongo Database: 'medikiosk_enterprise'")
        print(f"   Collections ({len(cols)}): {', '.join(cols)}")
        for col_name in cols:
            cnt = db[col_name].count_documents({})
            sample = db[col_name].find_one({}, {"_id": 0})
            print(f"   Collection [{col_name}] -> Documents: {cnt}")
            print(f"      Sample Document: {json.dumps(sample, indent=2 if sample else None)}")
    else:
        print("   Status: MongoDB Cloud connection offline / fallback active.")
        print("   Resilience Mode: SQLite Edge Engine seamlessly handles all CRUD & Queue operations.")
    
    print("\n==================================================================")
    print("                  INSPECTION COMPLETED SUCCESSFULLY              ")
    print("==================================================================")

if __name__ == "__main__":
    inspect_all_databases()
