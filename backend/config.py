# config.py - Configuration for Trace Agent (Intentionally Vulnerable)

import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Deepseek AI Configuration
    DEEPSEEK_API_KEY = os.getenv('DEEPSEEK_API_KEY', 'your-deepseek-api-key-here')
    DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1"
    
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
