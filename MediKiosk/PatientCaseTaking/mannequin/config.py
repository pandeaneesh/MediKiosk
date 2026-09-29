"""
Anatomical and UI Configuration for 3D Pain Localization
Contains calibrated height ratios, complete body region diagrams, and Clean Hospital Light Mode styling.
"""

# Normalized Anatomical Height Ratios (Total Height = 10.0, Z = -5.0 to +5.0)
ANATOMICAL_HEIGHT_RATIOS = {
    "head": 0.83,       # 83% - 100% of body height (Z >= 3.3)
    "chest": 0.66,      # 66% - 83% (Z = 1.6 to 3.3)
    "abdomen": 0.49,    # 49% - 66% (Z = -0.1 to 1.6)
    "pelvis": 0.38,     # 38% - 49% (Z = -1.2 to -0.1)
    "thigh": 0.23,      # 23% - 38% (Z = -2.7 to -1.2)
    "knee": 0.15,       # 15% - 23% (Z = -3.5 to -2.7)
    "leg": 0.0          # 0% - 15% (Z = -5.0 to -3.5)
}

CAMERA_TARGETS = {
    "head":    {"focal_z": 4.1,  "cam_dist": 4.8, "title": "Head & Neck"},
    "chest":   {"focal_z": 2.5,  "cam_dist": 5.8, "title": "Chest & Ribs"},
    "abdomen": {"focal_z": 0.8,  "cam_dist": 5.4, "title": "Stomach & Belly"},
    "back":    {"focal_z": 1.6,  "cam_dist": 6.0, "title": "Back & Spine"},
    "pelvis":  {"focal_z": -0.6, "cam_dist": 5.2, "title": "Pelvis & Hips"},
    "thigh":   {"focal_z": -1.9, "cam_dist": 5.0, "title": "Thigh Area"},
    "knee":    {"focal_z": -3.1, "cam_dist": 4.5, "title": "Knee Joint"},
    "leg":     {"focal_z": -4.2, "cam_dist": 4.8, "title": "Lower Leg & Foot"},
    "arm":     {"focal_z": 1.6,  "cam_dist": 5.8, "title": "Arm & Shoulder"}
}

REGIONAL_DIAGRAMS = {
    "abdomen": {
        "title": "STOMACH & BELLY MAP",
        "cols": 3,
        "quadrants": [
            ("Upper Right Belly", "Under right ribs", {"region": "abdomen", "side": "right", "loc": "upper", "label": "Upper Right Belly", "pos": (0.65, -0.65, 1.35)}),
            ("Upper Middle Belly", "Heartburn area", {"region": "abdomen", "side": "center", "loc": "upper", "label": "Upper Middle Belly", "pos": (0.0, -0.75, 1.35)}),
            ("Upper Left Belly", "Under left ribs", {"region": "abdomen", "side": "left", "loc": "upper", "label": "Upper Left Belly", "pos": (-0.65, -0.65, 1.35)}),

            ("Right Waist", "Flank / Side", {"region": "abdomen", "side": "right", "loc": "middle", "label": "Right Waist", "pos": (0.78, -0.60, 0.85)}),
            ("Around Belly Button", "Center navel", {"region": "abdomen", "side": "center", "loc": "middle", "label": "Around Belly Button", "pos": (0.0, -0.80, 0.85)}),
            ("Left Waist", "Flank / Side", {"region": "abdomen", "side": "left", "loc": "middle", "label": "Left Waist", "pos": (-0.78, -0.60, 0.85)}),

            ("Lower Right Belly", "Appendix area", {"region": "abdomen", "side": "right", "loc": "lower", "label": "Lower Right Belly", "pos": (0.65, -0.65, 0.38)}),
            ("Lower Middle Belly", "Bladder area", {"region": "abdomen", "side": "center", "loc": "lower", "label": "Lower Middle Belly", "pos": (0.0, -0.70, 0.38)}),
            ("Lower Left Belly", "Lower flank", {"region": "abdomen", "side": "left", "loc": "lower", "label": "Lower Left Belly", "pos": (-0.65, -0.65, 0.38)}),
        ]
    },
    "chest": {
        "title": "CHEST & RIBS MAP",
        "cols": 3,
        "quadrants": [
            ("Right Chest", "Upper right pectoral", {"region": "chest", "side": "right", "loc": "upper", "label": "Right Side of Chest", "pos": (0.75, -0.75, 2.75)}),
            ("Center of Chest", "Breastbone / Sternum", {"region": "chest", "side": "center", "loc": "middle", "label": "Center of Chest", "pos": (0.0, -0.85, 2.65)}),
            ("Left Chest", "Heart area", {"region": "chest", "side": "left", "loc": "upper", "label": "Left Side of Chest", "pos": (-0.75, -0.75, 2.75)}),
            ("Lower Right Ribs", "Right lower rib cage", {"region": "chest", "side": "right", "loc": "lower", "label": "Lower Right Ribs", "pos": (0.95, -0.65, 1.95)}),
            ("Lower Left Ribs", "Left lower rib cage", {"region": "chest", "side": "left", "loc": "lower", "label": "Lower Left Ribs", "pos": (-0.95, -0.65, 1.95)}),
        ]
    },
    "head": {
        "title": "HEAD & FACE MAP",
        "cols": 3,
        "quadrants": [
            ("Forehead", "Front upper head", {"region": "head", "side": "center", "loc": "forehead", "label": "Forehead", "pos": (0.0, -0.75, 4.45)}),
            ("Left Temple", "Left side of head", {"region": "head", "side": "left", "loc": "temple", "label": "Left Temple", "pos": (-0.55, -0.25, 4.35)}),
            ("Right Temple", "Right side of head", {"region": "head", "side": "right", "loc": "temple", "label": "Right Temple", "pos": (0.55, -0.25, 4.35)}),
            ("Face & Jaw", "Teeth / Jawline", {"region": "head", "side": "center", "loc": "jaw", "label": "Face & Jaw", "pos": (0.0, -0.65, 3.85)}),
            ("Front of Neck", "Throat area", {"region": "head", "side": "center", "loc": "neck", "label": "Front of Neck", "pos": (0.0, -0.45, 3.45)}),
            ("Back of Head", "Nape / Occipital", {"region": "head", "side": "center", "loc": "occiput", "label": "Back of Head", "pos": (0.0, 0.45, 4.30)}),
        ]
    },
    "back": {
        "title": "BACK & SPINE MAP",
        "cols": 2,
        "quadrants": [
            ("Upper Back", "Shoulder blades", {"region": "back", "side": "center", "loc": "upper", "label": "Upper Back & Shoulders", "pos": (0.0, 0.65, 2.65)}),
            ("Middle Back", "Thoracic spine", {"region": "back", "side": "center", "loc": "middle", "label": "Middle Back", "pos": (0.0, 0.55, 1.70)}),
            ("Lower Back", "Lumbar spine", {"region": "back", "side": "center", "loc": "lower", "label": "Lower Back (Lumbar)", "pos": (0.0, 0.45, 0.75)}),
            ("Tailbone & Hips", "Sacrum / Glutes", {"region": "back", "side": "center", "loc": "tailbone", "label": "Tailbone & Hips", "pos": (0.0, 0.50, -0.45)}),
        ]
    },
    "pelvis": {
        "title": "PELVIS & HIPS MAP",
        "cols": 2,
        "quadrants": [
            ("Right Hip", "Outer hip joint", {"region": "pelvis", "side": "right", "loc": "hip", "label": "Right Hip", "pos": (1.15, -0.15, -0.65)}),
            ("Left Hip", "Outer hip joint", {"region": "pelvis", "side": "left", "loc": "hip", "label": "Left Hip", "pos": (-1.15, -0.15, -0.65)}),
            ("Lower Groin", "Pubic bone / Inguinal", {"region": "pelvis", "side": "center", "loc": "groin", "label": "Lower Groin", "pos": (0.0, -0.60, -0.55)}),
            ("Buttocks", "Gluteal muscles", {"region": "pelvis", "side": "center", "loc": "buttocks", "label": "Buttocks", "pos": (0.0, 0.55, -0.65)}),
        ]
    },
    "knee": {
        "title": "KNEE JOINT MAP",
        "cols": 2,
        "quadrants": [
            ("Front of Knee", "Kneecap (Patella)", {"region": "knee", "side": "front", "loc": "kneecap", "label": "Front of Knee", "pos": (0.95, -0.35, -3.05)}),
            ("Inner Knee", "Medial joint line", {"region": "knee", "side": "inner", "loc": "inner", "label": "Inner Knee", "pos": (0.55, -0.15, -3.05)}),
            ("Outer Knee", "Lateral joint line", {"region": "knee", "side": "outer", "loc": "outer", "label": "Outer Knee", "pos": (1.25, -0.15, -3.05)}),
            ("Back of Knee", "Behind the joint", {"region": "knee", "side": "back", "loc": "back", "label": "Back of Knee", "pos": (0.95, 0.35, -3.05)}),
        ]
    },
    "arm": {
        "title": "ARM & SHOULDER MAP",
        "cols": 2,
        "quadrants": [
            ("Shoulder Joint", "Deltoid muscle", {"region": "arm", "side": "lateral", "loc": "shoulder", "label": "Shoulder Joint", "pos": (1.50, -0.15, 2.75)}),
            ("Upper Arm", "Bicep / Tricep", {"region": "arm", "side": "lateral", "loc": "bicep", "label": "Upper Arm", "pos": (1.85, -0.15, 2.05)}),
            ("Elbow Joint", "Inner / Outer elbow", {"region": "arm", "side": "lateral", "loc": "elbow", "label": "Elbow Joint", "pos": (2.25, -0.10, 1.45)}),
            ("Forearm", "Lower arm muscles", {"region": "arm", "side": "lateral", "loc": "forearm", "label": "Forearm", "pos": (2.65, -0.10, 0.75)}),
            ("Wrist & Hand", "Fingers / Palm", {"region": "arm", "side": "lateral", "loc": "hand", "label": "Wrist & Hand", "pos": (3.20, -0.10, -0.05)}),
        ]
    },
    "leg": {
        "title": "LEG & FOOT MAP",
        "cols": 2,
        "quadrants": [
            ("Front Thigh", "Quadriceps muscle", {"region": "leg", "side": "front", "loc": "thigh", "label": "Front Thigh", "pos": (0.95, -0.45, -1.95)}),
            ("Back Thigh", "Hamstring muscle", {"region": "leg", "side": "back", "loc": "hamstring", "label": "Back Thigh", "pos": (0.95, 0.35, -1.95)}),
            ("Shin", "Front lower leg", {"region": "leg", "side": "front", "loc": "shin", "label": "Shin (Front Leg)", "pos": (1.00, -0.25, -3.95)}),
            ("Calf", "Back lower leg", {"region": "leg", "side": "back", "loc": "calf", "label": "Calf (Back Leg)", "pos": (1.00, 0.35, -3.95)}),
            ("Ankle & Foot", "Heel / Toes", {"region": "leg", "side": "foot", "loc": "foot", "label": "Ankle & Foot", "pos": (1.05, -0.20, -4.75)}),
        ]
    }
}

# MediKiosk Brand Theme Stylesheets (Plus Jakarta Sans, Blue-600 #2563EB, Blue-200 #BFDBFE)
HOSPITAL_PANEL_STYLE = """
    QFrame {
        background-color: #FFFFFF;
        border: 1.5px solid #BFDBFE;
        border-radius: 18px;
    }
"""
DARK_PANEL_STYLE = HOSPITAL_PANEL_STYLE

CARD_INACTIVE_STYLE = """
    QPushButton {
        background-color: #FFFFFF;
        border: 2px solid #E2E8F0;
        border-radius: 14px;
        padding: 14px 12px;
        text-align: center;
    }
    QPushButton:hover {
        background-color: #EFF6FF;
        border-color: #2563EB;
    }
"""

CARD_ACTIVE_STYLE = """
    QPushButton {
        background-color: #DBEAFE;
        border: 3px solid #2563EB;
        border-radius: 14px;
        padding: 14px 12px;
        text-align: center;
    }
"""