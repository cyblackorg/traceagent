# TraceAgent

An AI-powered log analysis assistant that helps developers and system administrators analyze application logs, network logs, and syslog data through an intuitive chat interface.

## Project Overview

TraceAgent combines the power of AI with comprehensive log analysis capabilities to help teams quickly identify and resolve issues in their systems. The application features a dual-interface design with a log table on the left and an AI chat interface on the right.

## Architecture

```
traceagent/
├── frontend/           # React-based frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── LogTable.tsx      # Log display and filtering
│   │   │   └── ChatInterface.tsx # AI chat interface
│   │   ├── services/
│   │   │   └── api.ts            # Backend API integration
│   │   └── App.tsx               # Main application component
│   └── README.md                 # Frontend documentation
├── backend/            # Flask-based backend API
│   ├── app.py         # Main Flask application
│   ├── log_fetcher.py # Log data fetching service
│   ├── models.py      # Data models
│   ├── config.py      # Configuration
│   └── README.md      # Backend documentation
└── README.md          # This file
```

## Features

### 🎯 Core Capabilities
- **Multi-source Log Analysis**: Application logs, network logs, and syslog
- **AI-Powered Chat Interface**: Natural language queries for log analysis
- **Real-time Log Display**: Interactive table with search and filtering
- **Smart Log Classification**: Automatic categorization by level and source
- **Export Functionality**: Download filtered log data
- **Multi-client Support**: Switch between different client organizations

### 📊 Log Analysis Features
- **Error Detection**: Identify and categorize errors across all log sources
- **Performance Monitoring**: Analyze response times and latency patterns
- **Security Analysis**: Detect suspicious activities and authentication issues
- **Network Diagnostics**: Monitor connectivity and packet loss
- **Trend Analysis**: Identify patterns and anomalies in log data

### 🤖 AI Assistant Features
- **Natural Language Queries**: Ask questions about your logs in plain English
- **Contextual Responses**: AI understands log analysis terminology
- **Smart Suggestions**: Get recommendations for common log analysis tasks
- **Interactive Analysis**: Follow-up questions and detailed investigations

## Technology Stack

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for component library
- **Lucide React** for modern icons
- **Dark Theme** optimized for log analysis workflows

### Backend
- **Flask** with Flask-RESTX for API
- **CORS** enabled for frontend integration
- **Multi-Provider AI** integration (Deepseek, OpenAI, Anthropic, Google AI)
- **S3 Log Storage** for real log data
- **Swagger UI** for API documentation

## Getting Started

### Prerequisites
- Docker and Docker Compose
- OR Node.js 16+ and Python 3.8+ (for local development)

### Quick Start with Docker (Recommended)

The easiest way to run TraceAgent is using Docker Compose:

1. **Configure LLM Provider (Optional):**
```bash
# Copy example environment file
cp env.example .env

# Edit .env and configure your preferred AI provider
# See LLM_CONFIGURATION.md for detailed instructions
```

2. **Start the development environment:**
```bash
docker compose up
```

3. **Access the application:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5001
- **Backend Swagger**: http://localhost:5001/swagger/

4. **View logs:**
```bash
docker compose logs -f
```

5. **Stop services:**
```bash
docker compose down
```

### LLM Provider Configuration

TraceAgent supports multiple AI providers for the chat interface. You can configure your preferred provider using environment variables:

#### Supported Providers
- **Deepseek AI** (default) - Free tier available
- **OpenAI** - GPT-3.5-turbo, GPT-4
- **Anthropic Claude** - Claude-3 models
- **Google AI** - Gemini Pro

#### Quick Configuration
```bash
# Using OpenAI
export LLM_PROVIDER=openai
export OPENAI_API_KEY=your-api-key-here

# Using Claude
export LLM_PROVIDER=anthropic
export ANTHROPIC_API_KEY=your-api-key-here

# Using Google AI
export LLM_PROVIDER=google
export GOOGLE_API_KEY=your-api-key-here
```

For detailed configuration instructions, see [LLM_CONFIGURATION.md](backend/LLM_CONFIGURATION.md).

### Docker Commands

```bash
docker compose up          # Start services with hot reloading
docker compose up -d       # Start services in background
docker compose down        # Stop services
docker compose logs -f     # View logs in real-time
docker compose build       # Rebuild images
docker compose restart     # Restart services
```

### Local Development Setup

If you prefer to run services locally without Docker:

#### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables:
```bash
cp .env.template .env
# Edit .env and add your Deepseek API key
```

4. Start the backend server:
```bash
python app.py
```

The backend will be available at:
- **API**: http://localhost:5001
- **Swagger UI**: http://localhost:5001/swagger/

#### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Clients

The system supports multiple client organizations:

- **Maze Bank** - Financial services
- **LifeInvader Social** - Social media platform  
- **Trevor Phillips & Associates** - Consulting firm

Each client has access to:
- **Application Logs** - API endpoints, user activities, authentication
- **Network Logs** - Connection attempts, security actions, traffic analysis
- **System Logs** - Host activities, process monitoring, system health

## API Integration

### Frontend-Backend Communication

The frontend communicates with the backend through the following endpoints:

- **`GET /api/health`** - Health check
- **`GET /api/config`** - Get available clients
- **`GET /api/logs/{client_id}/{log_type}`** - Fetch log data
- **`POST /api/chat`** - Send messages to AI assistant
- **`GET /api/admin/all-logs`** - Admin access to all logs

### Key Features

1. **Real-time Log Fetching**: Logs are fetched from S3 storage
2. **Dynamic Client Selection**: Switch between different organizations
3. **AI Chat Integration**: Real AI responses based on log analysis
4. **Error Handling**: Graceful fallbacks for connection issues
5. **Loading States**: Visual feedback during data fetching

## Usage Examples

### Log Analysis Queries
- "Show me all errors from the last hour"
- "Analyze performance issues in the application logs"
- "Check for security events in the network logs"
- "Find database connection failures"
- "What's causing the high latency?"

### Log Table Operations
- Search for specific error messages or patterns
- Filter by log level (ERROR, WARNING, INFO, DEBUG)
- Filter by source (application, network, syslog)
- Switch between different client organizations
- Export filtered results for further analysis

## Development

### Backend Development
- **API Endpoints**: Add new endpoints in `app.py`
- **Log Fetching**: Modify `log_fetcher.py` for different data sources
- **AI Integration**: Update `vulnerable_agent.py` for AI responses
- **Configuration**: Update `config.py` for new clients or settings

### Frontend Development
- **Components**: Add new components in `src/components/`
- **API Service**: Update `src/services/api.ts` for new endpoints
- **Styling**: Use Material-UI's `sx` prop for component styling
- **TypeScript**: Add proper types for all new features

## Security Note

⚠️ **Important**: The backend contains intentional security vulnerabilities for educational purposes. This is designed for training and testing security scenarios in a controlled environment. **DO NOT use in production!**

## Contributing

1. **Frontend Development**: Work in the `frontend/` directory
2. **Backend Development**: Work in the `backend/` directory
3. **Documentation**: Keep README files updated
4. **Code Quality**: Follow TypeScript and Python best practices
5. **Testing**: Ensure all features are thoroughly tested

## License

This project is part of the TraceAgent log analysis platform.