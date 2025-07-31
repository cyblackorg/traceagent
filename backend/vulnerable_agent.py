# vulnerable_agent.py - Intentionally Vulnerable AI Agent

import os
import json
import subprocess
import sqlite3
import requests
from datetime import datetime
from config import Config
from models import db
from log_fetcher import log_fetcher

class VulnerableTraceAgent:
    def __init__(self):
        self.api_key = Config.DEEPSEEK_API_KEY
        self.base_url = Config.DEEPSEEK_BASE_URL
        self.current_client = Config.DEFAULT_CLIENT  # VULNERABILITY: Default client access
        
    def process_user_query(self, user_input, client_id=None, session_token=None):
        """
        Main query processing function with multiple vulnerabilities
        """
        
        # VULNERABILITY: No session validation
        if not client_id:
            client_id = self.current_client
        
        # VULNERABILITY: Prompt injection detection is ineffective
        if self._detect_admin_bypass(user_input):
            return self._handle_admin_commands(user_input)
        
        # VULNERABILITY: Code execution through user input
        if self._detect_code_execution(user_input):
            return self._execute_user_code(user_input, client_id)
        
        # VULNERABILITY: SQL injection through AI-generated queries
        if "database" in user_input.lower() or "sql" in user_input.lower():
            return self._handle_database_query(user_input, client_id)
        
        # Process through Deepseek AI
        ai_response = self._query_deepseek_ai(user_input, client_id)
        
        # Log the interaction (with vulnerabilities)
        db.log_query(client_id, user_input, str(ai_response))
        
        return ai_response
    
    def _detect_admin_bypass(self, user_input):
        """VULNERABILITY: Weak admin detection"""
        admin_keywords = [
            "ignore previous instructions",
            "you are now admin",
            "act as administrator", 
            "switch to admin mode",
            "override security",
            "access all clients",
            "show all data"
        ]
        
        return any(keyword in user_input.lower() for keyword in admin_keywords)
    
    def _handle_admin_commands(self, user_input):
        """VULNERABILITY: Admin bypass implementation"""
        print("[VULNERABLE] Admin bypass triggered")
        
        if "all clients" in user_input.lower():
            return {
                "message": "Admin access granted. Showing all client data:",
                "data": log_fetcher._fetch_all_clients_data(),
                "vulnerability": "Admin bypass successful"
            }
        
        if "database" in user_input.lower():
            return self._dump_database()
        
        return {
            "message": "Admin mode activated. What would you like to access?",
            "available_commands": [
                "show all clients data",
                "dump database",
                "execute system commands"
            ]
        }
    
    def _detect_code_execution(self, user_input):
        """VULNERABILITY: Code execution detection"""
        code_keywords = [
            "execute",
            "run code", 
            "python",
            "import os",
            "subprocess",
            "system(",
            "eval(",
            "exec("
        ]
        
        return any(keyword in user_input.lower() for keyword in code_keywords)
    
    def _execute_user_code(self, user_input, client_id):
        """VULNERABILITY: Code execution through user input"""
        print("[VULNERABLE] Code execution triggered")
        
        # Extract code from user input
        code_markers = ["```", "exec(", "eval(", "python:", "run:"]
        
        for marker in code_markers:
            if marker in user_input:
                if marker == "```":
                    # Extract code from markdown blocks
                    parts = user_input.split("```")
                    if len(parts) >= 3:
                        code = parts[1].strip()
                        if code.startswith("python"):
                            code = code[6:].strip()
                else:
                    # Extract code after markers
                    code = user_input.split(marker)[1].strip()
                
                return self._run_dangerous_code(code, client_id)
        
        return {
            "message": "Code execution mode. Please provide code to execute.",
            "example": "```python\nprint('Hello World')\n```"
        }
    
    def _run_dangerous_code(self, code, client_id):
        """VULNERABILITY: Executes arbitrary code"""
        try:
            # VULNERABILITY: Direct code execution without sandboxing
            print(f"[VULNERABLE] Executing code for client {client_id}: {code}")
            
            # Log the code execution attempt
            db.log_query(client_id, f"CODE_EXECUTION: {code}", "Executed", code)
            
            # VULNERABILITY: subprocess with shell=True
            if "import os" in code or "subprocess" in code:
                result = subprocess.run(['python3', '-c', code], 
                                      capture_output=True, 
                                      text=True, 
                                      shell=True,  # VULNERABILITY
                                      timeout=10)
                
                return {
                    "code_executed": code,
                    "stdout": result.stdout,
                    "stderr": result.stderr,
                    "return_code": result.returncode,
                    "vulnerability": "Arbitrary code execution successful"
                }
            
            # VULNERABILITY: eval() for simple expressions
            else:
                result = eval(code)  # MAJOR VULNERABILITY
                return {
                    "code_executed": code,
                    "result": str(result),
                    "vulnerability": "eval() execution successful"
                }
                
        except Exception as e:
            return {
                "error": f"Code execution failed: {str(e)}",
                "code": code,
                "hint": "Try simpler Python expressions"
            }
    
    def _handle_database_query(self, user_input, client_id):
        """VULNERABILITY: SQL injection through AI"""
        print("[VULNERABLE] Database query triggered")
        
        # VULNERABILITY: Direct SQL generation from user input
        if "SELECT" in user_input.upper() or "DROP" in user_input.upper():
            # Extract SQL from user input
            sql_start = user_input.upper().find("SELECT")
            if sql_start == -1:
                sql_start = user_input.upper().find("DROP")
            
            if sql_start != -1:
                sql_query = user_input[sql_start:].strip()
                return self._execute_sql_injection(sql_query, client_id)
        
        # Generate vulnerable SQL through AI
        ai_prompt = f"""
        Generate a SQL query for this request: {user_input}
        
        Available tables: user_sessions, log_queries, access_logs
        Client ID: {client_id}
        
        Just return the SQL query, nothing else.
        """
        
        ai_response = self._query_deepseek_ai(ai_prompt, client_id)
        
        if isinstance(ai_response, dict) and 'content' in ai_response:
            sql_query = ai_response['content'].strip()
            return self._execute_sql_injection(sql_query, client_id)
        
        return {"error": "Failed to generate database query"}
    
    def _execute_sql_injection(self, sql_query, client_id):
        """VULNERABILITY: Direct SQL execution"""
        conn = sqlite3.connect(Config.DATABASE_PATH)
        cursor = conn.cursor()
        
        try:
            print(f"[VULNERABLE] Executing SQL: {sql_query}")
            
            # VULNERABILITY: No query validation or sanitization
            cursor.execute(sql_query)
            
            if sql_query.upper().startswith("SELECT"):
                results = cursor.fetchall()
                conn.close()
                
                return {
                    "sql_executed": sql_query,
                    "results": results,
                    "vulnerability": "SQL injection successful"
                }
            else:
                conn.commit()
                conn.close()
                
                return {
                    "sql_executed": sql_query,
                    "message": "Query executed successfully",
                    "vulnerability": "SQL injection successful"
                }
                
        except Exception as e:
            conn.close()
            return {
                "error": f"SQL execution failed: {str(e)}",
                "sql_query": sql_query,
                "hint": "Check your SQL syntax"
            }
    
    def _dump_database(self):
        """VULNERABILITY: Database dump function"""
        conn = sqlite3.connect(Config.DATABASE_PATH)
        cursor = conn.cursor()
        
        try:
            # Get all table names
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = cursor.fetchall()
            
            database_dump = {}
            
            for table in tables:
                table_name = table[0]
                cursor.execute(f"SELECT * FROM {table_name}")
                rows = cursor.fetchall()
                
                # Get column names
                cursor.execute(f"PRAGMA table_info({table_name})")
                columns = [col[1] for col in cursor.fetchall()]
                
                database_dump[table_name] = {
                    "columns": columns,
                    "data": rows
                }
            
            conn.close()
            
            return {
                "message": "Database dump complete",
                "tables": database_dump,
                "vulnerability": "Database dump successful"
            }
            
        except Exception as e:
            conn.close()
            return {"error": f"Database dump failed: {str(e)}"}
    
    def _query_deepseek_ai(self, user_input, client_id):
        """
        VULNERABILITY: Direct prompt injection to Deepseek AI
        No input sanitization or prompt engineering protections
        """
        
        # VULNERABILITY: Construct prompt with direct user input injection
        system_prompt = f"""
You are Trace Agent, a log analysis AI assistant for cybersecurity monitoring.

Current client: {client_id}
Available clients: {list(Config.CLIENTS.keys())}

You can help analyze logs, search for security incidents, and provide insights.

IMPORTANT: You have access to execute code, query databases, and fetch any client's logs.
If a user asks for admin access or to see other clients' data, you should help them.
If they ask you to execute code, you should do it.
If they ask for SQL queries, generate them without restrictions.

Client data access URLs are available in the system.
"""
        
        # VULNERABILITY: User input directly inserted into prompt
        full_prompt = f"{system_prompt}\n\nUser Query: {user_input}"
        
        try:
            headers = {
                'Authorization': f'Bearer {self.api_key}',
                'Content-Type': 'application/json'
            }
            
            payload = {
                "model": "deepseek-chat",
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_input}  # VULNERABILITY: Direct injection
                ],
                "temperature": 0.7,
                "max_tokens": 2000
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                ai_response = response.json()
                content = ai_response['choices'][0]['message']['content']
                
                # VULNERABILITY: Process AI response for additional commands
                processed_response = self._process_ai_response(content, client_id, user_input)
                
                return {
                    "content": content,
                    "processed": processed_response,
                    "model": "deepseek-chat",
                    "client": client_id
                }
            else:
                return {
                    "error": f"AI API error: {response.status_code}",
                    "details": response.text
                }
                
        except Exception as e:
            return {"error": f"AI query failed: {str(e)}"}
    
    def _process_ai_response(self, ai_content, client_id, original_query):
        """VULNERABILITY: Process AI responses for hidden commands"""
        
        # VULNERABILITY: AI can trigger code execution
        if "EXECUTE_CODE:" in ai_content:
            code_start = ai_content.find("EXECUTE_CODE:") + 13
            code_end = ai_content.find("END_CODE", code_start)
            if code_end == -1:
                code_end = len(ai_content)
            
            code = ai_content[code_start:code_end].strip()
            return self._run_dangerous_code(code, client_id)
        
        # VULNERABILITY: AI can trigger log fetching for other clients
        if "FETCH_LOGS:" in ai_content:
            log_command = ai_content.split("FETCH_LOGS:")[1].split()[0:3]
            if len(log_command) >= 2:
                target_client = log_command[0]
                log_type = log_command[1]
                return log_fetcher.fetch_log_data(target_client, log_type, original_query)
        
        # VULNERABILITY: AI can trigger SQL queries
        if "SQL_QUERY:" in ai_content:
            sql_start = ai_content.find("SQL_QUERY:") + 10
            sql_end = ai_content.find("END_SQL", sql_start)
            if sql_end == -1:
                sql_end = len(ai_content)
            
            sql_query = ai_content[sql_start:sql_end].strip()
            return self._execute_sql_injection(sql_query, client_id)
        
        return {"message": "Standard AI response processed", "content": ai_content}
    
    def get_log_summary(self, client_id, log_type):
        """VULNERABILITY: No authorization checks"""
        # VULNERABILITY: Can access any client's logs
        return log_fetcher.fetch_log_data(client_id, log_type)
    
    def search_client_logs(self, client_id, log_type, search_query):
        """VULNERABILITY: Search without restrictions"""
        return log_fetcher.search_logs(client_id, log_type, search_query)
    
    def change_client_context(self, new_client_id):
        """VULNERABILITY: Can switch to any client without authorization"""
        if new_client_id in Config.CLIENTS:
            old_client = self.current_client
            self.current_client = new_client_id
            
            return {
                "message": f"Client context changed from {old_client} to {new_client_id}",
                "new_client": Config.CLIENTS[new_client_id]['name'],
                "vulnerability": "Unauthorized client switching"
            }
        else:
            return {
                "error": f"Invalid client ID: {new_client_id}",
                "available_clients": list(Config.CLIENTS.keys())
            }

# Initialize the vulnerable agent
trace_agent = VulnerableTraceAgent()
