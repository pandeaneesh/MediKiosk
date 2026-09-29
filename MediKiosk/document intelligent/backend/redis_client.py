import json
import logging
import queue
import threading
import time
from typing import Any, Dict, List, Optional
import redis
from backend.config import (
    REDIS_DOC_RESULT_PREFIX,
    REDIS_DOC_STATE_PREFIX,
    REDIS_QUEUE_NAME,
    REDIS_TIMELINE_KEY,
    REDIS_URL,
)

logger = logging.getLogger("MediKiosk.Redis")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")


class EmbeddedRedisStore:
    """Thread-safe in-memory Redis emulator for offline/local environments."""

    def __init__(self):
        self._lock = threading.RLock()
        self._kv: Dict[str, str] = {}
        self._hashes: Dict[str, Dict[str, str]] = {}
        self._queues: Dict[str, queue.Queue] = {}
        self._lists: Dict[str, List[str]] = {}

    def ping(self) -> bool:
        return True

    def rpush(self, name: str, *values: str) -> int:
        with self._lock:
            if name not in self._queues:
                self._queues[name] = queue.Queue()
            if name not in self._lists:
                self._lists[name] = []
            for val in values:
                self._queues[name].put(val)
                self._lists[name].append(val)
            return len(self._lists[name])

    def blpop(self, keys: List[str], timeout: int = 1):
        if isinstance(keys, str):
            keys = [keys]
        deadline = time.time() + timeout
        while time.time() <= deadline:
            for k in keys:
                with self._lock:
                    if k in self._queues and not self._queues[k].empty():
                        val = self._queues[k].get_nowait()
                        if k in self._lists and val in self._lists[k]:
                            self._lists[k].remove(val)
                        return (k, val)
            time.sleep(0.05)
        return None

    def hset(self, name: str, key: Optional[str] = None, value: Optional[str] = None, mapping: Optional[Dict[str, Any]] = None):
        with self._lock:
            if name not in self._hashes:
                self._hashes[name] = {}
            if mapping:
                for k, v in mapping.items():
                    self._hashes[name][str(k)] = str(v)
            if key is not None and value is not None:
                self._hashes[name][str(key)] = str(value)

    def hgetall(self, name: str) -> Dict[str, str]:
        with self._lock:
            return dict(self._hashes.get(name, {}))

    def set(self, name: str, value: str):
        with self._lock:
            self._kv[name] = str(value)

    def get(self, name: str) -> Optional[str]:
        with self._lock:
            return self._kv.get(name)

    def lpush(self, name: str, *values: str) -> int:
        with self._lock:
            if name not in self._lists:
                self._lists[name] = []
            for val in values:
                self._lists[name].insert(0, val)
            return len(self._lists[name])

    def lrange(self, name: str, start: int, end: int) -> List[str]:
        with self._lock:
            items = self._lists.get(name, [])
            if end == -1:
                return list(items[start:])
            return list(items[start : end + 1])

    def delete(self, *names: str):
        with self._lock:
            for n in names:
                self._kv.pop(n, None)
                self._hashes.pop(n, None)
                self._lists.pop(n, None)
                if n in self._queues:
                    # drain queue
                    try:
                        while not self._queues[n].empty():
                            self._queues[n].get_nowait()
                    except Exception:
                        pass


class RedisClient:
    """Singleton-style wrapper that seamlessly uses live Redis or the embedded store."""

    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(RedisClient, cls).__new__(cls)
            cls._instance._init_connection()
        return cls._instance

    def _init_connection(self):
        self.is_live = False
        try:
            r = redis.Redis.from_url(REDIS_URL, decode_responses=True, socket_timeout=1)
            r.ping()
            self.client = r
            self.is_live = True
            logger.info(" Connected to live Redis at %s", REDIS_URL)
        except Exception as ex:
            logger.warning(
                "⚠️ Redis server not available (%s). Activating embedded high-speed Redis queue & store.",
                ex,
            )
            self.client = EmbeddedRedisStore()
            self.is_live = False

    def enqueue_document_task(self, doc_id: str, image_path: str, original_filename: str) -> bool:
        """Pushes document ID and task details into the Redis processing queue."""
        payload = json.dumps({
            "document_id": doc_id,
            "image_path": image_path,
            "original_filename": original_filename,
            "enqueued_at": time.time(),
        })
        self.client.rpush(REDIS_QUEUE_NAME, payload)
        self.update_document_status(
            doc_id=doc_id,
            status="uploaded",
            progress=10,
            stage="Document Uploaded to Redis Queue",
            details="Queued for OpenCV image preprocessing",
        )
        logger.info("[Doc: %s] Enqueued into Redis queue '%s'", doc_id, REDIS_QUEUE_NAME)
        return True

    def pop_document_task(self, timeout: int = 1) -> Optional[Dict[str, Any]]:
        """Blocks for timeout seconds waiting for a document task from Redis queue."""
        res = self.client.blpop([REDIS_QUEUE_NAME], timeout=timeout)
        if not res:
            return None
        _, raw_json = res
        try:
            return json.loads(raw_json)
        except Exception as e:
            logger.error("Failed to parse task payload: %s", e)
            return None

    def update_document_status(
        self,
        doc_id: str,
        status: str,
        progress: int,
        stage: str,
        details: Optional[str] = None,
    ):
        """Updates real-time stage progress in Redis hash medikiosk:doc:{doc_id}:state."""
        key = f"{REDIS_DOC_STATE_PREFIX}{doc_id}:state"
        mapping = {
            "document_id": doc_id,
            "status": status,
            "progress": str(progress),
            "stage": stage,
            "details": details or "",
            "updated_at": str(time.time()),
        }
        self.client.hset(key, mapping=mapping)
        logger.info("[Doc: %s] Redis State -> %s (%d%%) - %s", doc_id, status, progress, stage)

    def get_document_status(self, doc_id: str) -> Dict[str, Any]:
        """Retrieves real-time document progress from Redis."""
        key = f"{REDIS_DOC_STATE_PREFIX}{doc_id}:state"
        data = self.client.hgetall(key)
        if not data:
            return {"status": "not_found", "progress": 0, "stage": "Unknown"}
        if "progress" in data:
            data["progress"] = int(data["progress"])
        return data

    def save_document_result(self, doc_id: str, result_dict: Dict[str, Any]):
        """Caches complete structured document extraction JSON in Redis."""
        key = f"{REDIS_DOC_RESULT_PREFIX}{doc_id}"
        self.client.set(key, json.dumps(result_dict))

    def get_document_result(self, doc_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves cached document intelligence result from Redis."""
        key = f"{REDIS_DOC_RESULT_PREFIX}{doc_id}"
        raw = self.client.get(key)
        if not raw:
            return None
        return json.loads(raw)

    def append_to_timeline(self, event_data: Dict[str, Any]):
        """Appends a synthesized clinical milestone into the global Redis timeline."""
        self.client.rpush(REDIS_TIMELINE_KEY, json.dumps(event_data))

    def get_timeline(self) -> List[Dict[str, Any]]:
        """Fetches all chronological events stored in Redis."""
        raw_items = self.client.lrange(REDIS_TIMELINE_KEY, 0, -1)
        events = []
        for it in raw_items:
            try:
                events.append(json.loads(it))
            except Exception:
                pass
        # Sort chronologically by date if possible
        events.sort(key=lambda x: str(x.get("date", "0000")))
        return events


# Global singleton helper
redis_client = RedisClient()
