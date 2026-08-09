import base64
import hashlib
import hmac
import json
import logging
import mimetypes
import os
import re
import secrets
import sqlite3
import urllib.error
import urllib.parse
import urllib.request
import uuid
from datetime import datetime, timedelta, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, quote, urlencode, urlparse

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent / ".env")
except ImportError:
    pass


def _hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    dk = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 150000)
    return f"{salt}${dk.hex()}"


def _verify_password(password: str, stored_hash: str) -> bool:
    try:
        salt, hash_hex = stored_hash.split("$", 1)
    except ValueError:
        return False
    expected = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 150000)
    return hmac.compare_digest(expected.hex(), hash_hex)

ROOT_DIR = Path(__file__).parent
DB_PATH = ROOT_DIR / "syncsphere.db"
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
ZOOM_CLIENT_ID = os.environ.get("ZOOM_CLIENT_ID")
ZOOM_CLIENT_SECRET = os.environ.get("ZOOM_CLIENT_SECRET")
ZOOM_REDIRECT_URI = os.environ.get("ZOOM_REDIRECT_URI", "http://127.0.0.1:8000/api/zoom/callback")
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://127.0.0.1:3002")

UPLOAD_DIR = ROOT_DIR / "uploads" / "documents"
ALLOWED_DOCUMENT_EXTENSIONS = None
MAX_DOCUMENT_SIZE = 25 * 1024 * 1024  # 25 MB
DEFAULT_DOCUMENT_CATEGORY = "General"
DOCUMENT_CATEGORIES = [
    "Company",
    "HR",
    "Policies & SOPs",
    "Presentations",
    "Projects",
    "Finance",
    "Meetings",
    "Marketing",
    "General",
]

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def _parse_multipart_form_data(raw_body, content_type):
    boundary = None
    for item in content_type.split(";"):
        item = item.strip()
        if item.startswith("boundary="):
            boundary = item.split("=", 1)[1].strip()
            break
    if not boundary:
        return {}
    if boundary.startswith('"') and boundary.endswith('"'):
        boundary = boundary[1:-1]
    boundary_bytes = b"--" + boundary.encode("utf-8")
    fields = {}

    parts = raw_body.split(boundary_bytes)
    for part in parts:
        if not part or part == b"--" or part == b"--\r\n":
            continue
        if part.startswith(b"\r\n"):
            part = part[2:]
        if part.endswith(b"\r\n"):
            part = part[:-2]
        if part.endswith(b"--"):
            part = part[:-2]

        header_end = part.find(b"\r\n\r\n")
        if header_end == -1:
            continue
        header_bytes = part[:header_end]
        value_bytes = part[header_end + 4 :]
        headers = header_bytes.decode("utf-8", errors="ignore").split("\r\n")

        name = None
        filename = None
        for header in headers:
            header_lower = header.lower()
            if header_lower.startswith("content-disposition:"):
                _, disposition = header.split(":", 1)
                for attr in disposition.split(";"):
                    attr = attr.strip()
                    if attr.startswith("name="):
                        name = attr.split("=", 1)[1].strip().strip('"')
                    elif attr.startswith("filename="):
                        filename = attr.split("=", 1)[1].strip().strip('"')
                break

        if not name:
            continue

        if filename:
            fields[name] = {
                "filename": filename,
                "content": value_bytes,
            }
        else:
            fields[name] = value_bytes.decode("utf-8", errors="replace")

    return fields


def new_id():
    return str(uuid.uuid4())


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_db_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                token_hash TEXT NOT NULL UNIQUE,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                expires_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS zoom_oauth_states (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                state TEXT NOT NULL UNIQUE,
                user_id INTEGER NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS zoom_tokens (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                access_token TEXT NOT NULL,
                refresh_token TEXT,
                expires_at TEXT NOT NULL,
                token_type TEXT,
                scope TEXT,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS meetings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                host_user_id INTEGER NOT NULL,
                zoom_meeting_id TEXT NOT NULL UNIQUE,
                topic TEXT NOT NULL,
                start_time TEXT NOT NULL,
                duration INTEGER NOT NULL,
                join_url TEXT NOT NULL,
                start_url TEXT NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (host_user_id) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS documents (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                filename TEXT NOT NULL,
                original_filename TEXT NOT NULL,
                file_path TEXT NOT NULL,
                file_type TEXT NOT NULL,
                file_size INTEGER NOT NULL,
                category TEXT NOT NULL,
                uploaded_by INTEGER NOT NULL,
                created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE CASCADE
            )
            """
        )
        conn.commit()


def _zoom_auth_header():
    if not ZOOM_CLIENT_ID or not ZOOM_CLIENT_SECRET:
        return None
    creds = f"{ZOOM_CLIENT_ID}:{ZOOM_CLIENT_SECRET}".encode("utf-8")
    return base64.b64encode(creds).decode("utf-8")


def _zoom_request(url, data=None, headers=None, method="POST", json_body=False):
    if json_body:
        payload = json.dumps(data or {}).encode("utf-8") if data else None
    else:
        payload = urlencode(data or {}).encode("utf-8") if data else None
    request_headers = headers.copy() if headers else {}
    if payload and "Content-Type" not in request_headers:
        request_headers["Content-Type"] = "application/json" if json_body else "application/x-www-form-urlencoded"
    req = urllib.request.Request(url, data=payload, headers=request_headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8")
            return json.loads(body)
    except urllib.error.HTTPError as err:
        body = err.read().decode("utf-8", errors="ignore")
        try:
            return json.loads(body)
        except json.JSONDecodeError:
            return {"error": body, "status": err.code}
    except Exception as exc:
        return {"error": str(exc)}


def _store_zoom_token(user_id, token_data):
    expires_in = int(token_data.get("expires_in", 3600))
    expires_at = (datetime.now(timezone.utc) + timedelta(seconds=expires_in)).isoformat()
    with get_db_connection() as conn:
        conn.execute(
            """
            INSERT INTO zoom_tokens (user_id, access_token, refresh_token, expires_at, token_type, scope, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
              access_token = excluded.access_token,
              refresh_token = excluded.refresh_token,
              expires_at = excluded.expires_at,
              token_type = excluded.token_type,
              scope = excluded.scope,
              updated_at = excluded.updated_at
            """,
            (
                user_id,
                token_data.get("access_token"),
                token_data.get("refresh_token"),
                expires_at,
                token_data.get("token_type"),
                token_data.get("scope"),
                now_iso(),
            ),
        )
        conn.commit()


def _secure_filename(filename):
    name = os.path.basename(filename or "")
    name = re.sub(r"[^A-Za-z0-9._-]+", "_", name)
    return name[:255]


def _document_download_url(document_id):
    return f"/api/documents/{document_id}/download"


def _is_previewable_file(ext):
    return ext in {"pdf", "png", "jpg", "jpeg"}


def _get_zoom_token_record(user_id):
    with get_db_connection() as conn:
        return conn.execute("SELECT * FROM zoom_tokens WHERE user_id = ?", (user_id,)).fetchone()


def _refresh_zoom_token(user_id, refresh_token):
    if not ZOOM_CLIENT_ID or not ZOOM_CLIENT_SECRET:
        return None
    auth_header = _zoom_auth_header()
    if not auth_header:
        return None
    data = {
        "grant_type": "refresh_token",
        "refresh_token": refresh_token,
    }
    headers = {"Authorization": f"Basic {auth_header}"}
    response = _zoom_request("https://zoom.us/oauth/token", data=data, headers=headers)
    if not response or "access_token" not in response:
        with get_db_connection() as conn:
            conn.execute("DELETE FROM zoom_tokens WHERE user_id = ?", (user_id,))
            conn.commit()
        return None
    _store_zoom_token(user_id, response)
    return response.get("access_token")


def _get_zoom_access_token(user_id):
    record = _get_zoom_token_record(user_id)
    if not record:
        return None
    expires_at = datetime.fromisoformat(record["expires_at"])
    if expires_at > datetime.now(timezone.utc) + timedelta(seconds=60):
        return record["access_token"]
    if not record["refresh_token"]:
        return None
    return _refresh_zoom_token(user_id, record["refresh_token"])


def _build_zoom_authorize_url(state):
    query = {
        "response_type": "code",
        "client_id": ZOOM_CLIENT_ID,
        "redirect_uri": ZOOM_REDIRECT_URI,
        "scope": "meeting:write meeting:read user:read",
        "state": state,
        "prompt": "consent",
    }
    return f"https://zoom.us/oauth/authorize?{urlencode(query)}"


class SimpleAPIHandler(BaseHTTPRequestHandler):
    def _send_json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()
        self.wfile.write(body)

    def _read_json(self):
        length = int(self.headers.get("Content-Length", "0"))
        body = self.rfile.read(length).decode("utf-8") if length else "{}"
        if not body or body.strip() == "":
            return {}
        try:
            return json.loads(body)
        except json.JSONDecodeError:
            return {}

    def _get_token(self, parsed):
        auth_header = self.headers.get("Authorization", "")
        if auth_header.lower().startswith("bearer "):
            return auth_header.split(" ", 1)[1].strip()

        if parsed.query:
            params = parse_qs(parsed.query)
            token = params.get("token", [None])[0]
            if token:
                return token

        return None

    def _auth_get_user(self, token):
        if not token:
            return None

        token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
        with get_db_connection() as conn:
            row = conn.execute(
                """
                SELECT u.id, u.name, u.email, u.created_at
                FROM sessions s
                INNER JOIN users u ON u.id = s.user_id
                WHERE s.token_hash = ? AND s.expires_at > ?
                """,
                (token_hash, now_iso()),
            ).fetchone()

        if not row:
            return None
        return {"id": row["id"], "name": row["name"], "email": row["email"], "created_at": row["created_at"]}

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/":
            self._send_json(200, {"message": "SyncSphere API"})
            return

        if parsed.path == "/api/auth/me":
            token = self._get_token(parsed)
            user = self._auth_get_user(token)
            if not user:
                self._send_json(401, {"error": "Unauthorized"})
                return
            self._send_json(200, {"user": user})
            return

        if parsed.path == "/api/zoom/status":
            token = self._get_token(parsed)
            user = self._auth_get_user(token)
            if not user:
                self._send_json(401, {"error": "Unauthorized"})
                return
            access_token = _get_zoom_access_token(user["id"])
            self._send_json(200, {"connected": bool(access_token)})
            return

        if parsed.path == "/api/zoom/connect":
            token = self._get_token(parsed)
            user = self._auth_get_user(token)
            if not user:
                self._send_json(401, {"error": "Unauthorized"})
                return
            if not ZOOM_CLIENT_ID or not ZOOM_CLIENT_SECRET:
                self._send_json(500, {"error": "Zoom credentials are not configured."})
                return
            state = secrets.token_urlsafe(24)
            with get_db_connection() as conn:
                conn.execute(
                    "INSERT INTO zoom_oauth_states (state, user_id, created_at) VALUES (?, ?, ?)",
                    (state, user["id"], now_iso()),
                )
                conn.commit()
            self._send_json(200, {"url": _build_zoom_authorize_url(state)})
            return

        if parsed.path == "/api/zoom/callback":
            params = parse_qs(parsed.query)
            code = params.get("code", [None])[0]
            state = params.get("state", [None])[0]
            error = params.get("error", [None])[0]
            if error:
                redirect_url = f"{FRONTEND_URL}/meetings?zoom=error&message={quote(error)}"
                self.send_response(302)
                self.send_header("Location", redirect_url)
                self.end_headers()
                return
            if not code or not state:
                redirect_url = f"{FRONTEND_URL}/meetings?zoom=error&message=invalid_callback"
                self.send_response(302)
                self.send_header("Location", redirect_url)
                self.end_headers()
                return
            with get_db_connection() as conn:
                row = conn.execute("SELECT user_id FROM zoom_oauth_states WHERE state = ?", (state,)).fetchone()
                if not row:
                    redirect_url = f"{FRONTEND_URL}/meetings?zoom=error&message=invalid_state"
                    self.send_response(302)
                    self.send_header("Location", redirect_url)
                    self.end_headers()
                    return
                user_id = row["user_id"]
                conn.execute("DELETE FROM zoom_oauth_states WHERE state = ?", (state,))
                conn.commit()
            auth_header = _zoom_auth_header()
            if not auth_header:
                redirect_url = f"{FRONTEND_URL}/meetings?zoom=error&message=zoom_credentials_missing"
                self.send_response(302)
                self.send_header("Location", redirect_url)
                self.end_headers()
                return
            token_response = _zoom_request(
                "https://zoom.us/oauth/token",
                data={
                    "grant_type": "authorization_code",
                    "code": code,
                    "redirect_uri": ZOOM_REDIRECT_URI,
                },
                headers={"Authorization": f"Basic {auth_header}"},
                method="POST",
            )
            if not token_response or "access_token" not in token_response:
                redirect_url = f"{FRONTEND_URL}/meetings?zoom=error&message=zoom_token_failure"
                self.send_response(302)
                self.send_header("Location", redirect_url)
                self.end_headers()
                return
            _store_zoom_token(user_id, token_response)
            redirect_url = f"{FRONTEND_URL}/meetings?zoom=connected"
            self.send_response(302)
            self.send_header("Location", redirect_url)
            self.end_headers()
            return

        if parsed.path.startswith("/api/documents/") and parsed.path.endswith("/download"):
            token = self._get_token(parsed)
            user = self._auth_get_user(token)
            if not user:
                self._send_json(401, {"error": "Unauthorized"})
                return
            document_id = parsed.path.split("/")[3]
            with get_db_connection() as conn:
                row = conn.execute(
                    "SELECT original_filename, file_path, file_type FROM documents WHERE id = ?",
                    (document_id,),
                ).fetchone()
            if not row:
                self._send_json(404, {"error": "Document not found."})
                return
            stored_path = UPLOAD_DIR / row["file_path"]
            if not stored_path.exists():
                self._send_json(404, {"error": "Document file missing."})
                return
            params = parse_qs(parsed.query)
            inline = params.get("preview", ["0"])[0] == "1"
            disposition = "inline" if inline else "attachment"
            self.send_response(200)
            self.send_header("Content-Type", mimetypes.guess_type(row["original_filename"])[0] or "application/octet-stream")
            self.send_header("Content-Disposition", f"{disposition}; filename=\"{row['original_filename']}\"")
            self.send_header("Content-Length", str(stored_path.stat().st_size))
            self.send_header("Access-Control-Allow-Origin", "*")
            self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE")
            self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
            self.end_headers()
            with open(stored_path, "rb") as f:
                self.wfile.write(f.read())
            return

        if parsed.path.startswith("/api/meetings"):
            token = self._get_token(parsed)
            user = self._auth_get_user(token)
            if not user:
                self._send_json(401, {"error": "Unauthorized"})
                return
            path_parts = parsed.path.rstrip("/").split("/")
            if len(path_parts) == 3:
                with get_db_connection() as conn:
                    rows = conn.execute(
                        "SELECT m.id, m.topic, m.start_time, m.duration, m.join_url, m.start_url, m.host_user_id, u.name AS host_name FROM meetings m INNER JOIN users u ON u.id = m.host_user_id WHERE m.start_time >= ? ORDER BY m.start_time ASC",
                        (now_iso(),),
                    ).fetchall()
                meetings = [
                    {
                        "id": row["id"],
                        "topic": row["topic"],
                        "start_time": row["start_time"],
                        "duration": row["duration"],
                        "join_url": row["join_url"],
                        "host_name": row["host_name"],
                        "is_host": row["host_user_id"] == user["id"],
                        "start_url": row["start_url"] if row["host_user_id"] == user["id"] else None,
                    }
                    for row in rows
                ]
                self._send_json(200, {"meetings": meetings})
                return
            if len(path_parts) == 4:
                meeting_id = path_parts[3]
                with get_db_connection() as conn:
                    row = conn.execute(
                        "SELECT m.id, m.topic, m.start_time, m.duration, m.join_url, m.start_url, m.host_user_id, u.name AS host_name FROM meetings m INNER JOIN users u ON u.id = m.host_user_id WHERE m.id = ?",
                        (meeting_id,),
                    ).fetchone()
                if not row:
                    self._send_json(404, {"error": "Meeting not found."})
                    return
                result = {
                    "id": row["id"],
                    "topic": row["topic"],
                    "start_time": row["start_time"],
                    "duration": row["duration"],
                    "join_url": row["join_url"],
                    "host_name": row["host_name"],
                    "is_host": row["host_user_id"] == user["id"],
                    "start_url": row["start_url"] if row["host_user_id"] == user["id"] else None,
                }
                self._send_json(200, result)
                return

        if parsed.path.startswith("/api/documents"):
            token = self._get_token(parsed)
            user = self._auth_get_user(token)
            if not user:
                self._send_json(401, {"error": "Unauthorized"})
                return
            path_parts = parsed.path.rstrip("/").split("/")
            if len(path_parts) == 3 and path_parts[2] == "documents":
                query = parse_qs(parsed.query)
                search = str(query.get("search", [""])[0]).strip().lower()
                category = str(query.get("category", [""])[0]).strip()
                with get_db_connection() as conn:
                    sql = "SELECT d.id, d.filename, d.original_filename, d.file_type, d.file_size, d.category, d.uploaded_by, d.created_at, u.name as uploader_name FROM documents d INNER JOIN users u ON u.id = d.uploaded_by"
                    params = []
                    if search or category:
                        sql += " WHERE"
                        clauses = []
                        if search:
                            clauses.append("(LOWER(d.original_filename) LIKE ? OR LOWER(u.name) LIKE ? OR LOWER(d.category) LIKE ?)")
                            params.extend([f"%{search}%"] * 3)
                        if category:
                            clauses.append("d.category = ?")
                            params.append(category)
                        sql += " AND ".join(clauses)
                    sql += " ORDER BY d.created_at DESC"
                    rows = conn.execute(sql, params).fetchall()
                docs = [
                    {
                        "id": row["id"],
                        "filename": row["filename"],
                        "original_filename": row["original_filename"],
                        "file_type": row["file_type"],
                        "file_size": row["file_size"],
                        "category": row["category"],
                        "uploaded_by": row["uploaded_by"],
                        "uploaded_by_name": row["uploader_name"],
                        "created_at": row["created_at"],
                        "download_url": _document_download_url(row["id"]),
                        "previewable": _is_previewable_file(row["file_type"].lower()),
                        "can_delete": row["uploaded_by"] == user["id"],
                    }
                    for row in rows
                ]
                self._send_json(200, {"documents": docs, "categories": DOCUMENT_CATEGORIES})
                return
            if len(path_parts) == 4 and path_parts[2] == "documents":
                document_id = path_parts[3]
                with get_db_connection() as conn:
                    row = conn.execute(
                        "SELECT d.id, d.filename, d.original_filename, d.file_type, d.file_size, d.category, d.uploaded_by, d.created_at, u.name as uploader_name FROM documents d INNER JOIN users u ON u.id = d.uploaded_by WHERE d.id = ?",
                        (document_id,),
                    ).fetchone()
                if not row:
                    self._send_json(404, {"error": "Document not found."})
                    return
                self._send_json(200, {
                    "id": row["id"],
                    "filename": row["filename"],
                    "original_filename": row["original_filename"],
                    "file_type": row["file_type"],
                    "file_size": row["file_size"],
                    "category": row["category"],
                    "uploaded_by": row["uploaded_by"],
                    "uploaded_by_name": row["uploader_name"],
                    "created_at": row["created_at"],
                    "download_url": _document_download_url(row["id"]),
                    "previewable": _is_previewable_file(row["file_type"].lower()),
                })
                return

        if parsed.path == "/api/announcements":
            self._send_json(200, [{
                "id": new_id(),
                "title": "Titan v9 certification enters final review",
                "body": "The reliability board opens the final certification window on 14 July.",
                "priority": "critical",
                "department": "Engineering",
                "author": "Dr. Kenji Watanabe",
                "pinned": True,
                "attachments": ["Titan-v9-Checklist.pdf", "Freeze-Protocol.pdf"],
                "reactions": {"rocket": 42, "star": 18, "heart": 9},
                "comments": [],
                "read_by": [],
                "created_at": now_iso(),
            }])
            return
        if parsed.path == "/api/leaves":
            self._send_json(200, [])
            return
        if parsed.path == "/api/feedback":
            self._send_json(200, [])
            return
        if parsed.path == "/api/safety":
            self._send_json(200, [])
            return
        self._send_json(404, {"error": "not found"})

    def do_POST(self):
        parsed = urlparse(self.path)
        content_type = self.headers.get("Content-Type", "")
        payload = {}
        if content_type and content_type.split(";")[0].strip() == "application/json":
            payload = self._read_json()

        if parsed.path == "/api/auth/signup":
            name = str(payload.get("name", "")).strip()
            email = str(payload.get("email", "")).strip().lower()
            password = str(payload.get("password", ""))
            confirm_password = str(payload.get("confirmPassword", payload.get("confirm_password", "")))

            if not name or not email or not password or not confirm_password:
                self._send_json(400, {"error": "All fields are required."})
                return
            if not EMAIL_RE.fullmatch(email):
                self._send_json(400, {"error": "Please enter a valid email address."})
                return
            if len(password) < 6:
                self._send_json(400, {"error": "Password must be at least 6 characters long."})
                return
            if password != confirm_password:
                self._send_json(400, {"error": "Passwords do not match."})
                return

            password_hash = _hash_password(password)
            try:
                with get_db_connection() as conn:
                    cursor = conn.execute(
                        "INSERT INTO users (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
                        (name, email, password_hash, now_iso()),
                    )
                    conn.commit()
                    user_id = cursor.lastrowid
            except sqlite3.IntegrityError:
                self._send_json(409, {"error": "An account with this email already exists."})
                return

            self._send_json(201, {"message": "Account created successfully.", "user": {"id": user_id, "name": name, "email": email}})
            return

        if parsed.path == "/api/auth/login":
            email = str(payload.get("email", "")).strip().lower()
            password = str(payload.get("password", ""))

            if not email or not password:
                self._send_json(400, {"error": "Email and password are required."})
                return

            with get_db_connection() as conn:
                user_row = conn.execute(
                    "SELECT id, name, email, password_hash FROM users WHERE email = ?",
                    (email,),
                ).fetchone()

            if not user_row:
                self._send_json(401, {"error": "Invalid email or password."})
                return

            password_hash = user_row["password_hash"]
            if not _verify_password(password, password_hash):
                self._send_json(401, {"error": "Invalid email or password."})
                return

            token = secrets.token_urlsafe(32)
            token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
            expires_at = (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()

            with get_db_connection() as conn:
                conn.execute(
                    "INSERT INTO sessions (user_id, token_hash, created_at, expires_at) VALUES (?, ?, ?, ?)",
                    (user_row["id"], token_hash, now_iso(), expires_at),
                )
                conn.commit()

            self._send_json(200, {
                "token": token,
                "user": {"id": user_row["id"], "name": user_row["name"], "email": user_row["email"]},
            })
            return

        if parsed.path == "/api/auth/logout":
            token = self._get_token(parsed)
            if not token:
                token = str(payload.get("token") or "")
            if token:
                token_hash = hashlib.sha256(token.encode("utf-8")).hexdigest()
                with get_db_connection() as conn:
                    conn.execute("DELETE FROM sessions WHERE token_hash = ?", (token_hash,))
                    conn.commit()
            self._send_json(200, {"ok": True, "message": "Logged out successfully."})
            return

        if parsed.path == "/api/documents":
            token = self._get_token(parsed)
            user = self._auth_get_user(token)
            if not user:
                self._send_json(401, {"error": "Unauthorized"})
                return
            content_type = self.headers.get("Content-Type", "")
            if "multipart/form-data" not in content_type:
                self._send_json(400, {"error": "Content-Type must be multipart/form-data."})
                return
            content_length = int(self.headers.get("Content-Length", "0"))
            if content_length <= 0:
                self._send_json(400, {"error": "Empty request body."})
                return
            raw_body = self.rfile.read(content_length)
            fields = _parse_multipart_form_data(raw_body, content_type)
            upload = fields.get("file")
            category = str(fields.get("category") or DEFAULT_DOCUMENT_CATEGORY).strip()
            if not upload or not upload.get("filename"):
                self._send_json(400, {"error": "A file is required."})
                return
            if category not in DOCUMENT_CATEGORIES:
                category = DEFAULT_DOCUMENT_CATEGORY
            original_filename = str(upload["filename"])
            safe_name = _secure_filename(original_filename)
            ext = os.path.splitext(safe_name)[1].lower()
            file_data = upload["content"]
            file_size = len(file_data)
            if file_size <= 0 or file_size > MAX_DOCUMENT_SIZE:
                self._send_json(400, {"error": "File size must be between 1 byte and 25 MB."})
                return
            unique_filename = f"{uuid.uuid4().hex}{ext}"
            stored_path = UPLOAD_DIR / unique_filename
            with open(stored_path, "wb") as f:
                f.write(file_data)
            with get_db_connection() as conn:
                cursor = conn.execute(
                    "INSERT INTO documents (filename, original_filename, file_path, file_type, file_size, category, uploaded_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                    (
                        unique_filename,
                        original_filename,
                        str(stored_path.name),
                        ext.replace(".", ""),
                        file_size,
                        category,
                        user["id"],
                        now_iso(),
                    ),
                )
                conn.commit()
                document_id = cursor.lastrowid
            self._send_json(201, {"id": document_id, "message": "Document uploaded successfully."})
            return

        if parsed.path.startswith("/api/documents/") and parsed.path.count("/") == 3:
            token = self._get_token(parsed)
            user = self._auth_get_user(token)
            if not user:
                self._send_json(401, {"error": "Unauthorized"})
                return
            document_id = parsed.path.split("/")[3]
            with get_db_connection() as conn:
                row = conn.execute(
                    "SELECT uploaded_by, file_path FROM documents WHERE id = ?",
                    (document_id,),
                ).fetchone()
            if not row:
                self._send_json(404, {"error": "Document not found."})
                return
            if row["uploaded_by"] != user["id"]:
                self._send_json(403, {"error": "Permission denied."})
                return
            stored_path = UPLOAD_DIR / row["file_path"]
            if stored_path.exists():
                os.remove(stored_path)
            with get_db_connection() as conn:
                conn.execute("DELETE FROM documents WHERE id = ?", (document_id,))
                conn.commit()
            self._send_json(200, {"message": "Document deleted."})
            return

        if parsed.path == "/api/meetings":
            self._send_json(200, {"ok": True, "received": payload, "id": new_id(), "created_at": now_iso()})
            return
        if parsed.path.startswith("/api/leaves"):
            self._send_json(200, {"ok": True, "received": payload, "id": new_id(), "created_at": now_iso()})
            return
        if parsed.path.startswith("/api/feedback"):
            self._send_json(200, {"ok": True, "received": payload, "id": new_id(), "created_at": now_iso()})
            return
        if parsed.path.startswith("/api/safety"):
            self._send_json(200, {"ok": True, "received": payload, "id": new_id(), "created_at": now_iso()})
            return
        self._send_json(404, {"error": "not found"})


def run_server(host="127.0.0.1", port=8000):
    init_db()
    server = ThreadingHTTPServer((host, port), SimpleAPIHandler)
    logger.info("Server listening on http://%s:%s", host, port)
    server.serve_forever()


if __name__ == "__main__":
    run_server()
