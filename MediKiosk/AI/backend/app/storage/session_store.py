import logging
from typing import Dict, Optional, List
from datetime import datetime, timezone
from app.models.schemas import SessionState

logger = logging.getLogger(__name__)

class SessionStore:
    """Session repository supporting high-speed in-memory store and MongoDB-compatible schemas."""

    def __init__(self):
        self._sessions: Dict[str, SessionState] = {}

    def get_session(self, session_id: str) -> Optional[SessionState]:
        return self._sessions.get(session_id)

    def save_session(self, session: SessionState) -> SessionState:
        session.updated_at = datetime.now(timezone.utc)
        self._sessions[session.session_id] = session
        return session

    def list_sessions(self) -> List[SessionState]:
        return list(self._sessions.values())

    def delete_session(self, session_id: str) -> bool:
        if session_id in self._sessions:
            del self._sessions[session_id]
            return True
        return False

session_store = SessionStore()
