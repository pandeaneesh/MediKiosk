import sys
from PySide6.QtWidgets import QApplication
from mannequin.mannequin_view import MainWindow

def on_pain_data_received(data):
    print("\n" + "="*50)
    print("SUCCESS: 3D Pain Localization Module Finished!")
    print(f"Patient ID:     {data.get('patientId', 'PT-NEW')}")
    print(f"Patient Gender: {data.get('patientGender', data.get('patient_gender'))}")
    print(f"Body Region:    {data.get('bodyRegion', data.get('body_region'))}")
    print(f"Specific Spot:  {data.get('laymanSummary', data.get('layman_summary'))}")
    print(f"Coordinates:    {data.get('coordinates')}")
    print("Ready to pass to the next clinical module.")
    print("="*50 + "\n")

if __name__ == "__main__":
    app = QApplication(sys.argv)

    # CLI arguments: python main.py [gender] [patient_id] [api_base_url]
    gender = sys.argv[1].lower() if len(sys.argv) > 1 and sys.argv[1].lower() in ("male", "female") else "male"
    patient_id = sys.argv[2] if len(sys.argv) > 2 else "PT-NEW"
    api_url = sys.argv[3] if len(sys.argv) > 3 else "http://127.0.0.1:8000"

    window = MainWindow(patient_gender=gender, patient_id=patient_id, api_base_url=api_url)
    window.mannequin.pain_confirmed.connect(on_pain_data_received)
    window.show()
    
    sys.exit(app.exec())