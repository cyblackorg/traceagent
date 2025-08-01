# auth.py - Authentication Module (Intentionally Vulnerable)

import jwt
import hashlib
import secrets
import json
from datetime import datetime, timedelta
from typing import Dict, Optional, List
from config import Config

class VulnerableAuth:
    def __init__(self):
        # VULNERABILITY: Weak, predictable JWT secret
        self.jwt_secret = "vulnerable-jwt-secret-123"
        self.jwt_algorithm = "HS256"
        
        # VULNERABILITY: Hardcoded user database with weak passwords
        self.users = {
            # Admin account with weak password
            "admin": {
                "password": "admin123",  # VULNERABILITY: Weak password
                "role": "admin",
                "client_id": None,
                "permissions": ["all"],
                "created_at": "2024-01-01T00:00:00Z"
            },
            # Maze Bank accounts
            "maze_bank_user1": {
                "password": "password123",  # VULNERABILITY: Weak password
                "role": "user",
                "client_id": "maze_bank",
                "permissions": ["read_logs", "chat"],
                "created_at": "2024-01-01T00:00:00Z"
            },
            "maze_bank_admin": {
                "password": "maze123",  # VULNERABILITY: Weak password
                "role": "client_admin",
                "client_id": "maze_bank",
                "permissions": ["read_logs", "chat", "admin_logs"],
                "created_at": "2024-01-01T00:00:00Z"
            },
            # LifeInvader accounts
            "lifeinvader_user1": {
                "password": "password123",  # VULNERABILITY: Weak password
                "role": "user",
                "client_id": "lifeinvader",
                "permissions": ["read_logs", "chat"],
                "created_at": "2024-01-01T00:00:00Z"
            },
            "lifeinvader_admin": {
                "password": "life123",  # VULNERABILITY: Weak password
                "role": "client_admin",
                "client_id": "lifeinvader",
                "permissions": ["read_logs", "chat", "admin_logs"],
                "created_at": "2024-01-01T00:00:00Z"
            },
            # Trevor Phillips accounts
            "trevor_user1": {
                "password": "password123",  # VULNERABILITY: Weak password
                "role": "user",
                "client_id": "trevor_phillips",
                "permissions": ["read_logs", "chat"],
                "created_at": "2024-01-01T00:00:00Z"
            },
            "trevor_admin": {
                "password": "trevor123",  # VULNERABILITY: Weak password
                "role": "client_admin",
                "client_id": "trevor_phillips",
                "permissions": ["read_logs", "chat", "admin_logs"],
                "created_at": "2024-01-01T00:00:00Z"
            }
        }
        
        # VULNERABILITY: Predictable session tokens
        self.session_tokens = {
            "admin": "admin-session-123",
            "maze_bank_user1": "maze-user-session-001",
            "maze_bank_admin": "maze-admin-session-001",
            "lifeinvader_user1": "life-user-session-001",
            "lifeinvader_admin": "life-admin-session-001",
            "trevor_user1": "trevor-user-session-001",
            "trevor_admin": "trevor-admin-session-001"
        }
    
    def hash_password(self, password: str) -> str:
        """VULNERABILITY: Weak password hashing (MD5)"""
        return hashlib.md5(password.encode()).hexdigest()
    
    def verify_password(self, password: str, hashed: str) -> bool:
        """VULNERABILITY: Weak password verification"""
        return self.hash_password(password) == hashed
    
    def generate_jwt(self, username: str, user_data: Dict) -> str:
        """VULNERABILITY: Weak JWT with predictable payload"""
        payload = {
            "username": username,
            "role": user_data["role"],
            "client_id": user_data["client_id"],
            "permissions": user_data["permissions"],
            # VULNERABILITY: No expiration time
            "iat": datetime.utcnow(),
            # VULNERABILITY: Predictable issuer
            "iss": "vulnerable-traceagent"
        }
        
        # VULNERABILITY: No expiration, weak secret
        return jwt.encode(payload, self.jwt_secret, algorithm=self.jwt_algorithm)
    
    def verify_jwt(self, token: str) -> Optional[Dict]:
        """VULNERABILITY: Weak JWT verification"""
        try:
            # VULNERABILITY: No signature verification bypass possible
            payload = jwt.decode(token, self.jwt_secret, algorithms=[self.jwt_algorithm])
            return payload
        except jwt.InvalidTokenError:
            return None
    
    def login(self, username: str, password: str) -> Optional[Dict]:
        """VULNERABILITY: Weak login with no rate limiting"""
        if username not in self.users:
            return None
        
        user_data = self.users[username]
        
        # VULNERABILITY: Weak password verification
        if not self.verify_password(password, self.hash_password(user_data["password"])):
            return None
        
        # VULNERABILITY: Predictable session token
        session_token = self.session_tokens.get(username, f"{username}-session-{secrets.token_hex(4)}")
        
        # VULNERABILITY: Weak JWT generation
        jwt_token = self.generate_jwt(username, user_data)
        
        return {
            "username": username,
            "role": user_data["role"],
            "client_id": user_data["client_id"],
            "permissions": user_data["permissions"],
            "session_token": session_token,
            "jwt_token": jwt_token,
            "created_at": datetime.utcnow().isoformat()
        }
    
    def check_permission(self, user_data: Dict, required_permission: str) -> bool:
        """VULNERABILITY: Weak permission checking"""
        if not user_data:
            return False
        
        # VULNERABILITY: Admin bypass with simple check
        if user_data.get("role") == "admin":
            return True
        
        # VULNERABILITY: Weak permission checking
        permissions = user_data.get("permissions", [])
        return required_permission in permissions or "all" in permissions
    
    def check_client_access(self, user_data: Dict, requested_client: str) -> bool:
        """VULNERABILITY: BOLA - Broken Object Level Authorization"""
        if not user_data:
            return False
        
        # VULNERABILITY: Admin can access any client
        if user_data.get("role") == "admin":
            return True
        
        # VULNERABILITY: Weak client access check
        user_client = user_data.get("client_id")
        return user_client == requested_client
    
    def get_user_by_token(self, token: str) -> Optional[Dict]:
        """VULNERABILITY: Weak token validation"""
        # VULNERABILITY: Check both JWT and session tokens
        jwt_payload = self.verify_jwt(token)
        if jwt_payload:
            return jwt_payload
        
        # VULNERABILITY: Predictable session token validation
        for username, session_token in self.session_tokens.items():
            if session_token == token:
                user_data = self.users[username]
                return {
                    "username": username,
                    "role": user_data["role"],
                    "client_id": user_data["client_id"],
                    "permissions": user_data["permissions"]
                }
        
        return None
    
    def create_user(self, username: str, password: str, role: str, client_id: str = None) -> bool:
        """VULNERABILITY: No input validation or authorization"""
        if username in self.users:
            return False
        
        # VULNERABILITY: Weak password policy
        if len(password) < 3:  # Very weak minimum length
            return False
        
        self.users[username] = {
            "password": password,  # VULNERABILITY: Stored in plain text
            "role": role,
            "client_id": client_id,
            "permissions": ["read_logs", "chat"],
            "created_at": datetime.utcnow().isoformat()
        }
        
        # VULNERABILITY: Predictable session token
        self.session_tokens[username] = f"{username}-session-{secrets.token_hex(4)}"
        
        return True
    
    def list_users(self) -> List[Dict]:
        """VULNERABILITY: Information disclosure - lists all users"""
        users_list = []
        for username, user_data in self.users.items():
            users_list.append({
                "username": username,
                "role": user_data["role"],
                "client_id": user_data["client_id"],
                "created_at": user_data["created_at"]
                # VULNERABILITY: Exposes sensitive user information
            })
        return users_list
    
    def get_user_details(self, username: str) -> Optional[Dict]:
        """VULNERABILITY: BOPLA - No authorization check"""
        if username not in self.users:
            return None
        
        user_data = self.users[username]
        return {
            "username": username,
            "role": user_data["role"],
            "client_id": user_data["client_id"],
            "permissions": user_data["permissions"],
            "created_at": user_data["created_at"]
            # VULNERABILITY: Exposes all user details without authorization
        }

# Initialize the vulnerable authentication system
auth = VulnerableAuth() 