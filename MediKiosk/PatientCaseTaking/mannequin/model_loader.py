"""
3D Model Loader and Mesh Processor
Handles GLB loading, strict gender matching, auto-orientation, and scaling.
"""

from pathlib import Path
import numpy as np
import pyvista as pv
import trimesh


class HumanModelLoader:
    def __init__(self, models_dir: Path):
        self.models_dir = Path(models_dir)

    def resolve_gender_file(self, gender: str) -> str:
        """Finds the correct GLB file strictly matching male or female."""
        gender_clean = gender.strip().lower()
        glbs = list(self.models_dir.glob("*.glb"))

        if gender_clean == "female":
            for preferred in ["female_base_rev1.glb", "female_base_mesh.glb"]:
                if (self.models_dir / preferred).exists():
                    return preferred
            for f in glbs:
                if "female" in f.name.lower():
                    return f.name
        else:  # male
            for preferred in ["free_pack_-_male_base_mesh.glb"]:
                if (self.models_dir / preferred).exists():
                    return preferred
            for f in glbs:
                name_lower = f.name.lower()
                # Must contain 'male' but NOT 'female'
                if "male" in name_lower and "female" not in name_lower:
                    return f.name

        # Fallback to medical_body.glb or first GLB
        if (self.models_dir / "medical_body.glb").exists():
            return "medical_body.glb"
        return glbs[0].name if glbs else None

    def load_and_normalize(self, gender: str):
        """
        Loads the GLB model, rotates it upright, centers it at (0, 0, 0),
        and scales it to an exact 10.0-unit standard height (-5.0 to +5.0).
        Ensures the front (face/chest) always faces -Y toward the default camera.
        """
        filename = self.resolve_gender_file(gender)
        if not filename:
            raise FileNotFoundError(f"No 3D model found for gender: {gender}")

        model_path = self.models_dir / filename
        if not model_path.exists():
            raise FileNotFoundError(f"Model file not found: {model_path}")

        print(f"[ModelLoader] Loading strictly matched {gender.upper()} model: {filename}")

        # 1. Load via trimesh
        loaded = trimesh.load(str(model_path))
        if isinstance(loaded, trimesh.Scene):
            try:
                t_mesh = loaded.to_geometry()
            except Exception:
                t_mesh = trimesh.util.concatenate(tuple(loaded.geometry.values()))
        else:
            t_mesh = loaded

        mesh = pv.wrap(t_mesh)

        # 2. Auto-orient upright along Z
        b = mesh.bounds
        spans = [b[1]-b[0], b[3]-b[2], b[5]-b[4]]
        tallest = int(np.argmax(spans))
        if tallest == 1:
            mesh.rotate_x(90, inplace=True)
        elif tallest == 0:
            mesh.rotate_y(90, inplace=True)

        # 3. Center at origin (0, 0, 0)
        mesh.translate(-np.array(mesh.center), inplace=True)

        # 4. Universal Scaling: Exactly 10.0 units tall (-5.0 feet to +5.0 head)
        raw_height = mesh.bounds[5] - mesh.bounds[4]
        if raw_height > 0:
            mesh.scale(10.0 / raw_height, inplace=True)

        mesh.translate(-np.array(mesh.center), inplace=True)

        # 5. Front-Facing Alignment: Ensure Face & Chest face -Y (toward default camera)
        pts = mesh.points
        face_pts = pts[(pts[:, 2] > 3.8) & (pts[:, 2] < 4.8) & (np.abs(pts[:, 0]) < 0.35)]
        if len(face_pts) > 0:
            y_min = face_pts[:, 1].min()
            y_max = face_pts[:, 1].max()
            if y_max > abs(y_min):
                # Face is pointing toward +Y; rotate 180 degrees around Z to face -Y
                mesh.rotate_z(180, inplace=True)

        mesh.translate(-np.array(mesh.center), inplace=True)

        return mesh, filename

    def setup_clinical_shading(self, plotter, mesh):
        """Applies warm, natural clinical porcelain shading and lighting for Theme A (Nordic Ice Blue)."""
        actor = plotter.add_mesh(
            mesh,
            color="#D5C4B4",        # Natural warm clinical skin finish with Nordic Ice contrast
            texture=None,
            smooth_shading=True,
            specular=0.35,
            specular_power=20,
            roughness=0.38,
            ambient=0.40,
            diffuse=0.82,
            show_edges=False
        )

        # Studio lighting optimized for Nordic Ice background
        plotter.add_light(pv.Light(position=(0, -16, 6), focal_point=(0, 0, 0), color="#FFFFFF", intensity=0.85))
        plotter.add_light(pv.Light(position=(0, 14, 5), focal_point=(0, 0, 0), color="#D8E6F0", intensity=0.35))
        plotter.add_light(pv.Light(position=(-10, -10, 3), focal_point=(0, 0, 0), color="#E0EDF6", intensity=0.25))

        return actor