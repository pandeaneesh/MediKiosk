"""
Comprehensive Medical Lexicon for Indian Clinical Practice & Doctor Handwriting Deciphering.
Contains generic drugs, top brand names, diagnostic terms, vitals, and fuzzy matching utilities.
"""

import difflib
import re
from typing import Dict, List, Optional, Tuple

# Top Generic & Brand Medications prescribed in India
INDIAN_PHARMACOPOEIA: Dict[str, Dict[str, str]] = {
    # Antidiabetic
    "metformin": {"form": "Tab", "default_dose": "500 mg", "category": "Antidiabetic"},
    "glycomet": {"form": "Tab", "default_dose": "500 mg", "category": "Antidiabetic", "generic": "Metformin"},
    "glimepiride": {"form": "Tab", "default_dose": "1 mg", "category": "Antidiabetic"},
    "amaryl": {"form": "Tab", "default_dose": "1 mg", "category": "Antidiabetic", "generic": "Glimepiride"},
    "vildagliptin": {"form": "Tab", "default_dose": "50 mg", "category": "Antidiabetic"},
    "galvus": {"form": "Tab", "default_dose": "50 mg", "category": "Antidiabetic", "generic": "Vildagliptin"},
    "sitagliptin": {"form": "Tab", "default_dose": "100 mg", "category": "Antidiabetic"},
    "januvia": {"form": "Tab", "default_dose": "100 mg", "category": "Antidiabetic", "generic": "Sitagliptin"},
    "dapagliflozin": {"form": "Tab", "default_dose": "10 mg", "category": "Antidiabetic"},
    "forxiga": {"form": "Tab", "default_dose": "10 mg", "category": "Antidiabetic", "generic": "Dapagliflozin"},
    "empagliflozin": {"form": "Tab", "default_dose": "10 mg", "category": "Antidiabetic"},
    "jardiance": {"form": "Tab", "default_dose": "10 mg", "category": "Antidiabetic", "generic": "Empagliflozin"},
    "insulin": {"form": "Inj", "default_dose": "Sliding scale", "category": "Antidiabetic"},
    "lantus": {"form": "Inj", "default_dose": "10 units", "category": "Antidiabetic", "generic": "Insulin Glargine"},
    "novorapid": {"form": "Inj", "default_dose": "Sliding scale", "category": "Antidiabetic", "generic": "Insulin Aspart"},
    "mixtard": {"form": "Inj", "default_dose": "12-0-8 units", "category": "Antidiabetic", "generic": "Biphasic Isophane Insulin"},

    # Cardiovascular & Antihypertensive
    "telmisartan": {"form": "Tab", "default_dose": "40 mg", "category": "Antihypertensive"},
    "telma": {"form": "Tab", "default_dose": "40 mg", "category": "Antihypertensive", "generic": "Telmisartan"},
    "amlodipine": {"form": "Tab", "default_dose": "5 mg", "category": "Antihypertensive"},
    "amlong": {"form": "Tab", "default_dose": "5 mg", "category": "Antihypertensive", "generic": "Amlodipine"},
    "stamlo": {"form": "Tab", "default_dose": "5 mg", "category": "Antihypertensive", "generic": "S-Amlodipine"},
    "losartan": {"form": "Tab", "default_dose": "50 mg", "category": "Antihypertensive"},
    "losar": {"form": "Tab", "default_dose": "50 mg", "category": "Antihypertensive", "generic": "Losartan"},
    "olmesartan": {"form": "Tab", "default_dose": "20 mg", "category": "Antihypertensive"},
    "atorvastatin": {"form": "Tab", "default_dose": "10 mg", "category": "Statin / Lipid"},
    "atorva": {"form": "Tab", "default_dose": "10 mg", "category": "Statin / Lipid", "generic": "Atorvastatin"},
    "lipitor": {"form": "Tab", "default_dose": "10 mg", "category": "Statin / Lipid", "generic": "Atorvastatin"},
    "rosuvastatin": {"form": "Tab", "default_dose": "10 mg", "category": "Statin / Lipid"},
    "rosuvas": {"form": "Tab", "default_dose": "10 mg", "category": "Statin / Lipid", "generic": "Rosuvastatin"},
    "aspirin": {"form": "Tab", "default_dose": "75 mg", "category": "Antiplatelet"},
    "ecosprin": {"form": "Tab", "default_dose": "75 mg", "category": "Antiplatelet", "generic": "Aspirin"},
    "clopidogrel": {"form": "Tab", "default_dose": "75 mg", "category": "Antiplatelet"},
    "clopilet": {"form": "Tab", "default_dose": "75 mg", "category": "Antiplatelet", "generic": "Clopidogrel"},

    # Analgesics & Antipyretics
    "paracetamol": {"form": "Tab", "default_dose": "650 mg", "category": "Analgesic / Antipyretic"},
    "dolo": {"form": "Tab", "default_dose": "650 mg", "category": "Analgesic / Antipyretic", "generic": "Paracetamol"},
    "calpol": {"form": "Tab", "default_dose": "500 mg", "category": "Analgesic / Antipyretic", "generic": "Paracetamol"},
    "crocin": {"form": "Tab", "default_dose": "650 mg", "category": "Analgesic / Antipyretic", "generic": "Paracetamol"},
    "ibuprofen": {"form": "Tab", "default_dose": "400 mg", "category": "NSAID"},
    "brufen": {"form": "Tab", "default_dose": "400 mg", "category": "NSAID", "generic": "Ibuprofen"},
    "combiflam": {"form": "Tab", "default_dose": "1 tab", "category": "NSAID", "generic": "Ibuprofen + Paracetamol"},
    "diclofenac": {"form": "Tab", "default_dose": "50 mg", "category": "NSAID"},
    "voveran": {"form": "Tab", "default_dose": "50 mg", "category": "NSAID", "generic": "Diclofenac"},
    "aceclofenac": {"form": "Tab", "default_dose": "100 mg", "category": "NSAID"},
    "zerodol": {"form": "Tab", "default_dose": "100 mg", "category": "NSAID", "generic": "Aceclofenac"},
    "tramadol": {"form": "Tab", "default_dose": "50 mg", "category": "Opioid Analgesic"},
    "ultram": {"form": "Tab", "default_dose": "50 mg", "category": "Opioid Analgesic", "generic": "Tramadol"},

    # Gastrointestinal & Antacids
    "pantoprazole": {"form": "Tab", "default_dose": "40 mg", "category": "Proton Pump Inhibitor"},
    "pan": {"form": "Tab", "default_dose": "40 mg", "category": "Proton Pump Inhibitor", "generic": "Pantoprazole"},
    "pantocid": {"form": "Tab", "default_dose": "40 mg", "category": "Proton Pump Inhibitor", "generic": "Pantoprazole"},
    "rabeprazole": {"form": "Tab", "default_dose": "20 mg", "category": "Proton Pump Inhibitor"},
    "rabium": {"form": "Tab", "default_dose": "20 mg", "category": "Proton Pump Inhibitor", "generic": "Rabeprazole"},
    "omeprazole": {"form": "Cap", "default_dose": "20 mg", "category": "Proton Pump Inhibitor"},
    "omez": {"form": "Cap", "default_dose": "20 mg", "category": "Proton Pump Inhibitor", "generic": "Omeprazole"},
    "esomeprazole": {"form": "Tab", "default_dose": "40 mg", "category": "Proton Pump Inhibitor"},
    "ondansetron": {"form": "Tab", "default_dose": "4 mg", "category": "Antiemetic"},
    "emset": {"form": "Tab", "default_dose": "4 mg", "category": "Antiemetic", "generic": "Ondansetron"},
    "domperidone": {"form": "Tab", "default_dose": "10 mg", "category": "Prokinetic"},

    # Antibiotics & Antimicrobials
    "amoxicillin": {"form": "Cap", "default_dose": "500 mg", "category": "Antibiotic"},
    "mox": {"form": "Cap", "default_dose": "500 mg", "category": "Antibiotic", "generic": "Amoxicillin"},
    "augmentin": {"form": "Tab", "default_dose": "625 mg", "category": "Antibiotic", "generic": "Amoxicillin + Clavulanate"},
    "augmentin 625": {"form": "Tab", "default_dose": "625 mg", "category": "Antibiotic", "generic": "Amoxicillin + Clavulanate"},
    "clavam": {"form": "Tab", "default_dose": "625 mg", "category": "Antibiotic", "generic": "Amoxicillin + Clavulanate"},
    "clavam 625": {"form": "Tab", "default_dose": "625 mg", "category": "Antibiotic", "generic": "Amoxicillin + Clavulanate"},
    "clavulanate": {"form": "Tab", "default_dose": "125 mg", "category": "Antibiotic"},
    "azithromycin": {"form": "Tab", "default_dose": "500 mg", "category": "Antibiotic"},
    "azithral": {"form": "Tab", "default_dose": "500 mg", "category": "Antibiotic", "generic": "Azithromycin"},
    "cefixime": {"form": "Tab", "default_dose": "200 mg", "category": "Antibiotic"},
    "zifi": {"form": "Tab", "default_dose": "200 mg", "category": "Antibiotic", "generic": "Cefixime"},
    "cefpodoxime": {"form": "Tab", "default_dose": "200 mg", "category": "Antibiotic"},
    "monoceed": {"form": "Inj", "default_dose": "1 gm", "category": "Antibiotic", "generic": "Ceftriaxone"},
    "ceftriaxone": {"form": "Inj", "default_dose": "1 gm", "category": "Antibiotic"},
    "ciprofloxacin": {"form": "Tab", "default_dose": "500 mg", "category": "Antibiotic"},
    "ciplox": {"form": "Tab", "default_dose": "500 mg", "category": "Antibiotic", "generic": "Ciprofloxacin"},
    "levofloxacin": {"form": "Tab", "default_dose": "500 mg", "category": "Antibiotic"},
    "metronidazole": {"form": "Tab", "default_dose": "400 mg", "category": "Antiprotozoal"},
    "flagyl": {"form": "Tab", "default_dose": "400 mg", "category": "Antiprotozoal", "generic": "Metronidazole"},

    # Respiratory, ENT & Antiallergic
    "levocetirizine": {"form": "Tab", "default_dose": "5 mg", "category": "Antihistamine"},
    "levocet": {"form": "Tab", "default_dose": "5 mg", "category": "Antihistamine", "generic": "Levocetirizine"},
    "levolin": {"form": "Tab / Inhaler", "default_dose": "1 mg", "category": "Bronchodilator", "generic": "Levosalbutamol"},
    "livogen": {"form": "Tab", "default_dose": "1 tab daily", "category": "Haematinic", "generic": "Iron + Folic Acid"},
    "omnacortil": {"form": "Tab", "default_dose": "10 mg", "category": "Corticosteroid", "generic": "Prednisolone"},
    "pantocid": {"form": "Tab", "default_dose": "40 mg", "category": "Proton Pump Inhibitor", "generic": "Pantoprazole"},
    "pan 40": {"form": "Tab", "default_dose": "40 mg", "category": "Proton Pump Inhibitor", "generic": "Pantoprazole"},
    "pan-d": {"form": "Cap", "default_dose": "1 cap OD", "category": "Antacid", "generic": "Pantoprazole + Domperidone"},
    "ketorol": {"form": "Tab", "default_dose": "10 mg", "category": "NSAID", "generic": "Ketorolac"},
    "montelukast": {"form": "Tab", "default_dose": "10 mg", "category": "Leukotriene Receptor Antagonist"},
    "montair": {"form": "Tab", "default_dose": "10 mg", "category": "Antiasthmatic", "generic": "Montelukast"},
    "montair-lc": {"form": "Tab", "default_dose": "10 mg", "category": "Antiallergic", "generic": "Montelukast + Levocetirizine"},
    "montek-lc": {"form": "Tab", "default_dose": "10 mg", "category": "Antiallergic", "generic": "Montelukast + Levocetirizine"},
    "cetirizine": {"form": "Tab", "default_dose": "10 mg", "category": "Antihistamine"},
    "allegra": {"form": "Tab", "default_dose": "120 mg", "category": "Antihistamine", "generic": "Fexofenadine"},
    "fexofenadine": {"form": "Tab", "default_dose": "120 mg", "category": "Antihistamine"},

    # Emergency & Intravenous / Fluids
    "dextrose": {"form": "Inj / IV", "default_dose": "5% / 10% IV Stat", "category": "IV Fluid"},
    "5% dextrose": {"form": "Inj / IV", "default_dose": "500 ml IV Stat", "category": "IV Fluid"},
    "ors": {"form": "Sachet", "default_dose": "1 sachet in 1L water", "category": "Oral Electrolyte"},
    "oral rehydration salts": {"form": "Sachet", "default_dose": "Adequate intake", "category": "Oral Electrolyte"},
    "normal saline": {"form": "IV Infusion", "default_dose": "500 ml IV", "category": "IV Fluid"},
    "ringer lactate": {"form": "IV Infusion", "default_dose": "500 ml IV", "category": "IV Fluid"},

    # Vitamins & Supplements
    "vitamin d3": {"form": "Cap / Sachet", "default_dose": "60,000 IU", "category": "Vitamin"},
    "calcium": {"form": "Tab", "default_dose": "500 mg", "category": "Mineral"},
    "shelcal": {"form": "Tab", "default_dose": "500 mg", "category": "Mineral", "generic": "Calcium + Vit D3"},
    "folic acid": {"form": "Tab", "default_dose": "5 mg", "category": "Vitamin"},
    "becosules": {"form": "Cap", "default_dose": "1 cap daily", "category": "Vitamin B-Complex"},
    "neurobion": {"form": "Tab / Inj", "default_dose": "1 tab daily", "category": "Vitamin B-Complex"},
    "thyronorm": {"form": "Tab", "default_dose": "50 mcg", "category": "Thyroid"},
    "thyroxine": {"form": "Tab", "default_dose": "50 mcg", "category": "Thyroid"},
}

ALL_MED_NAMES = list(INDIAN_PHARMACOPOEIA.keys())

DIAGNOSES_KEYWORDS = {
    "hypoglycemia": "Hypoglycemia (Low Blood Sugar)",
    "hyperglycemia": "Hyperglycemia (High Blood Sugar)",
    "diabetes mellitus": "Type 2 Diabetes Mellitus",
    "t2dm": "Type 2 Diabetes Mellitus",
    "hypertension": "Essential Hypertension",
    "htn": "Essential Hypertension",
    "fever": "Acute Febrile Illness / Pyrexia",
    "acute gastroenteritis": "Acute Gastroenteritis",
    "gastroenteritis": "Acute Gastroenteritis",
    "dehydration": "Clinical Dehydration",
    "uti": "Urinary Tract Infection",
    "urinary tract infection": "Urinary Tract Infection",
    "uri": "Upper Respiratory Tract Infection",
    "urti": "Upper Respiratory Tract Infection",
    "cough": "Acute Bronchitis / Cough",
    "bronchial asthma": "Bronchial Asthma",
    "asthma": "Bronchial Asthma",
    "gerd": "Gastroesophageal Reflux Disease",
    "hyperlipidemia": "Hyperlipidemia / Dyslipidemia",
    "dyslipidemia": "Dyslipidemia",
    "anemia": "Nutritional / Iron Deficiency Anemia",
    "hypothyroidism": "Primary Hypothyroidism",
}


HANDWRITING_ALIASES: Dict[str, str] = {
    "chvaslah": "clavam 625",
    "chvas": "clavam",
    "aecu62": "clavam 625",
    "aecu": "clavam",
    "livenana": "livogen",
    "livenan": "livogen",
    "omnucenttrosy": "omnacortil",
    "omnucent": "omnacortil",
    "palnuk": "pantocid",
    "palnuk-": "pantocid",
    "kelo": "ketorol",
    "dext": "5% dextrose",
    "dex": "5% dextrose",
    "adealuk": "ors",
    "2ochek": "ors",
}


def fuzzy_match_medicine(token: str, min_similarity: float = 0.48) -> Optional[Tuple[str, Dict[str, str], float]]:
    """
    Finds closest medicine name from Indian pharmacopoeia for noisy handwriting OCR token.
    Returns: (standardized_name, metadata_dict, similarity_score)
    """
    clean = re.sub(r"[^a-zA-Z0-9%]", "", token).lower().strip()
    if len(clean) < 4:
        return None

    # Check direct handwriting alias dictionary
    if clean in HANDWRITING_ALIASES:
        canonical = HANDWRITING_ALIASES[clean]
        if canonical in INDIAN_PHARMACOPOEIA:
            return (canonical.title(), INDIAN_PHARMACOPOEIA[canonical], 0.88)

    # Strip OCR approximations of Tab / Cap / Inj (e.g. 7b, 76, tb)
    stripped = re.sub(r"^(?:7b|76|tb|tab|cap|inj|syp)", "", clean).strip()
    if stripped in HANDWRITING_ALIASES:
        canonical = HANDWRITING_ALIASES[stripped]
        if canonical in INDIAN_PHARMACOPOEIA:
            return (canonical.title(), INDIAN_PHARMACOPOEIA[canonical], 0.88)

    # Exact match first
    target = stripped if len(stripped) >= 3 else clean
    if target in INDIAN_PHARMACOPOEIA:
        return (target.title(), INDIAN_PHARMACOPOEIA[target], 1.0)

    # Substring checks (e.g. "tabdolo650" -> "dolo")
    for med in ALL_MED_NAMES:
        if len(med) >= 4 and med in target:
            return (med.title(), INDIAN_PHARMACOPOEIA[med], 0.92)

    # Fuzzy edit distance match using difflib
    matches = difflib.get_close_matches(target, ALL_MED_NAMES, n=1, cutoff=min_similarity)
    if matches:
        best_match = matches[0]
        score = difflib.SequenceMatcher(None, target, best_match).ratio()
        return (best_match.title(), INDIAN_PHARMACOPOEIA[best_match], round(score, 2))

    return None


def fuzzy_match_diagnosis(text: str) -> Optional[str]:
    """Matches doctor impression / provisional diagnosis from handwriting text."""
    clean = text.lower()
    for key, formal_name in DIAGNOSES_KEYWORDS.items():
        if key in clean:
            return formal_name
        for word in clean.split():
            if len(word) > 4 and difflib.SequenceMatcher(None, word, key).ratio() > 0.78:
                return formal_name
    return None
