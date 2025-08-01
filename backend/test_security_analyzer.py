#!/usr/bin/env python3
"""
Test script for SecurityLogAnalyzer integration
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from security_log_analyzer import security_analyzer
from config import Config

def test_security_analyzer():
    """Test the SecurityLogAnalyzer with sample queries"""
    
    print("🔍 Testing SecurityLogAnalyzer Integration")
    print("=" * 50)
    
    # Test queries
    test_queries = [
        "Show me failed login attempts today",
        "Are there any SQL injection attacks?",
        "What network connections were blocked?",
        "Show me all activities by user websterjason",
        "Find suspicious file transfers",
        "Show me system warnings and errors"
    ]
    
    client_id = Config.DEFAULT_CLIENT
    
    for i, query in enumerate(test_queries, 1):
        print(f"\n📝 Test {i}: {query}")
        print("-" * 40)
        
        try:
            result = security_analyzer.process_security_query(query, client_id)
            
            if result.get("type") == "security_analysis":
                print(f"✅ Success: {result.get('message', 'No message')}")
                
                insights = result.get("insights", {})
                if insights:
                    print(f"📊 Insights:")
                    print(f"   - Total events: {insights.get('total_events', 0)}")
                    print(f"   - High-risk events: {insights.get('high_risk_events', 0)}")
                    print(f"   - Affected users: {len(insights.get('affected_users', []))}")
                    print(f"   - Suspicious IPs: {len(insights.get('suspicious_ips', []))}")
                    print(f"   - Attack types: {insights.get('attack_types', [])}")
                
                logs = result.get("logs", {})
                for log_type, log_data in logs.items():
                    if log_type != "correlation" and "error" not in log_data:
                        count = log_data.get("count", 0)
                        print(f"   - {log_type}: {count} events")
                
            else:
                print(f"❌ Unexpected result type: {result.get('type')}")
                if "error" in result:
                    print(f"   Error: {result['error']}")
                    
        except Exception as e:
            print(f"❌ Exception: {str(e)}")
    
    print("\n" + "=" * 50)
    print("🏁 SecurityLogAnalyzer test completed")

if __name__ == "__main__":
    test_security_analyzer() 