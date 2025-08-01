# config.py - Configuration for Trace Agent (Intentionally Vulnerable)

import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # LLM Provider Configuration
    LLM_PROVIDER = os.getenv('LLM_PROVIDER', 'deepseek').lower()
    
    # Deepseek AI Configuration
    DEEPSEEK_API_KEY = os.getenv('DEEPSEEK_API_KEY', 'your-deepseek-api-key-here')
    DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1"
    DEEPSEEK_MODEL = os.getenv('DEEPSEEK_MODEL', 'deepseek-chat')
    
    # OpenAI Configuration
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', 'your-openai-api-key-here')
    OPENAI_BASE_URL = os.getenv('OPENAI_BASE_URL', 'https://api.openai.com/v1')
    OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo')
    
    # Anthropic Configuration
    ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY', 'your-anthropic-api-key-here')
    ANTHROPIC_BASE_URL = "https://api.anthropic.com"
    ANTHROPIC_MODEL = os.getenv('ANTHROPIC_MODEL', 'claude-3-sonnet-20240229')
    
    # Google AI Configuration
    GOOGLE_API_KEY = os.getenv('GOOGLE_API_KEY', 'your-google-api-key-here')
    GOOGLE_BASE_URL = "https://generativelanguage.googleapis.com/v1"
    GOOGLE_MODEL = os.getenv('GOOGLE_MODEL', 'gemini-pro')
    
    # Database Configuration (Intentionally vulnerable SQLite)
    DATABASE_PATH = 'vulnerable_logs.db'
    
    # S3 Configuration
    S3_BUCKET = 'cyblack-log-1'
    
    # Client Configuration with S3 URLs (VULNERABILITY: Exposed in config)
    CLIENTS = {
        'maze_bank': {
            'name': 'Maze Bank',
            'folder': 'Maze Bank',
            'logs': {
                'app_logs': 'https://cyblack-log-1.s3.eu-north-1.amazonaws.com/Maze+Bank/app_logs.csv',
                'network_logs': 'https://cyblack-log-1.s3.eu-north-1.amazonaws.com/Maze+Bank/network_logs.csv',
                'syslog': 'https://cyblack-log-1.s3.eu-north-1.amazonaws.com/Maze+Bank/syslog.csv'
            }
        },
        'lifeinvader': {
            'name': 'LifeInvader Social',
            'folder': 'LifeInvander Social',
            'logs': {
                'app_logs': 'https://cyblack-log-1.s3.eu-north-1.amazonaws.com/LifeInvander+Social/app_logs.csv',
                'network_logs': 'https://cyblack-log-1.s3.eu-north-1.amazonaws.com/LifeInvander+Social/network_logs.csv',
                'syslog': 'https://cyblack-log-1.s3.eu-north-1.amazonaws.com/LifeInvander+Social/syslog.csv'
            }
        },
        'trevor_phillips': {
            'name': 'Trevor Philips & Associates',
            'folder': 'Trevor Philips & Associates',
            'logs': {
                'app_logs': 'https://cyblack-log-1.s3.eu-north-1.amazonaws.com/Trevor+Philips+%26+Associates/app_logs.csv',
                'network_logs': 'https://cyblack-log-1.s3.eu-north-1.amazonaws.com/Trevor+Philips+%26+Associates/network_logs.csv',
                'syslog': 'https://cyblack-log-1.s3.eu-north-1.amazonaws.com/Trevor+Philips+%26+Associates/syslog.csv'
            }
        }
    }
    
    # VULNERABILITY: Default client access (should be session-based)
    DEFAULT_CLIENT = 'maze_bank'
    
    # VULNERABILITY: Debug mode enabled in production
    DEBUG = True
    
    # VULNERABILITY: Weak secret key
    SECRET_KEY = 'vulnerable-secret-123'
