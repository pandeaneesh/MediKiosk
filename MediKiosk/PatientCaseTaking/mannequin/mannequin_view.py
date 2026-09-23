"""
Master 3D Pain Localization Viewport
Clean Hospital Light Mode UI with Live HUD and In-Place Confirmations.
"""

import sys
import json
from datetime import datetime
from pathlib import Path
import pyvista as pv
from pyvistaqt import QtInteractor
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, 
    QHBoxLayout, QPushButton, QLabel, QFrame
)
from PySide6.QtCore import Qt, Signal

from mannequin.config import CAMERA_TARGETS
from mannequin.model_loader import HumanModelLoader
from mannequin.region_detector import AnatomicalRegionDetector
from mannequin.diagram_widget import RegionalDiagramWidget


class PainLocalizationMannequin(QWidget):
    pain_confirmed = Signal(dict)

    def __init__(self, patient_gender="male", patient_id="PT-NEW", api_base_url="http://127.0.0.1:8000", parent=None):
        super().__init__(parent)
        self.patient_gender = patient_gender.strip().lower()
        self.patient_id = patient_id.strip() if patient_id else "PT-NEW"
        self.api_base_url = api_base_url.rstrip("/") if api_base_url else "http://127.0.0.1:8000"
        self.models_dir = Path(__file__).resolve().parent / "models"

        self.mesh = None
        self.body_actor = None
        self.pain_actor = None
        self.highlight_actor = None
        self.detector = None
        self.current_region_key = None
        self.current_selection = None

        self.loader = HumanModelLoader(self.models_dir)
        self.init_ui()
        self.load_patient_model()

    def init_ui(self):
        main_layout = QHBoxLayout(self)
        main_layout.setContentsMargins(20, 20, 20, 20)
        main_layout.setSpacing(20)

        # -------------------------------------------------------------
        # LEFT: 3D Immersive Viewport & HUD
        # -------------------------------------------------------------
        left_container = QVBoxLayout()
        left_container.setSpacing(14)

        # Floating Modern HUD Bar (MediKiosk Brand Aligned)
        hud_bar = QFrame()
        hud_bar.setStyleSheet("""
            QFrame {
                background-color: #FFFFFF;
                border: 1.5px solid #BFDBFE;
                border-radius: 18px;
                padding: 10px 18px;
            }
        """)
        hud_layout = QHBoxLayout(hud_bar)
        hud_layout.setContentsMargins(0, 0, 0, 0)
        hud_layout.setSpacing(12)

        # Brand Title + ABDM Badge
        brand_label = QLabel("MediKiosk")
        brand_label.setStyleSheet("color: #020617; font-size: 16px; font-weight: 900; letter-spacing: -0.3px;")
        hud_layout.addWidget(brand_label)

        abdm_badge = QLabel("ABDM 2.0")
        abdm_badge.setStyleSheet("""
            background-color: #2563EB;
            color: #FFFFFF;
            font-size: 10px;
            font-weight: 800;
            padding: 3px 8px;
            border-radius: 9999px;
        """)
        hud_layout.addWidget(abdm_badge)

        # Live Session Indicator Pill
        status_dot = QLabel("● Station #01 Live")
        status_dot.setStyleSheet("""
            background-color: #ECFDF5;
            color: #047857;
            font-size: 12px;
            font-weight: 800;
            padding: 6px 12px;
            border-radius: 10px;
            border: 1.5px solid #A7F3D0;
        """)
        hud_layout.addWidget(status_dot)

        # Patient Badge
        badge_gender = f"👨 Male ({self.patient_id})" if self.patient_gender == "male" else f"👩 Female ({self.patient_id})"
        lbl_patient = QLabel(badge_gender)
        lbl_patient.setStyleSheet("""
            background-color: #EFF6FF;
            color: #1D4ED8;
            font-size: 12px;
            font-weight: 800;
            padding: 6px 14px;
            border-radius: 10px;
            border: 1.5px solid #BFDBFE;
        """)
        hud_layout.addWidget(lbl_patient)
        hud_layout.addStretch()

        # Reset Full View Button (Large Click Target)
        self.btn_reset_cam = QPushButton("🔍 Show Full Body")
        self.btn_reset_cam.setCursor(Qt.PointingHandCursor)
        self.btn_reset_cam.setStyleSheet("""
            QPushButton {
                background-color: #FFFFFF;
                color: #0F172A;
                font-size: 12px;
                font-weight: 700;
                padding: 9px 16px;
                border-radius: 10px;
                border: 1.5px solid #CBD5E1;
            }
            QPushButton:hover {
                background-color: #EFF6FF;
                color: #2563EB;
                border-color: #2563EB;
            }
            QPushButton:pressed {
                background-color: #DBEAFE;
                border-color: #1D4ED8;
            }
        """)
        self.btn_reset_cam.clicked.connect(self.reset_camera_to_normal)
        hud_layout.addWidget(self.btn_reset_cam)

        # Turn Body Button (Large Click Target)
        self.btn_flip = QPushButton("🔄 Turn Body (Front / Back)")
        self.btn_flip.setCursor(Qt.PointingHandCursor)
        self.btn_flip.setStyleSheet("""
            QPushButton {
                background-color: #FFFFFF;
                color: #0F172A;
                font-size: 12px;
                font-weight: 700;
                padding: 9px 16px;
                border-radius: 10px;
                border: 1.5px solid #CBD5E1;
            }
            QPushButton:hover {
                background-color: #EFF6FF;
                color: #2563EB;
                border-color: #2563EB;
            }
            QPushButton:pressed {
                background-color: #DBEAFE;
                border-color: #1D4ED8;
            }
        """)
        self.btn_flip.clicked.connect(self.toggle_front_back)
        hud_layout.addWidget(self.btn_flip)

        left_container.addWidget(hud_bar)

        # 3D Viewport (MediKiosk Canvas with Soft Blue-200 Framing)
        viewport_frame = QFrame()
        viewport_frame.setStyleSheet("""
            QFrame {
                background-color: #EBF3FC;
                border: 1.5px solid #BFDBFE;
                border-radius: 18px;
            }
        """)
        vp_layout = QVBoxLayout(viewport_frame)
        vp_layout.setContentsMargins(0, 0, 0, 0)
        self.plotter = QtInteractor(viewport_frame)
        self.plotter.set_background("#EBF3FC")
        self.plotter.interactor.wheelEvent = lambda event: event.ignore()  # Locked scroll-wheel
        vp_layout.addWidget(self.plotter.interactor)
        left_container.addWidget(viewport_frame, stretch=1)

        # Bottom Guidance Banner (High Visibility & Elderly Friendly)
        bot_bar = QFrame()
        bot_bar.setStyleSheet("""
            QFrame {
                background-color: #FFFFFF;
                border: 1.5px solid #BFDBFE;
                border-radius: 14px;
                padding: 12px 20px;
            }
        """)
        bot_layout = QHBoxLayout(bot_bar)
        bot_layout.setContentsMargins(0, 0, 0, 0)
        bot_layout.setSpacing(12)

        self.lbl_hint_icon = QLabel("👉")
        self.lbl_hint_icon.setStyleSheet("font-size: 20px; background: transparent; border: none;")
        bot_layout.addWidget(self.lbl_hint_icon)

        self.lbl_hint = QLabel("Step 1: Touch or click anywhere on the body where you feel pain.")
        self.lbl_hint.setStyleSheet("color: #0F172A; font-size: 15px; font-weight: 700; background: transparent; border: none;")
        bot_layout.addWidget(self.lbl_hint, stretch=1)
        left_container.addWidget(bot_bar)

        main_layout.addLayout(left_container, stretch=6)

        # -------------------------------------------------------------
        # RIGHT: Modern Diagram Widget
        # -------------------------------------------------------------
        self.diagram_widget = RegionalDiagramWidget(self)
        self.diagram_widget.quadrant_selected.connect(self.on_quadrant_selected)
        self.diagram_widget.refocus_requested.connect(self.on_refocus_requested)
        self.diagram_widget.confirmed.connect(self.on_confirmed)

        main_layout.addWidget(self.diagram_widget, stretch=4)

    def load_patient_model(self):
        try:
            self.mesh, filename = self.loader.load_and_normalize(self.patient_gender)
            self.detector = AnatomicalRegionDetector(self.mesh)
            self.body_actor = self.loader.setup_clinical_shading(self.plotter, self.mesh)

            self.plotter.enable_surface_point_picking(
                mesh=self.mesh,
                callback=self.on_body_clicked,
                show_point=False,
                show_message=False,
                left_clicking=True
            )
            self.reset_camera_to_normal()
        except Exception as e:
            print(f"[-] Error loading model: {e}")

    def toggle_front_back(self):
        self.plotter.camera.azimuth += 180
        self.plotter.render()

    def reset_camera_to_normal(self):
        self.plotter.camera_position = [(0, -18.0, 0), (0, 0, 0), (0, 0, 1)]
        self.plotter.render()

    def on_body_clicked(self, point):
        if point is None or len(point) != 3 or self.detector is None:
            return

        region_info = self.detector.classify_point(point)
        if not region_info:
            return

        self.current_region_key = region_info["key"]

        # 1. Place glowing sapphire pin & highlight
        self.place_blue_pin(point)
        self.highlight_region(point[2], point)

        # 2. Auto-focus camera
        self.auto_focus(self.current_region_key, point)

        # 3. Open regional sub-diagram
        self.diagram_widget.show_diagram(self.current_region_key)

    def auto_focus(self, region_key, point):
        target = CAMERA_TARGETS.get(region_key, {"focal_z": point[2], "cam_dist": 5.8})
        focal_z = target["focal_z"]
        cam_dist = target["cam_dist"]

        target_x = point[0] * 0.35 if region_key in ("arm", "knee", "leg", "thigh") else 0.0
        is_front = point[1] <= 0
        cam_y = -cam_dist if is_front else cam_dist

        self.plotter.camera_position = [(target_x, cam_y, focal_z), (target_x, 0, focal_z), (0, 0, 1)]
        self.plotter.render()
        self.lbl_hint_icon.setText("🔍")
        self.lbl_hint.setText(f"Focused on {target.get('title', 'Region')}. Select your exact spot from the list on the right.")
        self.lbl_hint.setStyleSheet("color: #2563EB; font-size: 15px; font-weight: 700; background: transparent; border: none;")

    def on_quadrant_selected(self, data):
        self.current_selection = data
        if "pos" in data:
            self.place_blue_pin(data["pos"])

        # Immediately return to normal full-body size
        self.reset_camera_to_normal()
        self.lbl_hint_icon.setText("📍")
        self.lbl_hint.setText(f"Spot Selected: {data['label']}. Press the green 'Confirm Location' button on the right to save.")
        self.lbl_hint.setStyleSheet("color: #2563EB; font-size: 15px; font-weight: 700; background: transparent; border: none;")

    def on_refocus_requested(self):
        if self.current_selection and "pos" in self.current_selection:
            self.auto_focus(self.current_region_key, self.current_selection["pos"])

    def on_confirmed(self, selection_data):
        coords = list(selection_data["pos"]) if "pos" in selection_data else None
        payload = {
            "patientId": self.patient_id,
            "patientGender": self.patient_gender,
            "bodyRegion": selection_data["region"],
            "side": selection_data["side"],
            "location": selection_data["loc"],
            "laymanSummary": selection_data["label"],
            "coordinates": coords,
            "timestamp": datetime.now().isoformat()
        }

        # 1. Local backup JSON
        output_file = Path("pain_summary.json")
        try:
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(payload, f, indent=2)
            print(f"\n[+] PAIN SUMMARY SAVED LOCALLY: {output_file.resolve()}")
        except Exception as err:
            print("[!] Warning saving local file:", err)

        # 2. Sync to MediKiosk Backend API
        backend_synced = False
        try:
            import urllib.request
            req_data = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                f"{self.api_base_url}/api/v1/patient/pain-mapping/save",
                data=req_data,
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=3) as resp:
                if resp.status == 200:
                    backend_synced = True
                    print("[+] MediKiosk Backend Synchronized Successfully!")
        except Exception as e:
            print(f"[!] Notice: Offline or standalone mode ({self.api_base_url}): {e}")

        # 3. Direct Edge Database Fallback (if backend API was offline)
        if not backend_synced:
            try:
                import sqlite3
                db_candidates = [
                    Path(__file__).resolve().parent.parent.parent / "backend" / "database" / "medikiosk_edge.db",
                    Path("backend/database/medikiosk_edge.db"),
                    Path("../backend/database/medikiosk_edge.db")
                ]
                for db_file in db_candidates:
                    if db_file.exists():
                        conn = sqlite3.connect(str(db_file))
                        cur = conn.cursor()
                        cur.execute(
                            """INSERT INTO patient_pain_mappings 
                               (patient_id, patient_gender, body_region, side, location, layman_summary, coordinates, severity, pain_type, duration) 
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                            (
                                self.patient_id,
                                self.patient_gender,
                                selection_data["region"],
                                selection_data["side"],
                                selection_data["loc"],
                                selection_data["label"],
                                json.dumps(coords) if coords else None,
                                5,
                                "Aching",
                                "Recent"
                            )
                        )
                        conn.commit()
                        conn.close()
                        print(f"[+] Direct SQLite Edge Fallback Saved to {db_file}")
                        break
            except Exception as sql_err:
                print(f"[!] Direct SQLite Edge note: {sql_err}")

        # Keep legacy keys for compatibility
        payload["patient_gender"] = self.patient_gender
        payload["body_region"] = selection_data["region"]
        payload["layman_summary"] = selection_data["label"]

        self.pain_confirmed.emit(payload)

        # In-place clean notification
        self.lbl_hint_icon.setText("✔")
        msg = f"Location Saved: {selection_data['label']}. Transmitted to Doctor's OPD chamber!" if backend_synced else f"Location Saved: {selection_data['label']}. All done with pain mapping!"
        self.lbl_hint.setText(msg)
        self.lbl_hint.setStyleSheet("color: #15803D; font-size: 15px; font-weight: 800; background: transparent; border: none;")

    def place_blue_pin(self, point):
        if self.pain_actor:
            self.plotter.remove_actor(self.pain_actor)

        # Snap to closest surface vertex on the 3D skin mesh
        if self.mesh is not None:
            idx = self.mesh.find_closest_point(point)
            snapped_pt = self.mesh.points[idx]
        else:
            snapped_pt = point

        # Larger pin sphere radius (0.28) for high elderly visibility
        pain_sphere = pv.Sphere(radius=0.28, center=snapped_pt)
        self.pain_actor = self.plotter.add_mesh(
            pain_sphere,
            color="#2563EB",        # MediKiosk Primary Blue
            emissive=True,
            smooth_shading=True
        )

    def highlight_region(self, center_z, point):
        if self.highlight_actor:
            self.plotter.remove_actor(self.highlight_actor)

        aura = pv.Sphere(radius=1.3, center=(point[0] * 0.4, point[1] * 0.4, center_z))
        self.highlight_actor = self.plotter.add_mesh(
            aura,
            color="#60A5FA",        # MediKiosk Blue-400 Aura
            opacity=0.30,
            smooth_shading=True
        )


class MainWindow(QMainWindow):
    def __init__(self, patient_gender="male", patient_id="PT-NEW", api_base_url="http://127.0.0.1:8000"):
        super().__init__()
        self.setWindowTitle(f"MediKiosk - 3D Pain Mapping & Case Taking ({patient_gender.capitalize()}) - {patient_id}")
        self.resize(1360, 880)
        self.setStyleSheet("""
            * {
                font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            QMainWindow {
                background: qlineargradient(x1:0, y1:0, x2:1, y2:1, stop:0 #E0F2FE, stop:0.5 #EFF6FF, stop:1 #E0E7FF);
            }
        """)
        self.mannequin = PainLocalizationMannequin(
            patient_gender=patient_gender,
            patient_id=patient_id,
            api_base_url=api_base_url
        )
        self.setCentralWidget(self.mannequin)


if __name__ == "__main__":
    gender = sys.argv[1].lower() if len(sys.argv) > 1 and sys.argv[1].lower() in ("male", "female") else "male"
    p_id = sys.argv[2] if len(sys.argv) > 2 else "PT-NEW"
    api_url = sys.argv[3] if len(sys.argv) > 3 else "http://127.0.0.1:8000"

    app = QApplication(sys.argv)
    window = MainWindow(patient_gender=gender, patient_id=p_id, api_base_url=api_url)
    window.show()
    sys.exit(app.exec())