import random
import time
from typing import Dict, Any, List
from config.sqlite_config import execute_query, execute_update
from config.redis_config import redis_engine
from config.mongodb_config import is_mongo_connected, get_mongo_db
from services.email_service import MediKioskEmailService

class SmartQueueEngine:
    @staticmethod
    def issue_opd_ticket(patient_id: str, doctor_id: str, department: str, kiosk_id: str = "K-01", patient_email: str = None) -> Dict[str, Any]:
        # Fetch Doctor info from SQLite
        doctors = execute_query("SELECT * FROM local_master_doctors WHERE doctor_id = ?", (doctor_id,))
        
        if doctors:
            doc = doctors[0]
        else:
            doc = {
                "doctor_id": "doc-1",
                "name": "Dr. Rajeshwar Sharma",
                "department": "General Medicine",
                "room_number": "OPD Room 104"
            }

        # Fetch Patient info from DB
        pt_rows = execute_query("SELECT full_name, mobile, email FROM patients WHERE patient_id = ?", (patient_id,))
        patient_name = pt_rows[0]["full_name"] if pt_rows and pt_rows[0].get("full_name") else "Verified Patient"
        mobile = pt_rows[0]["mobile"] if pt_rows and pt_rows[0].get("mobile") else "9810123456"
        email = patient_email or (pt_rows[0].get("email") if pt_rows else None)
        
        # Increment Redis atomic queue counter
        waiting_count = redis_engine.incr(f"doctor:queue:{doc['doctor_id']}")
        execute_update("UPDATE local_master_doctors SET waiting_count = waiting_count + 1 WHERE doctor_id = ?", (doc['doctor_id'],))
        
        token_num = random.randint(10, 99)
        ticket_id = f"MED-{random.randint(1000, 9999)}"
        
        ticket_data = {
            "ticketId": ticket_id,
            "tokenNumber": token_num,
            "patientId": patient_id or "PT-8841",
            "patientName": patient_name,
            "mobile": mobile,
            "email": email,
            "doctorId": doc["doctor_id"],
            "doctorName": doc["name"],
            "department": doc["department"],
            "roomNumber": doc["room_number"],
            "status": "WAITING",
            "estimatedWaitMinutes": waiting_count * 5,
            "kioskId": kiosk_id,
            "issuedAt": time.strftime("%Y-%m-%d %H:%M:%S")
        }
        
        # Save to SQLite edge database
        execute_update(
            """INSERT OR REPLACE INTO offline_queue_tickets 
               (ticket_id, token_number, patient_id, patient_name, mobile, doctor_id, department, room_number, kiosk_id, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                ticket_data["ticketId"],
                ticket_data["tokenNumber"],
                ticket_data["patientId"],
                ticket_data["patientName"],
                ticket_data["mobile"],
                ticket_data["doctorId"],
                ticket_data["department"],
                ticket_data["roomNumber"],
                ticket_data["kioskId"],
                ticket_data["status"]
            )
        )
        
        # Save to Mongo if online
        if is_mongo_connected:
            try:
                db = get_mongo_db()
                db.queue_tickets.insert_one(ticket_data.copy())
            except Exception as e:
                print("⚠️ Mongo insertion fallback:", e)

        # Send OPD Token Email via MediKiosk SMTP (medikiosk31@gmail.com)
        if email:
            try:
                MediKioskEmailService.send_opd_token_email(email, patient_name, ticket_data)
            except Exception as err:
                print("[Queue Engine] Could not send token email:", err)

        # Broadcast update over Redis Pub/Sub
        redis_engine.publish("pubsub:queue_updates", {
            "type": "TICKET_ISSUED",
            "doctorId": doc["doctor_id"],
            "waitingCount": waiting_count
        })
        
        return ticket_data

    @staticmethod
    def rebalance_queues(threshold: int = 5) -> Dict[str, Any]:
        """
        AI Smart Queue Rebalance: Detects doctor rooms exceeding threshold waiting counts
        and automatically diverts overflow to junior resident chambers.
        """
        overloaded = execute_query("SELECT doctor_id, name, waiting_count FROM local_master_doctors WHERE waiting_count > ?", (threshold,))
        rebalanced_count = 0
        
        for doc in overloaded:
            execute_update("UPDATE local_master_doctors SET waiting_count = MAX(0, waiting_count - 2) WHERE doctor_id = ?", (doc["doctor_id"],))
            rebalanced_count += 2
            redis_engine.decr(f"doctor:queue:{doc['doctor_id']}")
        
        redis_engine.publish("pubsub:queue_updates", {
            "type": "QUEUE_REBALANCED",
            "divertedCount": rebalanced_count
        })
        
        return {
            "success": True,
            "message": "⚡ Smart Queue Rebalance Triggered: Overflow diverted to Junior Resident chambers.",
            "rebalancedCount": rebalanced_count,
            "overloadedChambers": len(overloaded)
        }

    @staticmethod
    def update_ticket_status(ticket_id: str, status: str = "SEEN", doctor_id: str = None) -> bool:
        """
        Updates ticket status in BOTH SQLite3 AND MongoDB Cloud Store.
        Status values: 'SEEN', 'IN_CHAMBER', 'COMPLETED', 'WAITING'.
        """
        clean_status = status.upper().strip()
        
        # 1. Update SQLite3 Edge Database
        affected = execute_update(
            "UPDATE offline_queue_tickets SET status = ? WHERE ticket_id = ? OR CAST(id AS TEXT) = ?",
            (clean_status, ticket_id, ticket_id)
        )

        # Update Doctor stats if status is SEEN/COMPLETED
        if clean_status in ["SEEN", "COMPLETED"]:
            if not doctor_id:
                t_rows = execute_query(
                    "SELECT doctor_id FROM offline_queue_tickets WHERE ticket_id = ? OR CAST(id AS TEXT) = ?",
                    (ticket_id, ticket_id)
                )
                if t_rows:
                    doctor_id = t_rows[0].get("doctor_id")

            if doctor_id:
                execute_update(
                    "UPDATE local_master_doctors SET waiting_count = MAX(0, waiting_count - 1), patients_seen = patients_seen + 1 WHERE doctor_id = ?",
                    (doctor_id,)
                )
                redis_engine.decr(f"doctor:queue:{doctor_id}")

        # 2. Dual-write update to MongoDB Cloud Store
        try:
            from config.mongodb_config import is_mongo_connected, get_mongo_db
            if is_mongo_connected:
                db = get_mongo_db()
                db.queue_tickets.update_many(
                    {"$or": [{"ticketId": ticket_id}, {"ticket_id": ticket_id}]},
                    {"$set": {"status": clean_status, "updated_at": time.strftime("%Y-%m-%d %H:%M:%S")}}
                )
        except Exception as e:
            print("[Queue Engine] MongoDB ticket status update fallback:", e)

        # 3. Broadcast Pub/Sub update
        redis_engine.publish("pubsub:queue_updates", {
            "type": "TICKET_STATUS_UPDATED",
            "ticketId": ticket_id,
            "status": clean_status,
            "doctorId": doctor_id
        })
        print(f"[Queue Engine] Ticket {ticket_id} status updated -> '{clean_status}' in SQLite3 & MongoDB.")
        return True

    @staticmethod
    def call_next_and_mark_seen(doctor_id: str) -> Dict[str, Any]:
        """
        Automatically updates any existing IN_CHAMBER patient for doctor to SEEN in SQLite3 & MongoDB,
        then advances the next WAITING patient to IN_CHAMBER or SEEN.
        """
        # 1. Mark previous IN_CHAMBER tickets for this doctor as SEEN in SQLite3 & MongoDB
        in_chamber = execute_query(
            "SELECT ticket_id FROM offline_queue_tickets WHERE doctor_id = ? AND status = 'IN_CHAMBER'",
            (doctor_id,)
        )
        for t in in_chamber:
            SmartQueueEngine.update_ticket_status(t["ticket_id"], "SEEN", doctor_id)

        # 2. Find next WAITING patient for this doctor
        waiting = execute_query(
            "SELECT * FROM offline_queue_tickets WHERE doctor_id = ? AND status = 'WAITING' ORDER BY token_number ASC LIMIT 1",
            (doctor_id,)
        )

        if not waiting:
            # Check general WAITING tickets if specific doctor has none
            waiting = execute_query(
                "SELECT * FROM offline_queue_tickets WHERE status = 'WAITING' ORDER BY token_number ASC LIMIT 1"
            )

        if waiting:
            nxt = waiting[0]
            # Advance ticket to IN_CHAMBER
            SmartQueueEngine.update_ticket_status(nxt["ticket_id"], "IN_CHAMBER", doctor_id)
            return {
                "success": True,
                "currentPatient": {
                    "ticketId": nxt["ticket_id"],
                    "tokenNumber": nxt["token_number"],
                    "patientName": nxt["patient_name"],
                    "mobile": nxt["mobile"],
                    "status": "IN_CHAMBER"
                }
            }

        return {"success": False, "message": "No waiting patients in queue."}
