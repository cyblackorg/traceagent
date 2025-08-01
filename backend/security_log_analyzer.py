# security_log_analyzer.py - Enhanced Security Log Analysis

import pandas as pd
import json
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from llm_provider import llm_provider
from log_fetcher import log_fetcher
from config import Config

class SecurityLogAnalyzer:
    def __init__(self):
        self.log_schemas = {
            'syslog': ['timestamp', 'host', 'process', 'pid', 'message'],
            'network_logs': ['timestamp', 'src_ip', 'dest_ip', 'protocol', 'src_port', 'dest_port', 'action', 'bytes_sent', 'bytes_received', 'file_hash'],
            'app_logs': ['timestamp', 'level', 'user', 'endpoint', 'message']
        }
        
        # Security patterns for intelligent filtering
        self.security_patterns = {
            'failed_logins': [
                'Failed login', 'authentication failed', 'login failed',
                'invalid password', 'access denied'
            ],
            'sql_injection': [
                "SQL injection", "' OR '1'='1", "' OR 1=1", 
                "'; DROP TABLE", "UNION SELECT", "OR 1=1"
            ],
            'suspicious_ips': [
                'external', 'unknown', 'blocked', 'malicious'
            ],
            'system_warnings': [
                'disk space', 'memory low', 'cpu high', 'warning',
                'error', 'critical', 'failed'
            ],
            'network_attacks': [
                'port scan', 'brute force', 'ddos', 'flood',
                'reconnaissance', 'exploit'
            ]
        }
    
    def parse_security_query(self, query: str, client_id: str) -> Dict[str, Any]:
        """Use LLM to parse natural language query into structured parameters"""
        
        system_prompt = """You are a security log analysis expert. Parse the user's query into structured parameters for log analysis.

Available log types and their schemas:
- syslog: timestamp, host, process, pid, message (system events, login attempts, warnings)
- network_logs: timestamp, src_ip, dest_ip, protocol, src_port, dest_port, action, bytes_sent, bytes_received, file_hash (network traffic, blocked connections)
- app_logs: timestamp, level, user, endpoint, message (user activities, security events, errors)

Security patterns to detect:
- failed_logins: Failed login attempts, authentication failures
- sql_injection: SQL injection attacks, suspicious SQL patterns
- suspicious_ips: External IPs, blocked connections, malicious activity
- system_warnings: Disk space issues, memory problems, system errors
- network_attacks: Port scans, brute force, DDoS attempts

CRITICAL: You must return ONLY a valid JSON object with no extra text, no explanations, no newlines before or after the JSON.

Example JSON response:
{
    "log_types": ["syslog", "network_logs", "app_logs"],
    "filters": {
        "time_range": "today",
        "security_patterns": ["failed_logins", "sql_injection"],
        "specific_filters": {
            "users": [],
            "ips": [],
            "endpoints": [],
            "actions": []
        }
    },
    "correlation": "cross_reference_ips"
}

User query: {query}

Return ONLY the JSON object, no other text, no newlines."""

        messages = [
            {"role": "system", "content": system_prompt.format(query=query)}
        ]
        
        response = llm_provider.query(messages, temperature=0.1, max_tokens=1000)
        
        print(f"[DEBUG] LLM provider response: {response}")
        
        if response.get("success"):
            try:
                content = response["content"].strip()
                print(f"[DEBUG] LLM response content: {content}")
                
                # Clean the content - remove extra whitespace and newlines
                content = content.strip()
                
                # Try to extract JSON from the response
                # Look for JSON-like content between curly braces
                import re
                json_match = re.search(r'\{.*\}', content, re.DOTALL)
                if json_match:
                    json_content = json_match.group(0)
                    # Clean the extracted JSON
                    json_content = json_content.strip()
                    print(f"[DEBUG] Extracted JSON: {json_content}")
                    return json.loads(json_content)
                else:
                    # Try direct parsing after cleaning
                    return json.loads(content)
                    
            except json.JSONDecodeError as e:
                print(f"[DEBUG] JSON decode error: {e}")
                print(f"[DEBUG] Raw content: {response['content']}")
                print(f"[DEBUG] Content length: {len(response['content'])}")
                print(f"[DEBUG] Content repr: {repr(response['content'])}")
                raise Exception(f"Failed to parse LLM response: {e}. Raw content: {repr(response['content'])}")
        else:
            print(f"[DEBUG] LLM query failed: {response.get('error', 'Unknown error')}")
            raise Exception(f"LLM query failed: {response.get('error', 'Unknown error')}")
    
    def _fallback_query_parsing(self, query: str) -> Dict[str, Any]:
        """Fallback parsing when LLM fails"""
        query_lower = query.lower()
        
        log_types = []
        if any(word in query_lower for word in ['login', 'auth', 'system', 'syslog']):
            log_types.append('syslog')
        if any(word in query_lower for word in ['network', 'ip', 'connection', 'traffic']):
            log_types.append('network_logs')
        if any(word in query_lower for word in ['app', 'user', 'endpoint', 'api']):
            log_types.append('app_logs')
        
        if not log_types:
            log_types = ['syslog', 'network_logs', 'app_logs']
        
        return {
            "log_types": log_types,
            "filters": {
                "time_range": "all",
                "security_patterns": [],
                "specific_filters": {}
            },
            "correlation": "timeline_analysis"
        }
    
    def search_logs(self, params: Dict[str, Any], client_id: str) -> Dict[str, Any]:
        """Search logs based on parsed parameters"""
        results = {
            'log_entries': {},
            'insights': {},
            'correlations': {}
        }
        
        # Load relevant log data
        for log_type in params['log_types']:
            log_data = log_fetcher.fetch_log_data(client_id, log_type)
            
            if 'error' in log_data:
                results['log_entries'][log_type] = {'error': log_data['error']}
                continue
            
            # Convert to DataFrame for analysis
            df = pd.DataFrame(log_data['full_data'])
            if df.empty:
                results['log_entries'][log_type] = {'data': [], 'count': 0}
                continue
            
            # Apply filters
            filtered_df = self._apply_filters(df, params, log_type)
            
            # Convert back to records
            filtered_records = filtered_df.to_dict('records') if not filtered_df.empty else []
            
            results['log_entries'][log_type] = {
                'data': filtered_records,
                'count': len(filtered_records),
                'total_available': len(df)
            }
        
        # Generate insights
        results['insights'] = self._generate_insights(results['log_entries'], params)
        
        # Cross-log correlation
        if params.get('correlation'):
            results['correlations'] = self._correlate_logs(results['log_entries'], params['correlation'])
        
        return results
    
    def _apply_filters(self, df: pd.DataFrame, params: Dict[str, Any], log_type: str) -> pd.DataFrame:
        """Apply various filters to the DataFrame"""
        filtered_df = df.copy()
        
        # Time-based filtering
        if 'time_range' in params['filters']:
            filtered_df = self._apply_time_filter(filtered_df, params['filters']['time_range'])
        
        # Security pattern filtering
        if 'security_patterns' in params['filters']:
            filtered_df = self._apply_security_patterns(filtered_df, params['filters']['security_patterns'], log_type)
        
        # Specific filters
        if 'specific_filters' in params['filters']:
            filtered_df = self._apply_specific_filters(filtered_df, params['filters']['specific_filters'], log_type)
        
        return filtered_df
    
    def _apply_time_filter(self, df: pd.DataFrame, time_range: str) -> pd.DataFrame:
        """Apply time-based filtering"""
        if 'timestamp' not in df.columns:
            return df
        
        try:
            df['timestamp'] = pd.to_datetime(df['timestamp'])
            
            if time_range == 'today':
                today = datetime.now().date()
                return df[df['timestamp'].dt.date == today]
            elif time_range == 'yesterday':
                yesterday = (datetime.now() - timedelta(days=1)).date()
                return df[df['timestamp'].dt.date == yesterday]
            elif time_range == 'week':
                week_ago = datetime.now() - timedelta(days=7)
                return df[df['timestamp'] >= week_ago]
            else:
                return df
        except:
            return df
    
    def _apply_security_patterns(self, df: pd.DataFrame, patterns: List[str], log_type: str) -> pd.DataFrame:
        """Apply security pattern filtering"""
        if not patterns:
            return df
        
        # Get the message column name based on log type
        message_col = 'message' if 'message' in df.columns else None
        
        if not message_col:
            return df
        
        # Create a mask for matching patterns
        mask = pd.Series([False] * len(df))
        
        for pattern in patterns:
            if pattern in self.security_patterns:
                pattern_keywords = self.security_patterns[pattern]
                
                for keyword in pattern_keywords:
                    mask |= df[message_col].str.contains(keyword, case=False, na=False)
        
        return df[mask]
    
    def _apply_specific_filters(self, df: pd.DataFrame, filters: Dict[str, Any], log_type: str) -> pd.DataFrame:
        """Apply specific filters (users, IPs, endpoints, etc.)"""
        for filter_type, values in filters.items():
            if not values:
                continue
            
            if filter_type == 'users' and 'user' in df.columns:
                df = df[df['user'].isin(values)]
            elif filter_type == 'ips' and 'src_ip' in df.columns:
                df = df[df['src_ip'].isin(values)]
            elif filter_type == 'endpoints' and 'endpoint' in df.columns:
                df = df[df['endpoint'].isin(values)]
            elif filter_type == 'actions' and 'action' in df.columns:
                df = df[df['action'].isin(values)]
        
        return df
    
    def _generate_insights(self, log_entries: Dict[str, Any], params: Dict[str, Any]) -> Dict[str, Any]:
        """Generate security insights from log data"""
        insights = {
            'total_events': 0,
            'security_events': 0,
            'failed_logins': 0,
            'sql_injections': 0,
            'blocked_connections': 0,
            'system_warnings': 0,
            'suspicious_ips': set(),
            'affected_users': set(),
            'critical_endpoints': set()
        }
        
        for log_type, data in log_entries.items():
            if 'error' in data or 'data' not in data:
                continue
            
            for entry in data['data']:
                insights['total_events'] += 1
                
                # Count security events
                message = entry.get('message', '').lower()
                
                if any(pattern in message for pattern in self.security_patterns['failed_logins']):
                    insights['failed_logins'] += 1
                    insights['security_events'] += 1
                
                if any(pattern in message for pattern in self.security_patterns['sql_injection']):
                    insights['sql_injections'] += 1
                    insights['security_events'] += 1
                
                if any(pattern in message for pattern in self.security_patterns['system_warnings']):
                    insights['system_warnings'] += 1
                    insights['security_events'] += 1
                
                # Track IPs and users
                if 'src_ip' in entry:
                    insights['suspicious_ips'].add(entry['src_ip'])
                
                if 'user' in entry:
                    insights['affected_users'].add(entry['user'])
                
                if 'endpoint' in entry:
                    insights['critical_endpoints'].add(entry['endpoint'])
                
                # Network-specific insights
                if log_type == 'network_logs' and entry.get('action') in ['DROP', 'REJECT']:
                    insights['blocked_connections'] += 1
                    insights['security_events'] += 1
        
        # Convert sets to lists for JSON serialization
        insights['suspicious_ips'] = list(insights['suspicious_ips'])
        insights['affected_users'] = list(insights['affected_users'])
        insights['critical_endpoints'] = list(insights['critical_endpoints'])
        
        return insights
    
    def _correlate_logs(self, log_entries: Dict[str, Any], correlation_type: str) -> Dict[str, Any]:
        """Perform cross-log correlation analysis"""
        correlations = {}
        
        if correlation_type == 'cross_reference_ips':
            # Find IPs that appear across multiple log types
            ip_activity = {}
            
            for log_type, data in log_entries.items():
                if 'data' not in data:
                    continue
                
                for entry in data['data']:
                    ip = entry.get('src_ip') or entry.get('dest_ip')
                    if ip:
                        if ip not in ip_activity:
                            ip_activity[ip] = {'log_types': set(), 'events': []}
                        ip_activity[ip]['log_types'].add(log_type)
                        ip_activity[ip]['events'].append(entry)
            
            # Filter IPs with activity across multiple log types
            correlations['cross_log_ips'] = {
                ip: {
                    'log_types': list(activity['log_types']),
                    'event_count': len(activity['events'])
                }
                for ip, activity in ip_activity.items()
                if len(activity['log_types']) > 1
            }
        
        elif correlation_type == 'user_activity':
            # Track user activity across different log types
            user_activity = {}
            
            for log_type, data in log_entries.items():
                if 'data' not in data:
                    continue
                
                for entry in data['data']:
                    user = entry.get('user')
                    if user:
                        if user not in user_activity:
                            user_activity[user] = {'log_types': set(), 'events': []}
                        user_activity[user]['log_types'].add(log_type)
                        user_activity[user]['events'].append(entry)
            
            correlations['user_activity'] = {
                user: {
                    'log_types': list(activity['log_types']),
                    'event_count': len(activity['events'])
                }
                for user, activity in user_activity.items()
            }
        
        return correlations
    
    def generate_security_summary(self, query: str, results: Dict[str, Any]) -> str:
        """Generate a human-readable security summary"""
        
        system_prompt = """You are a security analyst. Generate a concise, professional summary of security log analysis results.

Focus on:
1. Key security findings and their significance
2. Patterns or trends in the data
3. Potential security risks or concerns
4. Recommended actions if any

Be specific about numbers, users, IPs, and events found.
Keep the tone professional and actionable.

Query: {query}

Results summary:
- Total events analyzed: {total_events}
- Security events found: {security_events}
- Failed logins: {failed_logins}
- SQL injection attempts: {sql_injections}
- Blocked connections: {blocked_connections}
- System warnings: {system_warnings}
- Suspicious IPs: {suspicious_ips}
- Affected users: {affected_users}

Generate a 2-3 sentence summary highlighting the most important security findings."""

        insights = results.get('insights', {})
        
        messages = [
            {"role": "system", "content": system_prompt.format(
                query=query,
                total_events=insights.get('total_events', 0),
                security_events=insights.get('security_events', 0),
                failed_logins=insights.get('failed_logins', 0),
                sql_injections=insights.get('sql_injections', 0),
                blocked_connections=insights.get('blocked_connections', 0),
                system_warnings=insights.get('system_warnings', 0),
                suspicious_ips=len(insights.get('suspicious_ips', [])),
                affected_users=len(insights.get('affected_users', []))
            )}
        ]
        
        response = llm_provider.query(messages, temperature=0.3, max_tokens=300)
        
        if response.get("success"):
            return response["content"].strip()
        else:
            return self._generate_fallback_summary(results)
    
    def _generate_fallback_summary(self, results: Dict[str, Any]) -> str:
        """Generate a fallback summary when LLM fails"""
        insights = results.get('insights', {})
        
        summary_parts = []
        
        if insights.get('security_events', 0) > 0:
            summary_parts.append(f"Found {insights['security_events']} security events")
        
        if insights.get('failed_logins', 0) > 0:
            summary_parts.append(f"{insights['failed_logins']} failed login attempts")
        
        if insights.get('sql_injections', 0) > 0:
            summary_parts.append(f"{insights['sql_injections']} SQL injection attempts")
        
        if insights.get('blocked_connections', 0) > 0:
            summary_parts.append(f"{insights['blocked_connections']} blocked network connections")
        
        if insights.get('system_warnings', 0) > 0:
            summary_parts.append(f"{insights['system_warnings']} system warnings")
        
        if summary_parts:
            return f"Security analysis complete. {'; '.join(summary_parts)}."
        else:
            return "No significant security events found in the analyzed logs."

# Initialize the security log analyzer
security_analyzer = SecurityLogAnalyzer() 