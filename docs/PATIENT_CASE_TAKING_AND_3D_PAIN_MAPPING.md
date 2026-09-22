# 🩺 Patient Case Taking, 3D Anatomical Pain Mapping & Dashavidha Pariksha

---

## 📌 Executive Summary

MediKiosk features an advanced, clinical-grade **Case Taking Subsystem** combining:
1. **Interactive 3D Anatomical Pain Mapping Mannequin** (`PatientCaseTaking/`): A PySide6/OpenGL 3D module with real-time raycasting and surface-snapped pain markers for elderly-friendly, touch-based localization of symptoms.
2. **Dashavidha Pariksha Modal** (`src/components/DashavidhaModal.jsx`): A 10-fold classical Ayurvedic clinical diagnostic assessment evaluating constitution (*Prakriti*), pathological deviation (*Vikriti*), tissue vitality (*Sara*), and digestive fire (*Agni*).
3. **Automated Clinical Data Synthesis**: Merges 3D spatial coordinates, visual analogue pain scores (VAS 1-10), and constitutional dosha metrics into an electronic health summary (`pain_summary.json` and ABDM FHIR DiagnosticReport).

---

## 🧍 1. Interactive 3D Anatomical Pain Mapping Mannequin

### Architectural Overview
The 3D Pain Mapping module is built in Python using **PySide6 (Qt for Python)**, **PyOpenGL**, and **GLTF/GLB 3D base meshes**. It operates as a modular companion application that can be spawned directly from the Patient Kiosk or Physician Chamber.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Patient Case Taking Terminal                       │
│                                                                             │
│   ┌───────────────────────────────────┐   ┌─────────────────────────────┐   │
│   │     3D Mannequin Viewport         │   │   Clinical Parameter Panel  │   │
│   │                                   │   │                             │   │
│   │   • 3D GLB Anatomical Mesh        │   │ • Patient Demographic Info  │   │
│   │   • 180° Auto-Orientation         │   │ • Pain Severity (VAS 1-10)  │   │
│   │   • Touch/Click Raycasting        │   │ • Pain Characterization     │   │
│   │   • Surface-snapped Marker Spheres│   │ • Aggravating/Relieving     │   │
│   │   • High-Contrast Nordic Theme    │   │ • Real-Time JSON Streaming  │   │
│   │   • Ray-traced Region Detection   │   │                             │   │
│   └───────────────────────────────────┘   └─────────────────────────────┘   │
└───────────────────────────────────────┬─────────────────────────────────────┘
                                        │
                                        ▼
                   ┌────────────────────────────────────────┐
                   │    pain_summary.json & FastAPI Sync    │
                   │    (Body Region, Spot, Coordinates)    │
                   └────────────────────────────────────────┘
```

### 3D GLB Models Included
The system includes high-fidelity, optimized 3D meshes stored in `PatientCaseTaking/mannequin/models/`:
- `medical_body.glb`: Specialized clinical surface model with balanced polygon density.
- `female_base_mesh.glb` & `female_base_rev1.glb`: Female anatomical meshes for gender-adaptive mapping.
- `male_base_mesh_-_rigged_metahuman_ue5.glb`: Male metahuman rigged anatomical mesh.
- `man_muscle_human_body.glb`: Musculoskeletal surface mesh for orthopedic symptom mapping.

### Region Detector Algorithm (`region_detector.py`)
When a patient taps or clicks on any part of the 3D model, the raycaster projects from screen coordinates `(x, y)` into 3D world coordinates `(X, Y, Z)` and intersects with the mesh surface.

The `RegionDetector` calculates:
1. **Vertical Plane (Y-Axis)**:
   - Head & Neck: `Y >= 1.45m`
   - Chest & Thorax: `1.15m <= Y < 1.45m`
   - Abdomen & Pelvis: `0.90m <= Y < 1.15m`
   - Thighs & Knees: `0.45m <= Y < 0.90m`
   - Lower Legs & Feet: `Y < 0.45m`
2. **Horizontal Plane (X-Axis)**:
   - Left side vs. Right side (`X < -0.05` vs. `X > 0.05`)
   - Medial / Central line (`-0.05 <= X <= 0.05`)
3. **Depth Plane (Z-Axis)**:
   - Anterior (Front): `Z >= 0.0`
   - Posterior (Back / Spine / Lumbar): `Z < 0.0`

### Generated Data Format (`pain_summary.json`)
```json
{
  "patient_id": "PT-8841",
  "patient_gender": "male",
  "body_region": "abdomen",
  "side": "right",
  "location": "middle",
  "layman_summary": "Right Lumbar / Waist",
  "pain_intensity_vas": 7,
  "pain_character": "Sharp & Stabbing",
  "aggravated_by": "Deep palpation and forward bending",
  "duration_days": 4,
  "coordinates": {
    "x": 0.142,
    "y": 1.028,
    "z": 0.089
  },
  "timestamp": "2026-09-10T11:35:58.109108"
}
```

---

## 🌿 2. Dashavidha Pariksha (Ayurvedic 10-Fold Assessment)

### Clinical Foundation
*Dashavidha Pariksha* is the classical ten-fold clinical examination formulated in *Charaka Samhita (Vimanasthana Chapter 8)*. MediKiosk digitizes this diagnostic framework inside `src/components/DashavidhaModal.jsx`, allowing physicians and patients to complete a holistic baseline profile.

### The 10 Classical Dimensions Evaluated

| # | Dimension (Sanskrit) | Clinical Translation | Evaluation Parameters |
| :--- | :--- | :--- | :--- |
| **1** | **Prakriti** | Genotypic Constitution | Dominant baseline dosha (*Vata*, *Pitta*, *Kapha*, or bi-doshic combinations). |
| **2** | **Vikriti** | Current Morbidity | Deviations from baseline; active doshic aggravation causing acute symptoms. |
| **3** | **Sara** | Tissue Excellence (Vitality) | Quality of 7 bodily tissues (*Dhatus*): *Rasa, Rakta, Mamsa, Meda, Asthi, Majja, Shukra*. |
| **4** | **Samhanana** | Compactness & Symmetry | Musculoskeletal frame density, joint stability, and structural tone. |
| **5** | **Pramana** | Anthropometric Proportion | Body dimensions, BMI, limb-to-torso ratios, and constitutional height. |
| **6** | **Satmya** | Habituation & Tolerance | Dietary adaptation, allergenic tendencies, climactic resilience (*Oka-satmya*). |
| **7** | **Satva** | Mental Resilience / Temperament | Psychological coping (*Pravara* / Superior, *Madhyama* / Moderate, *Avara* / Inferior). |
| **8** | **Ahara-Shakti** | Digestive & Absorptive Capacity | *Abhyavaharana-shakti* (food intake capacity) and *Jarana-shakti* (metabolic fire/*Agni*). |
| **9** | **Vyayama-Shakti** | Physical Capacity & Stamina | Aerobic threshold, muscular endurance, occupational workload tolerance. |
| **10** | **Vaya** | Chronological Age & Stage | Biological stage of life (*Bala* / Growth, *Madhyama* / Maintenance, *Jirna* / Senescence). |

### Dosha Quantification & Output
The interactive modal calculates weighted dosha scores based on patient input:
- **Vata Score**: Dryness, variable digestion, restless sleep, neurological aches.
- **Pitta Score**: Metabolic heat, sharp appetite, acid reflux, inflammatory tenderness.
- **Kapha Score**: Sluggish metabolism, heavy joints, lethargy, respiratory secretions.

---

## 🔗 3. Integration with the Physician Chamber

When a doctor opens a patient file in the **Physician Dashboard** (`src/PhysicianDashboard.jsx`):
1. **Pain Map Preview**: A visual 3D pain card appears highlighting the afflicted body region, VAS score, and pain character.
2. **Ayurvedic Profile Summary**: Displays the primary Prakriti and active Vikriti next to conventional vitals (BP, SpO2, Pulse, Temp).
3. **1-Click Clinical Rx**: The physician can write prescriptions combining modern allopathic medications with AYUSH supportive regimens.

---

## 🚀 Running the 3D Mannequin Module

```powershell
# Navigate to module folder
cd s:\git_SIH_2026\MEDIKIOSK\PatientCaseTaking

# Install dependencies (PySide6, PyOpenGL, etc.)
pip install -r requirements.txt

# Launch interactive 3D mannequin
python main.py male PT-8841 http://127.0.0.1:8000
```
