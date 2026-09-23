import logging
import sys
import threading
import time
import uvicorn
from backend.api.server import app
from backend.redis_client import redis_client
from backend.workers.pipeline_worker import start_worker

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)

logger = logging.getLogger("MediKiosk.Launcher")


def main():
    print("=" * 70)
    print(" [MEDIKIOSK MEDICAL DOCUMENT INTELLIGENCE (MDI) SYSTEM] ")
    print("=" * 70)
    print(f" * Mode: {'Live Redis Server' if redis_client.is_live else 'Embedded High-Speed Redis Queue'}")
    print(" * OCR Engine: RapidOCR (PaddleOCR ONNX Runtime)")
    print(" * Image Preprocessing: OpenCV (Deskew, 1.5x Rescale, Otsu threshold)")
    print(" * Medical AI: Entity Extraction + Anti-Hallucination Guard")
    print(" * Web Interface: http://localhost:8000")
    print("=" * 70)

    # Start Redis Pipeline Worker in daemon thread
    stop_event = threading.Event()
    worker_thread = threading.Thread(
        target=start_worker,
        args=(stop_event,),
        daemon=True,
        name="RedisWorkerThread",
    )
    worker_thread.start()
    logger.info(" Background Redis Worker Thread started.")

    # Start FastAPI Web Server via Uvicorn
    try:
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=8000,
            log_level="info",
        )
    except KeyboardInterrupt:
        logger.info("Shutting down MediKiosk server...")
        stop_event.set()
        time.sleep(0.5)


if __name__ == "__main__":
    main()
