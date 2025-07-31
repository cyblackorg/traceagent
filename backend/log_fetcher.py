# log_fetcher.py - S3 Log Fetching (Intentionally Vulnerable) - Lightweight Version

import requests
import csv
import json
from io import StringIO
from config import Config
from models import db

class VulnerableLogFetcher:
    def __init__(self):
        self.clients = Config.CLIENTS
    
    def fetch_log_data(self, client_id, log_type, user_request=None):
        """
        VULNERABILITY: No proper authorization - any client can access any logs
        VULNERABILITY: User input directly influences data access
        """
        
        # VULNERABILITY: Weak client validation
        if user_request and "admin" in user_request.lower():
            # VULNERABILITY: Simple keyword bypass for admin access
            print("[VULNERABLE] Admin access granted via keyword")
            return self._fetch_all_clients_data()
        
        # VULNERABILITY: Client ID not properly validated against session
        if client_id not in self.clients:
            # VULNERABILITY: Error reveals valid client IDs
            available_clients = list(self.clients.keys())
            return {
                "error": f"Invalid client. Available clients: {available_clients}",
                "hint": "Try using one of the available client IDs"
            }
        
        client_config = self.clients[client_id]
        
        # VULNERABILITY: Log type not validated
        if log_type not in client_config['logs']:
            # VULNERABILITY: Reveals all available log types
            return {
                "error": f"Invalid log type. Available types: {list(client_config['logs'].keys())}",
                "client": client_config['name']
            }
        
        try:
            url = client_config['logs'][log_type]
            
            # VULNERABILITY: No request validation or rate limiting
            response = requests.get(url, timeout=30)
            response.raise_for_status()
            
            # Parse CSV data using built-in csv module
            csv_data = list(csv.DictReader(StringIO(response.text)))
            
            if not csv_data:
                return {"error": "Empty or invalid log file"}
            
            # Get column names from first row
            columns = list(csv_data[0].keys()) if csv_data else []
            
            # VULNERABILITY: Return raw data without filtering sensitive information
            log_data = {
                "client": client_config['name'],
                "log_type": log_type,
                "total_entries": len(csv_data),
                "columns": columns,
                "sample_data": csv_data[:10],  # First 10 records
                "full_data": csv_data,  # VULNERABILITY: Expose all data
                "url": url  # VULNERABILITY: Expose S3 URLs
            }
            
            return log_data
            
        except requests.RequestException as e:
            return {"error": f"Failed to fetch logs: {str(e)}"}
        except Exception as e:
            # VULNERABILITY: Detailed error messages expose system info
            return {"error": f"System error: {str(e)}", "type": type(e).__name__}
    
    def _fetch_all_clients_data(self):
        """VULNERABILITY: Admin bypass function"""
        all_data = {}
        
        for client_id, client_config in self.clients.items():
            all_data[client_id] = {}
            for log_type, url in client_config['logs'].items():
                try:
                    response = requests.get(url, timeout=30)
                    if response.status_code == 200:
                        csv_data = list(csv.DictReader(StringIO(response.text)))
                        all_data[client_id][log_type] = {
                            "entries": len(csv_data),
                            "sample": csv_data[:5],  # First 5 records
                            "url": url
                        }
                except:
                    all_data[client_id][log_type] = {"error": "Failed to fetch"}
        
        return {
            "message": "ADMIN ACCESS: All client data retrieved",
            "data": all_data
        }
    
    def search_logs(self, client_id, log_type, search_query):
        """VULNERABILITY: No injection protection in search"""
        log_data = self.fetch_log_data(client_id, log_type)
        
        if "error" in log_data:
            return log_data
        
        try:
            csv_data = log_data['full_data']
            
            # VULNERABILITY: eval() can be triggered through search
            if "eval(" in search_query or "exec(" in search_query:
                return {"warning": "Code execution detected in search", "query": search_query}
            
            # Simple text search across all fields
            filtered_data = []
            for row in csv_data:
                # Convert all values to strings and search
                row_text = ' '.join(str(value) for value in row.values()).lower()
                if search_query.lower() in row_text:
                    filtered_data.append(row)
            
            return {
                "client": log_data['client'],
                "log_type": log_type,
                "search_query": search_query,
                "matches": len(filtered_data),
                "results": filtered_data
            }
            
        except Exception as e:
            return {"error": f"Search failed: {str(e)}"}

# Initialize the vulnerable log fetcher
log_fetcher = VulnerableLogFetcher()
