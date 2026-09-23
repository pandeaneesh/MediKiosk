from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
import sys

sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from routes.patient_routes import router as patient_router
from routes.doctor_routes import router as doctor_router
from routes.admin_routes import router as admin_router
from database.seed_data import seed_database

app = FastAPI(
    title="MediKiosk ABDM 2.0 Python Enterprise Core",
    description="Python FastAPI backend powering MediKiosk patient login, OPD queuing, doctor rooms, and admin telemetry.",
    version="1.0.0"
)

# Enable CORS for React Frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Router Modules
app.include_router(patient_router)
app.include_router(doctor_router)
app.include_router(admin_router)

@app.on_event("startup")
def startup_event():
    print("\n=======================================================")
    print("[MediKiosk Enterprise Engine] Starting Python Core Backend...")
    print("Serving ABDM 2.0 Patient Kiosk, Doctor OPD & Admin Console")
    print("=======================================================\n")
    try:
        seed_database()
    except Exception as e:
        print("Startup seed warning:", e)

@app.get("/")
def root():
    return {
        "status": "ONLINE",
        "service": "MediKiosk ABDM 2.0 Python Core Engine",
        "version": "1.0.0",
        "architecture": "Python (FastAPI + Pydantic) + Redis + MongoDB + SQLite3 Edge"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
