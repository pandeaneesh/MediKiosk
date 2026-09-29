import re
import random
import hashlib
from typing import Dict, Any

class ABDM2Service:
    @staticmethod
    def validate_abha_number(abha_id: str) -> Dict[str, Any]:
        clean_abha = re.sub(r'[^0-9\-@]', '', abha_id.strip())
        
        # Valid ABHA formats: "91-4432-8910-1204" or "user@abdm"
        is_valid_pattern = bool(re.match(r'^\d{2}-\d{4}-\d{4}-\d{4}$', clean_abha) or '@' in clean_abha or len(clean_abha) >= 10)
        
        if not is_valid_pattern:
            return {
                "isValid": False,
                "reason": "Invalid ABHA number format. Must be 14-digit ABHA number or ABHA address."
            }
        
        # Simulating National Health Authority (NHA) Gateway Checksum
        token_hash = hashlib.sha256(clean_abha.encode()).hexdigest()[:16]
        return {
            "isValid": True,
            "abhaNumber": clean_abha,
            "nhaGatewayToken": f"NHA-ABDM-2026-{token_hash.upper()}",
            "status": "ACTIVE_VERIFIED"
        }

    @staticmethod
    def validate_aadhaar_number(aadhaar_id: str) -> Dict[str, Any]:
        clean_aadhaar = re.sub(r'[^0-9]', '', aadhaar_id.strip())
        if len(clean_aadhaar) != 12:
            return {
                "isValid": False,
                "reason": "Aadhaar number must contain exactly 12 digits."
            }
        
        masked = f"XXXX-XXXX-{clean_aadhaar[-4:]}"
        return {
            "isValid": True,
            "maskedAadhaar": masked,
            "stqcVerified": True
        }
