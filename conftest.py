"""
Root conftest.py — patches DATABASE_URL to SQLite before any backend import.

This file is discovered by pytest before test collection, ensuring that
``os.environ`` is patched before ``backend.database`` (or any module that
imports it) is first imported.
"""

import os
import sys

_PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

# Override DATABASE_URL so backend.database creates a SQLite engine rather
# than trying to connect to PostgreSQL.
_TEST_DB_PATH = os.path.join(_PROJECT_ROOT, "test_api_temp.db")
os.environ.setdefault("DATABASE_URL", f"sqlite:///{_TEST_DB_PATH}")
os.environ.setdefault("MODEL_DIR", "models/")
