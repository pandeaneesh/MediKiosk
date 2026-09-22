import sys
import json
from pathlib import Path
import numpy as np
import pyvista as pv
import trimesh
from pyvistaqt import QtInteractor
from PySide6.QtWidgets import (
    QApplication, QMainWindow, QWidget, QVBoxLayout, 
    QHBoxLayout, QPushButton, QLabel, QFrame, QGridLayout
)
from PySide6.QtCore import Qt


class PainLocalizationMannequin(QWidget):
    def __init__(self, parent=None):
        super().__init__(parent)
        self.pain_actor = None
        self.body_actor = None
        self.mesh = None
        self.current_gender = "medical"
        self.models_dir = Path(__file__).resolve().parent / "models"
        self.model_files = self.detect_models()

        self.init_ui()
        # Load default model safely after UI is built
        self.switch_gender("medical")

    def detect_models(self):
        glbs = list(self.models_dir.glob("*.glb"))
        mapping = {"medical": None, "male": None, "female": None}
        for f in glbs:
            name = f.name.lower()
            if "female" in name:
                mapping["female"] = f.name
            elif "male" in name:
                mapping["male"] = f.name
            elif "medical" in name:
                mapping["medical"] = f.name

        # Fallbacks
        first_glb = glbs[0].name if glbs else "medical_body.glb"
        mapping["medical"] = mapping["medical"] or first_glb
        mapping["male"] = mapping["male"] or first_glb
        mapping["female"] = mapping["female"] or first_glb
        return mapping

    def init_ui(self):
        main_layout = QHBoxLayout(self)
        main_layout.setContentsMargins(15, 15, 15, 15)
        main_layout.setSpacing(15)

        # 1. 3D Interactor Panel
        self.plotter = QtInteractor(self)
        self.plotter.set_background("#0F172A")
        main_layout.addWidget(self.plotter.interactor, stretch=4)

        # 2. Accessible Patient Control Panel (Right Side)
        panel = QFrame()
        panel.setStyleSheet("""
            QFrame {
                background-color: #1E293B;
                border-radius: 12px;
                padding: 12px;
            }
        """)
        panel_layout = QVBoxLayout(panel)
        panel_layout.setSpacing(10)

        # Header Title
        title = QLabel("Pain Localization")
        title.setStyleSheet("color: #F8FAFC; font-size: 20px; font-weight: bold;")
        panel_layout.addWidget(title)

        subtitle = QLabel("Click on the body. The area will enlarge so you can pinpoint the pain.")
        subtitle.setWordWrap(True)
        subtitle.setStyleSheet("color: #94A3B8; font-size: 12px;")
        panel_layout.addWidget(subtitle)

        # Anatomy Selector Buttons
        anat_layout = QHBoxLayout()
        anat_layout.setSpacing(6)
        self.btn_med = QPushButton("Clinical")
        self.btn_male = QPushButton("Male")
        self.btn_female = QPushButton("Female")

        for btn, g in [(self.btn_med, "medical"), (self.btn_male, "male"), (self.btn_female, "female")]:
            btn.clicked.connect(lambda checked=False, gender=g: self.switch_gender(gender))
            anat_layout.addWidget(btn)
        panel_layout.addLayout(anat_layout)

        # Selected Pain Region Card
        self.card = QFrame()
        self.card.setStyleSheet("""
            QFrame {
                background-color: #0F172A;
                border: 2px solid #334155;
                border-radius: 8px;
                padding: 10px;
            }
        """)
        card_layout = QVBoxLayout(self.card)
        card_title = QLabel("DETECTED PAIN REGION")
        card_title.setStyleSheet("color: #38BDF8; font-size: 11px; font-weight: bold; letter-spacing: 1px;")
        card_layout.addWidget(card_title)

        self.lbl_region = QLabel("Tap on the 3D Body")
        self.lbl_region.setStyleSheet("color: #EF4444; font-size: 16px; font-weight: bold;")
        card_layout.addWidget(self.lbl_region)

        self.lbl_details = QLabel("Camera will zoom in automatically.")
        self.lbl_details.setWordWrap(True)
        self.lbl_details.setStyleSheet("color: #CBD5E1; font-size: 12px;")
        card_layout.addWidget(self.lbl_details)
        panel_layout.addWidget(self.card)

        # Layman Sub-Region Pinpoint Box
        self.subregion_box = QFrame()
        self.subregion_box.setStyleSheet("""
            QFrame {
                background-color: #0F172A;
                border: 1px solid #0284C7;
                border-radius: 8px;
                padding: 8px;
            }
        """)
        self.subregion_layout = QVBoxLayout(self.subregion_box)
        
        self.lbl_sub_title = QLabel("PINPOINT EXACT AREA:")
        self.lbl_sub_title.setStyleSheet("color: #38BDF8; font-size: 11px; font-weight: bold;")
        self.subregion_layout.addWidget(self.lbl_sub_title)

        self.grid_subregions = QGridLayout()
        self.grid_subregions.setSpacing(6)
        self.subregion_layout.addLayout(self.grid_subregions)
        
        self.subregion_box.setVisible(False)
        panel_layout.addWidget(self.subregion_box)

        # Structured Output Preview
        self.lbl_json = QLabel("")
        self.lbl_json.setWordWrap(True)
        self.lbl_json.setStyleSheet("""
            background-color: #090D16;
            color: #A7F3D0;
            font-family: Consolas, monospace;
            font-size: 11px;
            padding: 8px;
            border-radius: 6px;
        """)
        self.lbl_json.setVisible(False)
        panel_layout.addWidget(self.lbl_json)

        # Camera & Navigation Controls
        ctrl_title = QLabel("CONTROLS")
        ctrl_title.setStyleSheet("color: #94A3B8; font-size: 11px; font-weight: bold; margin-top: 4px;")
        panel_layout.addWidget(ctrl_title)

        btn_style = """
            QPushButton {
                background-color: #334155;
                color: #F8FAFC;
                font-size: 12px;
                font-weight: bold;
                padding: 8px;
                border-radius: 6px;
            }
            QPushButton:hover { background-color: #475569; }
            QPushButton:pressed { background-color: #0284C7; }
        """

        self.btn_reset = QPushButton("⬅ Full Body View")
        self.btn_reset.setStyleSheet("""
            QPushButton {
                background-color: #0284C7;
                color: #FFFFFF;
                font-size: 13px;
                font-weight: bold;
                padding: 9px;
                border-radius: 6px;
            }
            QPushButton:hover { background-color: #0369A1; }
        """)
        self.btn_reset.clicked.connect(self.reset_to_full_body)
        panel_layout.addWidget(self.btn_reset)

        view_row = QHBoxLayout()
        self.btn_front = QPushButton("Front View")
        self.btn_back = QPushButton("Back View")
        self.btn_front.setStyleSheet(btn_style)
        self.btn_back.setStyleSheet(btn_style)
        self.btn_front.clicked.connect(self.set_front_view)
        self.btn_back.clicked.connect(self.set_back_view)
        view_row.addWidget(self.btn_front)
        view_row.addWidget(self.btn_back)
        panel_layout.addLayout(view_row)

        self.btn_clear = QPushButton("Clear Selection")
        self.btn_clear.setStyleSheet("""
            QPushButton {
                background-color: #7F1D1D;
                color: #FECACA;
                font-size: 12px;
                font-weight: bold;
                padding: 7px;
                border-radius: 6px;
            }
            QPushButton:hover { background-color: #991B1B; }
        """)
        self.btn_clear.clicked.connect(self.clear_all)
        panel_layout.addWidget(self.btn_clear)

        panel_layout.addStretch()
        main_layout.addWidget(panel, stretch=2)

    def switch_gender(self, gender):
        self.current_gender = gender
        active = "background-color: #0284C7; color: white; font-weight: bold; padding: 7px; border-radius: 6px;"
        inactive = "background-color: #334155; color: #94A3B8; font-weight: bold; padding: 7px; border-radius: 6px;"

        self.btn_med.setStyleSheet(active if gender == "medical" else inactive)
        self.btn_male.setStyleSheet(active if gender == "male" else inactive)
        self.btn_female.setStyleSheet(active if gender == "female" else inactive)

        filename = self.model_files.get(gender)
        if filename:
            self.load_model(filename)

    def load_model(self, filename):
        model_path = self.models_dir / filename
        if not model_path.exists():
            print(f"[-] File not found: {model_path}")
            return

        print(f"[+] Loading model: {filename}")
        
        # Remove old actors safely
        if self.body_actor:
            self.plotter.remove_actor(self.body_actor)
            self.body_actor = None
        if self.pain_actor:
            self.plotter.remove_actor(self.pain_actor)
            self.pain_actor = None

        # Load GLB
        loaded = trimesh.load(str(model_path))
        t_mesh = loaded.dump(concatenate=True) if isinstance(loaded, trimesh.Scene) else loaded

        # Wrap into PyVista
        self.mesh = pv.wrap(t_mesh)

        # Center mesh at origin
        center = np.array(self.mesh.center)
        self.mesh.translate(-center, inplace=True)

        # Auto-orient: Ensure height is Z
        b = self.mesh.bounds
        spans = [b[1]-b[0], b[3]-b[2], b[5]-b[4]]
        tallest = int(np.argmax(spans))
        if tallest == 1:
            self.mesh.rotate_x(90, inplace=True)
        elif tallest == 0:
            self.mesh.rotate_y(90, inplace=True)

        # Add Body Mesh
        self.body_actor = self.plotter.add_mesh(
            self.mesh,
            color="#E2E8F0",
            smooth_shading=True,
            specular=0.5,
            specular_power=20,
            roughness=0.35,
            ambient=0.35,
            show_edges=False
        )

        # Set up Lighting
        self.plotter.add_light(pv.Light(position=(0, -4, 2), focal_point=(0, 0, 0), color="#FFFFFF", intensity=0.7))
        self.plotter.add_light(pv.Light(position=(0, 4, 2), focal_point=(0, 0, 0), color="#E2E8F0", intensity=0.5))

        # Enable Picking
        self.plotter.enable_surface_point_picking(
            mesh=self.mesh,
            callback=self.on_body_clicked,
            show_point=False,
            show_message=False,
            left_clicking=True
        )

        self.reset_to_full_body()

    def on_body_clicked(self, point):
        if point is None or len(point) != 3 or self.mesh is None:
            return

        self.place_pain_pin(point)
        region_info = self.classify_region(point)

        # 1. Update Labels
        self.lbl_region.setText(region_info["name"])
        self.lbl_details.setText(f"{region_info['aspect']} | {region_info['side']}")

        # 2. Enlarge / Zoom to selected region
        self.enlarge_region(point)

        # 3. Show layman sub-region pinpointing grid
        self.show_subregion_grid(region_info["key"], point)

    def enlarge_region(self, point):
        if self.mesh is None:
            return
        b = self.mesh.bounds
        body_height = b[5] - b[4]
        
        target_z = point[2]
        target_x = point[0] * 0.4
        zoom_dist = body_height * 0.65
        is_front = point[1] <= 0
        cam_y = -zoom_dist if is_front else zoom_dist

        self.plotter.camera_position = [
            (target_x, cam_y, target_z),
            (target_x, 0, target_z),
            (0, 0, 1)
        ]
        self.plotter.render()

    def show_subregion_grid(self, region_key, clicked_point):
        # Clear existing buttons
        while self.grid_subregions.count():
            item = self.grid_subregions.takeAt(0)
            if item.widget():
                item.widget().deleteLater()

        subregions = []
        if region_key == "abdomen":
            self.lbl_sub_title.setText("STOMACH / ABDOMEN AREAS:")
            subregions = [
                ("Upper Right\n(Liver/Gallbladder)", {"region": "abdomen", "side": "right", "location": "upper", "offset": (0.08, -0.05, 0.08)}),
                ("Upper Center\n(Epigastric / Pit)", {"region": "abdomen", "side": "center", "location": "upper", "offset": (0.0, -0.05, 0.08)}),
                ("Upper Left\n(Stomach / Spleen)", {"region": "abdomen", "side": "left", "location": "upper", "offset": (-0.08, -0.05, 0.08)}),
                
                ("Middle Right\n(Right Waist)", {"region": "abdomen", "side": "right", "location": "middle", "offset": (0.08, -0.05, 0.0)}),
                ("Around Navel\n(Belly Button)", {"region": "abdomen", "side": "center", "location": "middle", "offset": (0.0, -0.05, 0.0)}),
                ("Middle Left\n(Left Waist)", {"region": "abdomen", "side": "left", "location": "middle", "offset": (-0.08, -0.05, 0.0)}),

                ("Lower Right\n(Appendix Area)", {"region": "abdomen", "side": "right", "location": "lower", "offset": (0.08, -0.05, -0.08)}),
                ("Lower Center\n(Bladder / Pelvic)", {"region": "abdomen", "side": "center", "location": "lower", "offset": (0.0, -0.05, -0.08)}),
                ("Lower Left\n(Left Lower Belly)", {"region": "abdomen", "side": "left", "location": "lower", "offset": (-0.08, -0.05, -0.08)}),
            ]
        elif region_key == "chest":
            self.lbl_sub_title.setText("CHEST AREAS:")
            subregions = [
                ("Right Upper Chest", {"region": "chest", "side": "right", "location": "upper", "offset": (0.1, -0.05, 0.05)}),
                ("Center (Sternum)", {"region": "chest", "side": "center", "location": "middle", "offset": (0.0, -0.05, 0.0)}),
                ("Left Upper Chest", {"region": "chest", "side": "left", "location": "upper", "offset": (-0.1, -0.05, 0.05)}),
                ("Right Ribs", {"region": "chest", "side": "right", "location": "lower", "offset": (0.12, -0.05, -0.05)}),
                ("Heart Area", {"region": "chest", "side": "left", "location": "middle", "offset": (-0.06, -0.05, 0.0)}),
                ("Left Ribs", {"region": "chest", "side": "left", "location": "lower", "offset": (-0.12, -0.05, -0.05)}),
            ]
        elif region_key == "head":
            self.lbl_sub_title.setText("HEAD & FACE AREAS:")
            subregions = [
                ("Forehead", {"region": "head", "side": "center", "location": "forehead", "offset": (0.0, -0.05, 0.06)}),
                ("Temples", {"region": "head", "side": "bilateral", "location": "temples", "offset": (0.07, -0.02, 0.04)}),
                ("Jaw / Teeth", {"region": "head", "side": "center", "location": "jaw", "offset": (0.0, -0.05, -0.04)}),
                ("Neck / Throat", {"region": "head", "side": "center", "location": "throat", "offset": (0.0, -0.05, -0.1)}),
            ]
        elif region_key == "back":
            self.lbl_sub_title.setText("BACK AREAS:")
            subregions = [
                ("Upper Back (Shoulders)", {"region": "back", "side": "center", "location": "upper", "offset": (0.0, 0.05, 0.08)}),
                ("Mid Back", {"region": "back", "side": "center", "location": "middle", "offset": (0.0, 0.05, 0.0)}),
                ("Lower Back (Lumbar)", {"region": "back", "side": "center", "location": "lower", "offset": (0.0, 0.05, -0.08)}),
                ("Tailbone / Sacrum", {"region": "back", "side": "center", "location": "tailbone", "offset": (0.0, 0.05, -0.14)}),
            ]
        else:
            self.lbl_sub_title.setText(f"{region_key.upper()} SPECIFICS:")
            subregions = [
                ("Upper Section", {"region": region_key, "side": "local", "location": "upper", "offset": (0.0, 0.0, 0.04)}),
                ("Joint / Middle", {"region": region_key, "side": "local", "location": "middle", "offset": (0.0, 0.0, 0.0)}),
                ("Lower Section", {"region": region_key, "side": "local", "location": "lower", "offset": (0.0, 0.0, -0.04)}),
            ]

        cols = 3 if len(subregions) >= 6 else 2
        for idx, (label, data) in enumerate(subregions):
            r, c = divmod(idx, cols)
            btn = QPushButton(label)
            btn.setStyleSheet("""
                QPushButton {
                    background-color: #334155;
                    color: #F8FAFC;
                    font-size: 11px;
                    font-weight: bold;
                    padding: 8px 4px;
                    border-radius: 6px;
                    border: 1px solid #475569;
                }
                QPushButton:hover {
                    background-color: #0284C7;
                    border-color: #38BDF8;
                }
            """)
            btn.clicked.connect(lambda checked=False, d=data, p=clicked_point: self.select_subregion(d, p))
            self.grid_subregions.addWidget(btn, r, c)

        self.subregion_box.setVisible(True)

    def select_subregion(self, data, base_point):
        if self.mesh is None:
            return

        b = self.mesh.bounds
        height = b[5] - b[4]
        offset = data.get("offset", (0, 0, 0))
        new_point = [
            base_point[0] + offset[0] * height,
            base_point[1] + offset[1] * height,
            base_point[2] + offset[2] * height
        ]
        self.place_pain_pin(new_point)

        result = {
            "body_region": data["region"],
            "side": data["side"],
            "location": data["location"]
        }
        self.lbl_json.setText(f"STRUCTURED LOCATION DATA:\n{json.dumps(result, indent=2)}")
        self.lbl_json.setVisible(True)

    def place_pain_pin(self, point):
        if self.mesh is None:
            return
        if self.pain_actor:
            self.plotter.remove_actor(self.pain_actor)

        body_height = self.mesh.bounds[5] - self.mesh.bounds[4]
        pin_radius = max(body_height * 0.018, 0.012)

        pain_sphere = pv.Sphere(radius=pin_radius, center=point)
        self.pain_actor = self.plotter.add_mesh(
            pain_sphere,
            color="#EF4444",
            emissive=True,
            smooth_shading=True
        )

    def classify_region(self, point):
        b = self.mesh.bounds
        z_min, z_max = b[4], b[5]
        h_ratio = (point[2] - z_min) / max(z_max - z_min, 1e-5)

        is_front = point[1] <= 0
        side = "Right Side" if point[0] > 0 else "Left Side"
        aspect = "Front (Anterior)" if is_front else "Back (Posterior)"

        torso_w = (b[1] - b[0]) * 0.18
        is_arm = abs(point[0]) > torso_w and (0.42 < h_ratio < 0.82)

        if is_arm:
            return {"key": "arm", "name": f"Arm ({side})", "side": side, "aspect": aspect}
        elif h_ratio > 0.87:
            return {"key": "head", "name": "Head & Neck", "side": side, "aspect": aspect}
        elif h_ratio > 0.69:
            return {"key": "chest" if is_front else "back", "name": "Chest" if is_front else "Upper Back", "side": side, "aspect": aspect}
        elif h_ratio > 0.53:
            return {"key": "abdomen" if is_front else "back", "name": "Stomach / Abdomen" if is_front else "Lower Back (Lumbar)", "side": side, "aspect": aspect}
        elif h_ratio > 0.43:
            return {"key": "pelvis", "name": "Pelvis / Groin" if is_front else "Gluteal / Hip", "side": side, "aspect": aspect}
        elif h_ratio > 0.22:
            return {"key": "thigh", "name": f"Thigh ({side})", "side": side, "aspect": aspect}
        elif h_ratio > 0.16:
            return {"key": "knee", "name": f"Knee ({side})", "side": side, "aspect": aspect}
        else:
            return {"key": "leg", "name": f"Lower Leg / Foot ({side})", "side": side, "aspect": aspect}

    def reset_to_full_body(self):
        if self.mesh is None:
            return
        span = max(self.mesh.bounds[1]-self.mesh.bounds[0], self.mesh.bounds[5]-self.mesh.bounds[4])
        self.plotter.camera_position = [
            (0, -span * 2.2, 0),
            (0, 0, 0),
            (0, 0, 1)
        ]
        self.plotter.reset_camera()

    def set_front_view(self):
        self.reset_to_full_body()

    def set_back_view(self):
        if self.mesh is None:
            return
        span = max(self.mesh.bounds[1]-self.mesh.bounds[0], self.mesh.bounds[5]-self.mesh.bounds[4])
        self.plotter.camera_position = [
            (0, span * 2.2, 0),
            (0, 0, 0),
            (0, 0, 1)
        ]
        self.plotter.reset_camera()

    def clear_all(self):
        if self.pain_actor:
            self.plotter.remove_actor(self.pain_actor)
            self.pain_actor = None
        self.lbl_region.setText("Tap on the 3D Body")
        self.lbl_details.setText("Camera will zoom in automatically.")
        self.subregion_box.setVisible(False)
        self.lbl_json.setVisible(False)
        self.reset_to_full_body()


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("Patient Case Taking System - 3D Pain Localization")
        self.resize(1250, 850)
        self.mannequin = PainLocalizationMannequin()
        self.setCentralWidget(self.mannequin)


if __name__ == "__main__":
    app = QApplication(sys.argv)
    window = MainWindow()
    window.show()
    sys.exit(app.exec())