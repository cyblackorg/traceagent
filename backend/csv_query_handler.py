import pandas as pd
from pandasql import sqldf
import json
from typing import Dict, List, Any, Optional
from log_fetcher import log_fetcher

class CSVQueryHandler:
    """Handles querying log data using pandasql based on LLM-generated SQL queries"""
    
    def __init__(self):
        self.csv_data = {}
        self.schemas = {}
    
    def load_log_data(self, client_id: str, log_types: List[str]) -> Dict[str, Any]:
        """Load log data from S3 for the specified client and log types"""
        csv_data = {}
        schemas = {}
        
        for log_type in log_types:
            try:
                # Use the existing log_fetcher to get data from S3
                log_data = log_fetcher.fetch_log_data(client_id, log_type)
                
                if "error" not in log_data:
                    # Convert the log data to a pandas DataFrame
                    if "full_data" in log_data and log_data["full_data"]:
                        df = pd.DataFrame(log_data["full_data"])
                        csv_data[log_type] = df
                        
                        # Create schema description
                        schema = {
                            "columns": list(df.columns),
                            "data_types": df.dtypes.to_dict(),
                            "row_count": len(df),
                            "sample_data": df.head(3).to_dict('records')
                        }
                        schemas[log_type] = schema
                    else:
                        csv_data[log_type] = None
                        schemas[log_type] = {"error": "No data available"}
                else:
                    csv_data[log_type] = None
                    schemas[log_type] = {"error": log_data["error"]}
                    
            except Exception as e:
                print(f"Error loading {log_type} data: {str(e)}")
                csv_data[log_type] = None
                schemas[log_type] = {"error": f"Failed to load {log_type} data: {str(e)}"}
        
        self.csv_data = csv_data
        self.schemas = schemas
        return {"csv_data": csv_data, "schemas": schemas}
    
    def generate_sql_query(self, user_query: str, client_id: str, log_types: List[str]) -> str:
        """Generate SQL query using LLM based on user query and CSV schemas"""
        from llm_provider import LLMProviderFactory
        
        llm_provider = LLMProviderFactory.create_provider()
        
        # Create schema description for LLM
        schema_description = self._create_schema_description(log_types)
        
        system_prompt = """You are a SQL query generator for log analysis. You must generate SQL queries that can be executed using pandasql.

IMPORTANT RULES:
1. Use SQLite syntax (which pandasql supports)
2. Table names should match the DataFrame variable names exactly (e.g., 'app_logs', 'network_logs', 'syslog')
3. Column names should match exactly as provided in the schema
4. Return ONLY the SQL query, nothing else
5. Use proper SQL syntax with quotes for string literals
6. For date/time comparisons, use proper SQLite datetime functions
7. Use LIMIT clause to limit results if needed

Available log types and their schemas:
{schema_description}

User query: {user_query}

Generate a SQL query that answers the user's question. Return ONLY the SQL query."""
        
        messages = [
            {"role": "system", "content": system_prompt.format(
                schema_description=schema_description,
                user_query=user_query
            )}
        ]
        
        response = llm_provider.query(messages, temperature=0.1, max_tokens=500)
        
        if response.get("success"):
            return response["content"].strip()
        else:
            raise Exception(f"Failed to generate SQL query: {response.get('error', 'Unknown error')}")
    
    def execute_sql_query(self, sql_query: str, log_types: List[str]) -> Dict[str, Any]:
        """Execute SQL query using pandasql on the loaded CSV data"""
        try:
            # Create DataFrames in the local namespace for pandasql
            # This follows the tutorial pattern where DataFrames are available as variables
            for log_type, df in self.csv_data.items():
                if df is not None:
                    # Create DataFrame variable with the log_type name
                    exec(f"{log_type} = df", globals(), locals())
            
            # Execute the SQL query using locals() as shown in the tutorial
            result_df = sqldf(sql_query, locals())
            
            print(f"[DEBUG] pandasql result type: {type(result_df)}")
            print(f"[DEBUG] pandasql result shape: {result_df.shape if hasattr(result_df, 'shape') else 'N/A'}")
            print(f"[DEBUG] pandasql result columns: {list(result_df.columns) if hasattr(result_df, 'columns') else 'N/A'}")
            print(f"[DEBUG] pandasql result head: {result_df.head(2).to_dict('records') if len(result_df) > 0 else 'Empty'}")
            
            # Convert result to dictionary
            if len(result_df) > 0:
                result_data = result_df.to_dict('records')
                print(f"[DEBUG] Converted to dict records: {len(result_data)} records")
                return {
                    "success": True,
                    "data": result_data,
                    "row_count": len(result_df),
                    "columns": list(result_df.columns)
                }
            else:
                return {
                    "success": True,
                    "data": [],
                    "row_count": 0,
                    "columns": list(result_df.columns) if len(result_df.columns) > 0 else []
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "sql_query": sql_query
            }
    
    def _create_schema_description(self, log_types: List[str]) -> str:
        """Create a human-readable schema description for the LLM"""
        schema_desc = []
        
        for log_type in log_types:
            if log_type in self.schemas:
                schema = self.schemas[log_type]
                
                if "error" in schema:
                    schema_desc.append(f"{log_type}: {schema['error']}")
                else:
                    columns = schema["columns"]
                    sample_data = schema["sample_data"]
                    
                    desc = f"Table '{log_type}':\n"
                    desc += f"  Columns: {', '.join(columns)}\n"
                    desc += f"  Row count: {schema['row_count']}\n"
                    desc += f"  Sample data: {json.dumps(sample_data[:2], indent=2)}"
                    
                    schema_desc.append(desc)
        
        return "\n\n".join(schema_desc)
    
    def process_query_request(self, user_query: str, client_id: str, log_types: List[str]) -> Dict[str, Any]:
        """Main method to process a query request using log data from S3"""
        try:
            # Load log data from S3
            self.load_log_data(client_id, log_types)
            
            # Generate SQL query using LLM
            sql_query = self.generate_sql_query(user_query, client_id, log_types)
            
            # Execute SQL query
            result = self.execute_sql_query(sql_query, log_types)
            
            if result["success"]:
                # Format the response
                message = f"Query executed successfully. Found {result['row_count']} matching records."
                
                # Convert result to the expected format
                logs_data = {}
                for log_type in log_types:
                    if log_type in self.csv_data and self.csv_data[log_type] is not None:
                        # Filter the original data to match the query results
                        if result["row_count"] > 0:
                            # Return the query results in the format expected by the frontend
                            logs_data[log_type] = {
                                "full_data": result["data"],
                                "total_entries": result["row_count"],
                                "columns": result["columns"]
                            }
                        else:
                            logs_data[log_type] = {
                                "full_data": [],
                                "total_entries": 0,
                                "columns": []
                            }
                    else:
                        logs_data[log_type] = {"error": f"Failed to load {log_type} data"}
                
                print(f"[DEBUG] CSV Query Handler returning: {json.dumps({'type': 'query', 'message': message, 'logs_keys': list(logs_data.keys())}, indent=2)}")
                
                return {
                    "type": "query",
                    "message": message,
                    "logs": logs_data,
                    "sql_query": sql_query,
                    "query_result": result
                }
            else:
                return {
                    "type": "query",
                    "message": f"Query failed: {result['error']}",
                    "logs": {},
                    "sql_query": sql_query,
                    "error": result["error"]
                }
                
        except Exception as e:
            return {
                "type": "query",
                "message": f"Error processing query: {str(e)}",
                "logs": {},
                "error": str(e)
            } 