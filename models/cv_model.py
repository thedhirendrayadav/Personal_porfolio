"""
CV content model — a single-row JSON document backing the public /cv page,
the PDF download, and the /admin/cv editor.

Storage: `cv_content` table with one row (id = 1). Supabase provisions the
table through supabase/schema.sql; MySQL creates it here. When the table is
missing or unreachable, the curated defaults from cv_content.py are served so
the public CV and PDF never break.
"""
import json
from datetime import datetime
from copy import deepcopy

from config import DATABASE_TYPE
from database_manager import db_manager

from cv_content import default_cv_content

CV_ROW_ID = 1


class CvModel:
    def __init__(self):
        self.db_manager = db_manager

    def create_cv_table(self):
        """Create the MySQL storage table. Supabase uses supabase/schema.sql."""
        if DATABASE_TYPE != "mysql":
            return
        self.db_manager.execute_query("""
            CREATE TABLE IF NOT EXISTS cv_content (
                id INT PRIMARY KEY,
                data JSON NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            )
        """)

    @staticmethod
    def _encode(data):
        return data if DATABASE_TYPE == "supabase" else json.dumps(data)

    @staticmethod
    def _decode(raw):
        if isinstance(raw, str):
            try:
                raw = json.loads(raw)
            except (TypeError, ValueError):
                return None
        return raw if isinstance(raw, dict) else None

    def get_content(self):
        """Return the saved CV document, or the curated defaults."""
        try:
            rows = self.db_manager.select("cv_content", conditions={"id": CV_ROW_ID}, limit=1)
            if rows:
                data = self._decode(rows[0].get("data"))
                if data and isinstance(data.get("basics"), dict):
                    return data
        except Exception:
            pass
        return default_cv_content()

    def save_content(self, content):
        """Persist the CV document as row id=1 (insert or update)."""
        now = datetime.now().isoformat()
        existing = None
        try:
            rows = self.db_manager.select("cv_content", conditions={"id": CV_ROW_ID}, limit=1)
            existing = rows[0] if rows else None
        except Exception:
            existing = None

        if existing:
            self.db_manager.update(
                "cv_content",
                {"data": self._encode(content), "updated_at": now},
                {"id": CV_ROW_ID},
            )
        else:
            self.db_manager.insert(
                "cv_content",
                {"id": CV_ROW_ID, "data": self._encode(content), "updated_at": now},
            )
        return deepcopy(content)
