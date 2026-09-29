"""
Anatomical Region Detector
Maps 3D click coordinates to human anatomical regions using percentage ratios.
"""

from mannequin.config import ANATOMICAL_HEIGHT_RATIOS


class AnatomicalRegionDetector:
    def __init__(self, mesh):
        self.mesh = mesh

    def classify_point(self, point) -> dict:
        """
        Takes a 3D coordinate (x, y, z) and returns the exact anatomical region,
        aspect (Front/Back), and side (Left/Right).
        """
        if point is None or len(point) != 3 or self.mesh is None:
            return None

        x, y, z = point[0], point[1], point[2]
        b = self.mesh.bounds  # [xmin, xmax, ymin, ymax, zmin, zmax]
        z_min, z_max = b[4], b[5]
        total_height = max(z_max - z_min, 1e-5)

        # Calculate height percentage from bottom of feet (0.0) to top of head (1.0)
        h_ratio = (z - z_min) / total_height

        # Front (Anterior: -Y) vs Back (Posterior: +Y)
        is_front = y <= 0
        aspect = "Front" if is_front else "Back"

        # Left vs Right (Anatomical: +X is patient's right, -X is patient's left)
        side = "Right" if x > 0 else "Left"

        # Calibrated Torso vs Arm Check:
        # Torso (Chest, Abdomen, Pelvis) has |X| <= 1.15 across both male and female
        # Deltoid, Bicep, Forearm, Hand have |X| > 1.22
        arm_threshold = 1.30 if h_ratio >= 0.78 else 1.22
        is_arm = abs(x) > arm_threshold and (0.38 < h_ratio < 0.83)

        if is_arm:
            region_key = "arm"
            name = f"Arm & Shoulder ({side})"
        elif h_ratio >= ANATOMICAL_HEIGHT_RATIOS["head"]:
            region_key = "head"
            name = "Head & Neck" if is_front else "Back of Head & Neck"
        elif h_ratio >= ANATOMICAL_HEIGHT_RATIOS["chest"]:
            region_key = "chest" if is_front else "back"
            name = "Chest & Ribs" if is_front else "Upper Back & Shoulders"
        elif h_ratio >= ANATOMICAL_HEIGHT_RATIOS["abdomen"]:
            region_key = "abdomen" if is_front else "back"
            name = "Stomach & Belly" if is_front else "Middle & Lower Back"
        elif h_ratio >= ANATOMICAL_HEIGHT_RATIOS["pelvis"]:
            region_key = "pelvis" if is_front else "back"
            name = "Pelvis & Groin" if is_front else "Tailbone & Glutes"
        elif h_ratio >= ANATOMICAL_HEIGHT_RATIOS["thigh"]:
            region_key = "leg"
            name = f"Thigh ({side})"
        elif h_ratio >= ANATOMICAL_HEIGHT_RATIOS["knee"]:
            region_key = "knee"
            name = f"Knee Joint ({side})"
        else:
            region_key = "leg"
            name = f"Lower Leg & Foot ({side})"

        return {
            "key": region_key,
            "name": name,
            "side": side,
            "aspect": aspect,
            "h_ratio": round(h_ratio, 2)
        }