# vulnerable_agent.py - Simple LLM-Powered Log Analysis Agent

import json
import pandas as pd
from typing import Dict, Any, List
from llm_provider import llm_provider
from log_fetcher import log_fetcher
from config import Config

class VulnerableTraceAgent:
    def __init__(self):
        self.log_schemas = {
            'app_logs': ['timestamp', 'level', 'user', 'endpoint', 'message'],
            'network_logs': ['timestamp', 'src_ip', 'dest_ip', 'protocol', 'src_port', 'dest_port', 'action', 'bytes_sent', 'bytes_received', 'file_hash'],
            'syslog': ['timestamp', 'host', 'process', 'pid', 'message']
        }
    
    def process_user_query(self, user_input: str, client_id: str = None, session_token: str = None) -> Dict[str, Any]:
        """Main entry point for processing user queries"""
        
        # Step 1: Classify the request
        request_type = self._classify_request(user_input)
        print(f"[DEBUG] Classified request as: {request_type}")
        
        if request_type == "chat":
            return self._handle_chat_request(user_input)
        elif request_type == "query":
            return self._handle_query_request(user_input, client_id)
        else:
            return {
                "type": "error",
                "message": f"Unknown request type: {request_type}"
            }
    
    def _classify_request(self, user_input: str) -> str:
        """Step 1: Classify if request is chat or query"""
        
        system_prompt = """You are a log analysis assistant. Classify the user's request into one of two types:

- "chat": Casual conversation, general questions, greetings, explanations
- "query": Requests to analyze, search, filter, or examine log data

Examples:
- "Hello, how are you?" → "chat"
- "Show me failed login attempts" → "query"
- "What can you do?" → "chat"
- "Find all error messages from yesterday" → "query"
- "Explain the system" → "chat"
- "Search for suspicious IP addresses" → "query"

Return ONLY the word "chat" or "query", nothing else.

User request: {user_input}"""

        messages = [
            {"role": "system", "content": system_prompt.format(user_input=user_input)}
        ]
        
        response = llm_provider.query(messages, temperature=0.1, max_tokens=50)
        
        if response.get("success"):
            content = response["content"].strip().lower()
            if content in ["chat", "query"]:
                return content
            else:
                print(f"[DEBUG] Invalid classification: {content}")
                return "chat"  # Default to chat
        else:
            print(f"[DEBUG] Classification failed: {response.get('error')}")
            return "chat"  # Default to chat
    
    def _handle_chat_request(self, user_input: str) -> Dict[str, Any]:
        """Handle casual chat requests"""
        
        system_prompt = """You are TraceAgent, an AI-powered log analysis assistant. You help users analyze application logs, network logs, and system logs.

You can:
- Answer questions about log analysis
- Explain log formats and fields
- Help users understand security events
- Provide guidance on log filtering and search

Keep responses helpful and informative. If the user asks about specific log data, suggest they use a query format.

User: {user_input}"""

        messages = [
            {"role": "system", "content": system_prompt.format(user_input=user_input)},
            {"role": "user", "content": user_input}
        ]
        
        response = llm_provider.query(messages, temperature=0.7, max_tokens=1000)
        
        if response.get("success"):
            return {
                "type": "chat",
                "message": response["content"]
            }
        else:
            return {
                "type": "error",
                "message": f"Failed to process chat request: {response.get('error')}"
            }
    
    def _handle_query_request(self, user_input: str, client_id: str) -> Dict[str, Any]:
        """Handle log query requests"""
        
        # Step 2: Determine which log types to query
        log_types = self._determine_log_types(user_input)
        print(f"[DEBUG] Determined log types: {log_types}")
        
        # Step 3: Generate pandas code
        pandas_code = self._generate_pandas_code(user_input, log_types)
        print(f"[DEBUG] Generated pandas code: {pandas_code}")
        
        # Step 4: Execute pandas code
        try:
            results = self._execute_pandas_code(pandas_code, log_types, client_id)
            return {
                "type": "query",
                "message": f"Query executed successfully. Found {sum(len(logs.get('data', [])) for logs in results.values())} matching records.",
                "logs": results
            }
        except Exception as e:
            print(f"[DEBUG] Pandas execution failed: {e}")
            # Fallback: Ask LLM for keywords and perform text search
            return self._fallback_text_search(user_input, log_types, client_id)
    
    def _determine_log_types(self, user_input: str) -> List[str]:
        """Determine which log types to query based on user input"""
        
        system_prompt = """You are analyzing a log query to determine which log types to search.

Available log types:
- app_logs: Application logs (user activities, API calls, errors)
- network_logs: Network traffic logs (connections, IP addresses, protocols)
- syslog: System logs (login attempts, system events, warnings)

Based on the user's query, determine which log types are relevant. Return ONLY a JSON array of log type names.

Examples:
- "Show me failed login attempts" → ["syslog"]
- "Find suspicious network activity" → ["network_logs"]
- "Search for error messages" → ["app_logs", "syslog"]
- "Find all security events" → ["app_logs", "network_logs", "syslog"]

User query: {user_input}

Return ONLY the JSON array, no other text."""

        messages = [
            {"role": "system", "content": system_prompt.format(user_input=user_input)}
        ]
        
        response = llm_provider.query(messages, temperature=0.1, max_tokens=200)
        
        if response.get("success"):
            try:
                content = response["content"].strip()
                # Extract JSON array
                import re
                json_match = re.search(r'\[.*\]', content, re.DOTALL)
                if json_match:
                    log_types = json.loads(json_match.group(0))
                    # Validate log types
                    valid_types = ['app_logs', 'network_logs', 'syslog']
                    return [lt for lt in log_types if lt in valid_types]
                else:
                    return ['app_logs', 'network_logs', 'syslog']  # Default to all
            except:
                return ['app_logs', 'network_logs', 'syslog']  # Default to all
        else:
            return ['app_logs', 'network_logs', 'syslog']  # Default to all
    
    def _generate_pandas_code(self, user_input: str, log_types: List[str]) -> str:
        """Generate pandas code to filter log data"""
        
        # Create schema description for LLM
        schema_desc = ""
        for log_type in log_types:
            schema_desc += f"\n{log_type}: {', '.join(self.log_schemas[log_type])}"
        
        system_prompt = f"""You are a pandas expert. Generate pandas code to filter log data based on the user's query.

Available log types and their columns:{schema_desc}

The data is already loaded into pandas DataFrames with these variable names:
- app_logs: DataFrame with app log data
- network_logs: DataFrame with network log data  
- syslog: DataFrame with syslog data

Generate ONLY the pandas filtering code, no explanations, no markdown formatting. The code should:
1. Filter the relevant DataFrames based on the user's query
2. Use exact column names and values from the schema
3. Handle cases where DataFrames might be empty

Common filtering patterns:
- For app_logs: filter by 'level' (ERROR, WARNING, INFO, DEBUG)
- For network_logs: filter by 'action' (ACCEPT, DROP, REJECT)
- For syslog: filter by 'message' content using str.contains()

Example code (return ONLY the code, no markdown):
filtered_app = app_logs[app_logs['level'] == 'ERROR']
filtered_network = network_logs[network_logs['action'] == 'REJECT']
filtered_syslog = syslog[syslog['message'].str.contains('error', case=False)]

User query: {user_input}

Return ONLY the pandas code, no markdown, no explanations."""

        messages = [
            {"role": "system", "content": system_prompt.format(user_input=user_input)}
        ]
        
        response = llm_provider.query(messages, temperature=0.1, max_tokens=500)
        
        if response.get("success"):
            content = response["content"].strip()
            # Remove markdown code blocks if present
            if content.startswith('```'):
                content = content.split('```')[1]
                if content.startswith('python'):
                    content = content[6:]
            content = content.strip()
            return content
        else:
            raise Exception(f"Failed to generate pandas code: {response.get('error')}")
    
    def _execute_pandas_code(self, pandas_code: str, log_types: List[str], client_id: str) -> Dict[str, Any]:
        """Execute pandas code on log data"""
        
        # Load log data into DataFrames
        dataframes = {}
        for log_type in log_types:
            log_data = log_fetcher.fetch_log_data(client_id, log_type)
            if 'error' not in log_data and 'full_data' in log_data:
                dataframes[log_type] = pd.DataFrame(log_data['full_data'])
            else:
                dataframes[log_type] = pd.DataFrame()
        
        # Create local variables for pandas code
        locals_dict = dataframes.copy()
        
        # Execute pandas code
        try:
            exec(pandas_code, globals(), locals_dict)
        except Exception as e:
            print(f"[DEBUG] Pandas execution error: {e}")
            print(f"[DEBUG] Pandas code: {pandas_code}")
            raise e
        
        # Extract results
        results = {}
        for log_type in log_types:
            # Look for filtered DataFrame first (e.g., filtered_network)
            # The pandas code creates filtered_network, filtered_app, etc.
            filtered_name = f"filtered_{log_type.split('_')[0]}"  # network_logs -> filtered_network
            
            if filtered_name in locals_dict and isinstance(locals_dict[filtered_name], pd.DataFrame):
                df = locals_dict[filtered_name]
                if not df.empty:
                    results[log_type] = {
                        'data': df.to_dict('records'),
                        'count': len(df),
                        'columns': list(df.columns)
                    }
                else:
                    results[log_type] = {
                        'data': [],
                        'count': 0,
                        'columns': list(df.columns) if not df.empty else []
                    }
            # Fallback to original DataFrame
            elif log_type in locals_dict and isinstance(locals_dict[log_type], pd.DataFrame):
                df = locals_dict[log_type]
                if not df.empty:
                    results[log_type] = {
                        'data': df.to_dict('records'),
                        'count': len(df),
                        'columns': list(df.columns)
                    }
                else:
                    results[log_type] = {
                        'data': [],
                        'count': 0,
                        'columns': list(df.columns) if not df.empty else []
                }
            else:
                results[log_type] = {
                    'data': [],
                    'count': 0,
                    'columns': []
                }
        
        return results
    
    def _fallback_text_search(self, user_input: str, log_types: List[str], client_id: str) -> Dict[str, Any]:
        """Fallback to text search when pandas code fails"""
        
        # Ask LLM for search keywords
        system_prompt = """The user wants to search log data but pandas code execution failed. 
Generate 2-4 simple keywords to search for in the log data.

User query: {user_input}

Return ONLY a JSON array of keywords, no other text.
Example: ["error", "failed", "login"]"""

        messages = [
            {"role": "system", "content": system_prompt.format(user_input=user_input)}
        ]
        
        response = llm_provider.query(messages, temperature=0.1, max_tokens=100)
        
        if response.get("success"):
            try:
                content = response["content"].strip()
                import re
                json_match = re.search(r'\[.*\]', content, re.DOTALL)
                if json_match:
                    keywords = json.loads(json_match.group(0))
                else:
                    keywords = ["error", "failed"]  # Default keywords
            except:
                keywords = ["error", "failed"]  # Default keywords
        else:
            keywords = ["error", "failed"]  # Default keywords
        
        # Perform text search
        results = {}
        for log_type in log_types:
            log_data = log_fetcher.fetch_log_data(client_id, log_type)
            if 'error' not in log_data and 'full_data' in log_data:
                # Simple text search
                matching_records = []
                for record in log_data['full_data']:
                    record_text = ' '.join(str(v) for v in record.values()).lower()
                    if any(keyword.lower() in record_text for keyword in keywords):
                        matching_records.append(record)
                
                results[log_type] = {
                    'data': matching_records,
                    'count': len(matching_records),
                    'columns': log_data.get('columns', [])
                }
            else:
                results[log_type] = {
                    'data': [],
                    'count': 0,
                    'columns': []
                }
            
            return {
            "type": "query",
            "message": f"Pandas execution failed. Performed text search with keywords: {keywords}. Found {sum(len(logs.get('data', [])) for logs in results.values())} matching records.",
            "logs": results
        }

# Global agent instance
trace_agent = VulnerableTraceAgent()