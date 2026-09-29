import re
from typing import Any, Dict, List, Optional
from backend.ai.medical_lexicon import (
    INDIAN_PHARMACOPOEIA,
    fuzzy_match_diagnosis,
    fuzzy_match_medicine,
)
from backend.config import CONFIDENCE_THRESHOLD


class MedicalEntityExtractor:
    """
    Extracts structured clinical entities (Medications, Investigations, Vitals)
    from OCR blocks with spatial source grounding (bounding boxes) and
    anti-hallucination verification safeguards.
    """

    # Common medications in Indian clinical practice
    COMMON_MEDS = [
        "metformin", "glimepiride", "vildagliptin", "telmisartan", "amlodipine",
        "atorvastatin", "rosuvastatin", "pantoprazole", "rabeprazole", "omeprazole",
        "paracetamol", "amoxicillin", "azithromycin", "clavulanate", "montelukast",
        "levocetirizine", "thyronorm", "thyroxine", "insulin", "aspirin", "clopidogrel",
        "dydrogesterone", "folic acid", "calcium", "vitamin d3", "ciprofloxacin",
        "cefixime", "ibuprofen", "tramadol", "ondansetron", "domperidone",
        "dextrose", "ors", "saline", "normal saline", "ringer lactate", "multivitamin"
    ]

    # Investigations keywords & typical units
    COMMON_LABS = {
        "hba1c": {"unit": "%", "ref": "< 5.7%", "alias": ["hba1c", "glycated hemoglobin", "glycated he moglobin"]},
        "estimated average glucose": {"unit": "mg/dL", "ref": "70-126 mg/dL", "alias": ["estimated average glucose", "estimated ave rage glucose", "eag"]},
        "fasting blood sugar": {"unit": "mg/dL", "ref": "70-100 mg/dL", "alias": ["fbs", "fasting blood glucose", "fasting blood sugar", "fasting sugar"]},
        "post prandial blood sugar": {"unit": "mg/dL", "ref": "< 140 mg/dL", "alias": ["ppbs", "post prandial", "pp sugar"]},
        "random blood sugar": {"unit": "mg/dL", "ref": "< 140 mg/dL", "alias": ["rbs", "random blood sugar", "random sugar"]},
        "serum creatinine": {"unit": "mg/dL", "ref": "0.7 - 1.3 mg/dL", "alias": ["creatinine", "s. creatinine", "serum creatinine"]},
        "blood urea": {"unit": "mg/dL", "ref": "15 - 40 mg/dL", "alias": ["blood urea", "urea", "b. urea", "bun"]},
        "hemoglobin": {"unit": "g/dL", "ref": "12.0 - 16.0 g/dL", "alias": ["hemoglobin", "hb", "hgb"]},
        "total cholesterol": {"unit": "mg/dL", "ref": "< 200 mg/dL", "alias": ["total cholesterol", "cholesterol"]},
        "triglycerides": {"unit": "mg/dL", "ref": "< 150 mg/dL", "alias": ["triglycerides", "tg", "tgl"]},
        "hdl cholesterol": {"unit": "mg/dL", "ref": "> 40 mg/dL", "alias": ["hdl cholesterol", "hdl", "good cholesterol"]},
        "ldl cholesterol": {"unit": "mg/dL", "ref": "< 100 mg/dL", "alias": ["ldl cholesterol", "ldl", "bad cholesterol"]},
        "esr": {"unit": "mm/hr", "ref": "0 - 20 mm/hr", "alias": ["esr", "erythrocyte sedimentation rate"]},
        "platelet count": {"unit": "lakhs/cumm", "ref": "1.5 - 4.5 lakhs/cumm", "alias": ["platelet count", "platelets", "plateletcount"]},
        "wbc count": {"unit": "cells/cumm", "ref": "4,000 - 11,000", "alias": ["tlc", "wbc", "total leukocyte count"]},
        "sgpt / alt": {"unit": "U/L", "ref": "< 45 U/L", "alias": ["sgpt", "alt", "alanine transaminase"]},
        "sgot / ast": {"unit": "U/L", "ref": "< 40 U/L", "alias": ["sgot", "ast", "aspartate transaminase"]},
        "serum bilirubin": {"unit": "mg/dL", "ref": "0.2 - 1.2 mg/dL", "alias": ["bilirubin", "total bilirubin"]},
        "tsh": {"unit": "uIU/mL", "ref": "0.4 - 4.2 uIU/mL", "alias": ["tsh", "thyroid stimulating hormone"]}
    }

    @classmethod
    def extract_entities(cls, ocr_blocks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Parses OCR blocks into structured medical data with spatial source links and confidence."""
        medications: List[Dict[str, Any]] = []
        investigations: List[Dict[str, Any]] = []
        vitals: List[Dict[str, Any]] = []
        patient_info: Dict[str, Any] = {}
        diagnosis: List[Dict[str, Any]] = []
        document_date: Optional[str] = None

        # Look for document date
        date_pattern = re.compile(r"\b(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})\b")
        for b in ocr_blocks:
            t = b.get("text", "")
            d_match = date_pattern.search(t)
            if d_match and not document_date:
                document_date = d_match.group(1)

        # Iterate through OCR blocks
        for i, block in enumerate(ocr_blocks):
            text = block.get("text", "").strip()
            raw_conf = block.get("confidence", 0.90)
            bbox = block.get("bbox", [0, 0, 0, 0])
            lower_text = text.lower()

            # 1. Check for Patient Info (Header Parsing)
            # Match formats like:
            # "Patient: Rajesh Patel (Age: 52, Male)"
            # "Patient Sunita Patel (Female, Age: 48 Yrs)"
            # "Patient Name: Anand Kulkarni | Age: 58 Yrs | Gender: Male"
            if not patient_info.get("name"):
                name_m = re.search(r"(?:patient\s*(?:name)?|pt\.?\s*name|nane)\s*[:\-\s]\s*([A-Za-z\s\.]+?)(?:\s*[\(\|]|\s*age|$)", text, re.IGNORECASE)
                if name_m:
                    cand = name_m.group(1).strip()
                    if len(cand) > 2 and not any(w in cand.lower() for w in ["admitted", "history", "examination", "sample"]):
                        patient_info["name"] = cand

            if not patient_info.get("age"):
                age_m = re.search(r"(?:age|yr|yrs|years)\s*[:\-]?\s*(\d{1,3})", text, re.IGNORECASE)
                if age_m:
                    patient_info["age"] = age_m.group(1).strip()

            if not patient_info.get("gender"):
                gen_m = re.search(r"\b(male|female|m|f)\b", text, re.IGNORECASE)
                if gen_m and any(k in lower_text for k in ["patient", "age", "gender", "sex", "("]):
                    patient_info["gender"] = "Female" if gen_m.group(1).lower().startswith("f") else "Male"

            # Diagnosis check
            diag_m = re.search(r"(?:diagnosis|provisional\s*diagnosis|impression|imp)\s*[:\-]?\s*([A-Za-z0-9\s,\-]+)", text, re.IGNORECASE)
            if diag_m and not diagnosis:
                cond = diag_m.group(1).strip()
                if len(cond) > 3:
                    diagnosis.append({"condition": cond, "source_text": text, "confidence": 0.92})
            elif not diagnosis:
                f_cond = fuzzy_match_diagnosis(text)
                if f_cond:
                    diagnosis.append({"condition": f_cond, "source_text": text, "confidence": 0.88})

            # 2. Check for Vitals (allow multiple vitals per block/line)
            # BP
            bp_match = re.search(r"\b(?:bp|blood\s*pressure)\s*[:\-]?\s*(\d{2,3}\s*[\/\-]\s*\d{2,3})\s*(?:mm\s*hg)?\b", text, re.IGNORECASE)
            if bp_match and not any(v["name"] == "Blood Pressure" for v in vitals):
                conf = round(raw_conf * 0.96, 2)
                vitals.append({
                    "name": "Blood Pressure",
                    "value": bp_match.group(1).replace(" ", ""),
                    "unit": "mmHg",
                    "confidence": conf,
                    "needs_verification": conf < CONFIDENCE_THRESHOLD,
                    "source": {"page": 1, "text": text, "bbox": bbox}
                })

            # Pulse / Heart Rate
            pulse_match = re.search(r"\b(?:pulse|pr|heart\s*rate|hr)\s*[:\-]?\s*(\d{2,3})\s*(?:bpm|\/min)?\b", text, re.IGNORECASE)
            if pulse_match and not any(v["name"] == "Pulse" for v in vitals):
                conf = round(raw_conf * 0.95, 2)
                vitals.append({
                    "name": "Pulse",
                    "value": pulse_match.group(1),
                    "unit": "bpm",
                    "confidence": conf,
                    "needs_verification": conf < CONFIDENCE_THRESHOLD,
                    "source": {"page": 1, "text": text, "bbox": bbox}
                })

            # SpO2
            spo2_match = re.search(r"\b(?:spo2|o2\s*sat(?:uration)?)\s*[:\-]?\s*(\d{2,3})\s*(?:%)?\b", text, re.IGNORECASE)
            if spo2_match and not any(v["name"].startswith("Oxygen") for v in vitals):
                conf = round(raw_conf * 0.97, 2)
                vitals.append({
                    "name": "Oxygen Saturation (SpO2)",
                    "value": spo2_match.group(1),
                    "unit": "%",
                    "confidence": conf,
                    "needs_verification": conf < CONFIDENCE_THRESHOLD,
                    "source": {"page": 1, "text": text, "bbox": bbox}
                })

            # Temperature
            temp_match = re.search(r"\b(?:temp(?:erature)?)\s*[:\-]?\s*(\d{2,3}(?:\.\d)?)\s*(?:°?([fcFC]))?\b", text, re.IGNORECASE)
            if temp_match and not any(v["name"] == "Temperature" for v in vitals):
                conf = round(raw_conf * 0.94, 2)
                scale = temp_match.group(2).upper() if temp_match.group(2) else "°F"
                vitals.append({
                    "name": "Temperature",
                    "value": temp_match.group(1),
                    "unit": f"°{scale}" if not scale.startswith("°") else scale,
                    "confidence": conf,
                    "needs_verification": conf < CONFIDENCE_THRESHOLD,
                    "source": {"page": 1, "text": text, "bbox": bbox}
                })

            # 3. Check for Investigations / Lab Tests (In-block or Spatial Row-aligned)
            for lab_key, lab_meta in cls.COMMON_LABS.items():
                if any(x["name"].lower() == lab_key.lower() for x in investigations):
                    continue

                matched_alias = None
                if lab_key == "hemoglobin" and ("hba1c" in lower_text or "glycated" in lower_text):
                    continue
                for alias in lab_meta["alias"]:
                    if re.search(r"\b" + re.escape(alias) + r"\b", lower_text):
                        matched_alias = alias
                        break

                if matched_alias:
                    val_str = None
                    unit_str = lab_meta["unit"]
                    ref_str = lab_meta["ref"]
                    target_bbox = bbox

                    # Option A: Value is inside the same block
                    # e.g. "HbA1c 8.2%" or "RBS 340 mg/dL"
                    val_match = re.search(re.escape(matched_alias) + r"[\s\:\-\=]*([0-9]+(?:\.[0-9]+)?)\s*([a-zA-Z\/%]+)?", text, re.IGNORECASE)
                    if not val_match:
                        # Try isolated number in string if string has units or separators
                        val_match = re.search(r"\b([0-9]+(?:\.[0-9]+)?)\s*(?:mg/dl|g/dl|%|u/l|cells|mmol|lakhs)?\b", text, re.IGNORECASE)
                        # Avoid taking number if it's part of test name (e.g. hba1c -> 1)
                        if val_match and val_match.group(1) == "1" and "1c" in lower_text:
                            val_match = None

                    if val_match:
                        val_str = val_match.group(1)
                        if val_match.lastindex and val_match.lastindex >= 2 and val_match.group(2):
                            unit_str = val_match.group(2)

                    # Option B: Spatial table row matching across columns (e.g. in lab reports)
                    if not val_str:
                        # Find OCR blocks on the same horizontal row (similar vertical center Y)
                        y_center = (bbox[1] + bbox[3]) / 2.0
                        row_blocks = []
                        for other_b in ocr_blocks:
                            if other_b is block:
                                continue
                            o_box = other_b.get("bbox", [0, 0, 0, 0])
                            o_cy = (o_box[1] + o_box[3]) / 2.0
                            # Same line (vertical deviation within 18 pixels) and to the right
                            if abs(o_cy - y_center) <= 18 and o_box[0] >= bbox[0]:
                                row_blocks.append(other_b)

                        # Sort row blocks left-to-right
                        row_blocks.sort(key=lambda b: b.get("bbox", [0])[0])

                        # Look for numeric result in row blocks
                        for rb in row_blocks:
                            rb_text = rb.get("text", "").strip()
                            num_m = re.search(r"^([0-9]+(?:\.[0-9]+)?)$", rb_text)
                            if not num_m:
                                num_m = re.search(r"\b([0-9]+(?:\.[0-9]+)?)\b", rb_text)
                            if num_m:
                                val_str = num_m.group(1)
                                target_bbox = rb.get("bbox", bbox)
                                break

                        # Look for reference range or units in row blocks
                        for rb in row_blocks:
                            rb_text = rb.get("text", "").strip()
                            if any(u in rb_text.lower() for u in ["mg/dl", "g/dl", "%", "u/l", "lakhs"]):
                                unit_str = rb_text
                            if any(r in rb_text.lower() for r in ["<", ">", "-", "normal", "desirable"]):
                                ref_str = rb_text

                    if val_str:
                        conf = round(raw_conf * 0.96, 2)
                        investigations.append({
                            "name": lab_key.upper(),
                            "value": val_str,
                            "unit": unit_str,
                            "reference_range": ref_str,
                            "confidence": conf,
                            "needs_verification": conf < CONFIDENCE_THRESHOLD,
                            "source": {"page": 1, "text": f"{lab_key.upper()}: {val_str} {unit_str}", "bbox": target_bbox}
                        })

            # Doctor qualification & contact
            if any(deg in lower_text for deg in ["m.b.b.s", "mbbs", "bams", "bhms", "m.s.", "m.d."]):
                patient_info["doctor_qualification"] = text
            phone_m = re.search(r"\b([6-9]\d{9})\b", text)
            if phone_m:
                curr = patient_info.get("contact", "")
                patient_info["contact"] = f"{curr} / {phone_m.group(1)}" if curr else phone_m.group(1)

            # 4. Check for Medications
            # Skip doctor header / degrees / phone numbers from medication matching
            if any(deg in lower_text for deg in ["m.b.b.s", "mbbs", "bams", "bhms", "m.s.(", "m.d.(", "phone", "contact", "reg"]):
                continue
            if re.search(r"\b[6-9]\d{9}\b", text):
                continue

            # Detection criteria: contains Tab/Cap/Inj/Syrup or known medicine name or dosage patterns (mg/ml/g)
            is_med = False
            matched_med_name = ""
            for med in cls.COMMON_MEDS:
                if med in lower_text:
                    is_med = True
                    matched_med_name = med.capitalize()
                    break

            dosage_match = re.search(r"\b(\d+(?:\.\d+)?\s*(?:mg|mcg|gm|g|ml|iu|units|%))\b", text, re.IGNORECASE)
            freq_match = re.search(r"\b(1\-0\-1|1\-1\-1|1\-0\-0|0\-0\-1|0\-1\-0|od|bd|tds|hs|qid|sos|stat|once daily|twice daily)\b", text, re.IGNORECASE)
            prefix_match = re.search(r"\b(tab|tablet|cap|capsule|syrup|inj|injection|syp|sachet)\.?\s*([A-Za-z0-9\-]+)?", text, re.IGNORECASE)

            # Fuzzy Pharmacopoeia Match for Cursive Doctor Handwriting
            fuzzy_info = None
            if not is_med and not (prefix_match and prefix_match.group(2)):
                f_res = fuzzy_match_medicine(text)
                if not f_res:
                    for tok in text.split():
                        if len(tok) >= 3 and not tok.isdigit() and tok.lower() not in ["and", "for", "with", "the", "date", "age", "tab", "cap"]:
                            f_res = fuzzy_match_medicine(tok)
                            if f_res:
                                break
                if f_res and f_res[2] >= 0.45:
                    is_med = True
                    matched_med_name = f_res[0]
                    fuzzy_info = f_res[1]

            if is_med or (prefix_match and prefix_match.group(2)) or (dosage_match and freq_match):
                # Clean medicine name
                if matched_med_name:
                    med_name = matched_med_name
                elif prefix_match and prefix_match.group(2):
                    med_name = prefix_match.group(2).capitalize()
                else:
                    med_name = text.split()[0]

                if dosage_match:
                    dose_str = dosage_match.group(1)
                elif fuzzy_info and fuzzy_info.get("default_dose"):
                    dose_str = fuzzy_info["default_dose"]
                else:
                    dose_str = "As directed"

                freq_str = freq_match.group(1).upper() if freq_match else "1-0-1"

                # Check if handwriting was ambiguous or low confidence
                is_ambiguous = raw_conf < 0.78 or "..." in text or "?" in text
                conf = round(raw_conf * (0.65 if is_ambiguous else 0.93), 2)
                needs_verify = is_ambiguous or conf < CONFIDENCE_THRESHOLD

                # Filter out pure headers/phrases misdetected as medicine
                if med_name.lower() not in ["discharge", "patient", "course", "hospital", "date", "dr", "department", "advice", "examination"]:
                    if not any(m["name"].lower() == med_name.lower() for m in medications):
                        medications.append({
                            "name": med_name,
                            "dose": dose_str,
                            "frequency": freq_str,
                            "confidence": conf,
                            "needs_verification": needs_verify,
                            "source_text": text,
                            "source": {"page": 1, "text": text, "bbox": bbox}
                        })

        return {
            "document_date": document_date,
            "patient_info": patient_info,
            "diagnosis": diagnosis,
            "medications": medications,
            "investigations": investigations,
            "vitals": vitals,
        }
