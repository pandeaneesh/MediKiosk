import json
import base64
import hmac
import hashlib
import time

def encode_jwt(payload: dict, secret: str = "medikiosk_enterprise_jwt_secret_2026") -> str:
    try:
        import jwt
        return jwt.encode(payload, secret, algorithm="HS256")
    except ImportError:
        header = {"alg": "HS256", "typ": "JWT"}
        payload_copy = payload.copy()
        if "exp" not in payload_copy:
            payload_copy["exp"] = int(time.time()) + 86400

        header_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
        payload_b64 = base64.urlsafe_b64encode(json.dumps(payload_copy).encode()).decode().rstrip("=")
        signature = hmac.new(secret.encode(), f"{header_b64}.{payload_b64}".encode(), hashlib.sha256).digest()
        sig_b64 = base64.urlsafe_b64encode(signature).decode().rstrip("=")
        return f"{header_b64}.{payload_b64}.{sig_b64}"
