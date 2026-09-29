import time
import json
import os

class PythonInMemoryRedisMock:
    def __init__(self):
        self.store = {}
        self.subscribers = {}

    def get(self, key: str):
        item = self.store.get(key)
        if not item:
            return None
        if item["expires_at"] and time.time() > item["expires_at"]:
            del self.store[key]
            return None
        return item["value"]

    def set(self, key: str, value, ex: int = None):
        expires_at = time.time() + ex if ex else None
        self.store[key] = {"value": str(value), "expires_at": expires_at}
        return True

    def delete(self, key: str):
        return 1 if self.store.pop(key, None) else 0

    def incr(self, key: str):
        current = int(self.get(key) or "0")
        nxt = current + 1
        self.set(key, nxt)
        return nxt

    def decr(self, key: str):
        current = int(self.get(key) or "0")
        nxt = max(0, current - 1)
        self.set(key, nxt)
        return nxt

    def publish(self, channel: str, message):
        msg_str = json.dumps(message) if isinstance(message, dict) else str(message)
        listeners = self.subscribers.get(channel, [])
        for cb in listeners:
            cb(msg_str)
        return len(listeners)

redis_engine = None

try:
    import redis
    redis_host = os.getenv("REDIS_HOST", "127.0.0.1")
    redis_port = int(os.getenv("REDIS_PORT", "6379"))
    client = redis.Redis(host=redis_host, port=redis_port, socket_timeout=1, decode_responses=True)
    client.ping()
    print("[Redis Engine] Connected to live Redis Server.")
    redis_engine = client
except Exception:
    redis_engine = PythonInMemoryRedisMock()
