from typing import Dict, Any
from config.sqlite_config import execute_query
from config.mongodb_config import is_mongo_connected, get_mongo_db

class TelemetryAnalyticsEngine:
    @staticmethod
    def get_command_center_telemetry() -> Dict[str, Any]:
        doctors = execute_query("SELECT * FROM local_master_doctors")
        kiosks = execute_query("SELECT * FROM kiosk_fleet_status")
        
        doctor_list = []
        for d in doctors:
            doctor_list.append({
                "id": d["doctor_id"],
                "doctorId": d["doctor_id"],
                "name": d["name"],
                "degrees": d["degrees"],
                "specialty": d["specialty"],
                "department": d["department"],
                "roomNumber": d["room_number"],
                "status": d["status"],
                "patientsSeen": d["patients_seen"],
                "waitingCount": d["waiting_count"],
                "shift": d["shift"]
            })
            
        kiosk_list = []
        for k in kiosks:
            kiosk_list.append({
                "id": k["kiosk_id"],
                "kioskId": k["kiosk_id"],
                "location": k["location"],
                "status": k["status"],
                "paperLevel": k["paper_level"],
                "biometricStatus": k["biometric_status"],
                "touchscreen": k["touchscreen_status"],
                "todayRegistrations": k["today_registrations"],
                "latency": f"{k['latency_ms']}ms"
            })
            
        total_waiting = sum(d["waitingCount"] for d in doctor_list)
        total_seen = sum(d["patientsSeen"] for d in doctor_list)
        
        return {
            "totalPatientsToday": total_waiting + total_seen,
            "activeWaitingQueue": total_waiting,
            "totalCompletedVisits": total_seen,
            "onlineKiosksCount": len([k for k in kiosk_list if k["status"] == "Online"]),
            "doctors": doctor_list,
            "kiosks": kiosk_list
        }
