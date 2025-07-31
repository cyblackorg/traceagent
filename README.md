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
│   │   └── App.tsx               # Main application component
│   └── README.md                 # Frontend documentation
├── backend/            # Backend API (under development)
└── README.md          # This file
```

## Features

### 🎯 Core Capabilities
- **Multi-source Log Analysis**: Application logs, network logs, and syslog
- **AI-Powered Chat Interface**: Natural language queries for log analysis
- **Real-time Log Display**: Interactive table with search and filtering
- **Smart Log Classification**: Automatic categorization by level and source
- **Export Functionality**: Download filtered log data

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

### Backend (Planned)
- **API Framework** (to be determined)
- **Database** for log storage and indexing
- **AI/ML Integration** for intelligent log analysis
- **Real-time Processing** for live log streaming

## Getting Started

### Frontend Development

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

### Backend Development

The backend is currently under development by another team member. Once available, it will provide:

- RESTful API for log data access
- AI integration for chat responses
- Real-time log streaming
- Advanced search and filtering capabilities

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
- Export filtered results for further analysis

## Development Roadmap

### Phase 1: Frontend Foundation ✅
- [x] React application setup with TypeScript
- [x] Material-UI component library integration
- [x] Log table component with search and filtering
- [x] AI chat interface with mock responses
- [x] Dark theme and responsive design

### Phase 2: Backend Integration (In Progress)
- [ ] API development for log data access
- [ ] Real-time log streaming
- [ ] AI integration for chat responses
- [ ] Advanced search and filtering

### Phase 3: Advanced Features (Planned)
- [ ] Real-time log monitoring
- [ ] Alert system for critical issues
- [ ] Dashboard with analytics
- [ ] User authentication and permissions
- [ ] Log retention and archival

## Contributing

1. **Frontend Development**: Work in the `frontend/` directory
2. **Backend Development**: Coordinate with the backend team
3. **Documentation**: Keep README files updated
4. **Code Quality**: Follow TypeScript best practices
5. **Testing**: Ensure all features are thoroughly tested

## License

This project is part of the TraceAgent log analysis platform.

## Support

For questions or issues:
- Frontend issues: Check the `frontend/README.md`
- Backend integration: Coordinate with the backend development team
- General questions: Review this README and project documentation