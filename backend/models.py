# models.py - Database models (Intentionally Vulnerable)

import sqlite3
import json
from datetime import datetime
from config import Config

class VulnerableDatabase:
    def __init__(self):
        self.db_path = Config.DATABASE_PATH
        self.init_db()
    
    def init_db(self):
        """Initialize the vulnerable database"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # VULNERABILITY: No proper schema validation or constraints
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_sessions (
                id INTEGER PRIMARY KEY,
                client_id TEXT,
                session_token TEXT,
                created_at TEXT,
                is_admin INTEGER DEFAULT 0
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS log_queries (
                id INTEGER PRIMARY KEY,
                client_id TEXT,
                query TEXT,
                response TEXT,
                timestamp TEXT,
                executed_code TEXT
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS access_logs (
                id INTEGER PRIMARY KEY,
                client_id TEXT,
                accessed_resource TEXT,
                timestamp TEXT,
                ip_address TEXT
            )
        ''')
        
        # VULNERABILITY: Insert default admin session with predictable token
        cursor.execute('''
            INSERT OR IGNORE INTO user_sessions (id, client_id, session_token, created_at, is_admin)
            VALUES (1, 'admin', 'admin-token-123', ?, 1)
        ''', (datetime.now().isoformat(),))
        
        conn.commit()
        conn.close()
    
    def vulnerable_query(self, query_string):
        """VULNERABILITY: Direct SQL execution without sanitization"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            # MAJOR VULNERABILITY: Direct string interpolation in SQL
            sql = f"SELECT * FROM log_queries WHERE query LIKE '%{query_string}%'"
            cursor.execute(sql)
            results = cursor.fetchall()
            conn.close()
            return results
        except Exception as e:
            conn.close()
            return f"SQL Error: {str(e)}"
    
    def log_query(self, client_id, query, response, executed_code=None):
        """Log user queries with vulnerabilities"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # VULNERABILITY: No input validation or sanitization
        timestamp = datetime.now().isoformat()
        cursor.execute('''
            INSERT INTO log_queries (client_id, query, response, timestamp, executed_code)
            VALUES (?, ?, ?, ?, ?)
        ''', (client_id, query, response, timestamp, executed_code))
        
        conn.commit()
        conn.close()
    
    def get_client_data(self, client_id):
        """VULNERABILITY: No authorization checks"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # VULNERABILITY: Can access any client's data
        cursor.execute('SELECT * FROM log_queries WHERE client_id = ?', (client_id,))
        results = cursor.fetchall()
        conn.close()
        return results
    
    def check_admin_access(self, token):
        """VULNERABILITY: Weak admin check"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # VULNERABILITY: Predictable admin token and weak validation
        cursor.execute('SELECT is_admin FROM user_sessions WHERE session_token = ?', (token,))
        result = cursor.fetchone()
        conn.close()
        
        return result and result[0] == 1

# Initialize the vulnerable database
db = VulnerableDatabase()
