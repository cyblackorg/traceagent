# TraceAgent Frontend

A modern React-based frontend for TraceAgent, an AI-powered log analysis assistant. The application provides an intuitive interface for analyzing application logs, network logs, and syslog data through an AI chat interface.

## Features

### 🎯 Core Functionality
- **Dual Interface Layout**: Log table on the left, AI chat interface on the right
- **Real-time Log Analysis**: View and search through application, network, and syslog data
- **AI-Powered Chat**: Interactive chat interface for log analysis queries
- **Smart Filtering**: Search and filter logs by message, level, source, and details
- **Responsive Design**: Modern, dark-themed UI optimized for log analysis workflows

### 📊 Log Table Features
- **Multi-source Log Display**: Application logs, network logs, and syslog
- **Color-coded Log Levels**: ERROR (red), WARNING (orange), INFO (blue), DEBUG (gray)
- **Source Identification**: Visual chips for different log sources
- **Search Functionality**: Real-time search across all log fields
- **Export Capability**: Download filtered log data
- **Hover Effects**: Interactive table rows with hover states

### 🤖 AI Chat Interface
- **Contextual Responses**: AI understands log analysis queries
- **Smart Suggestions**: Helpful prompts for common log analysis tasks
- **Real-time Interaction**: Instant responses with loading indicators
- **Message History**: Persistent chat conversation
- **Keyboard Shortcuts**: Enter to send, Shift+Enter for new lines

## Technology Stack

- **React 18** with TypeScript
- **Material-UI (MUI)** for component library
- **Lucide React** for modern icons
- **Emotion** for styled components
- **Dark Theme** optimized for log analysis

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

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

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── LogTable.tsx   # Log display table
│   │   └── ChatInterface.tsx # AI chat interface
│   ├── App.tsx            # Main application component
│   ├── App.css            # Global styles
│   └── index.tsx          # Application entry point
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## Component Architecture

### LogTable Component
- Displays logs in a sortable, searchable table
- Handles filtering and search functionality
- Color-coded log levels and sources
- Export and filter actions

### ChatInterface Component
- Manages AI chat conversation
- Handles message input and responses
- Provides contextual AI responses
- Auto-scrolls to latest messages

## Usage Examples

### Log Analysis Queries
- "Show me all errors from the last hour"
- "Analyze performance issues in the application logs"
- "Check for security events in the network logs"
- "Find database connection failures"

### Log Table Features
- Search for specific error messages
- Filter by log level (ERROR, WARNING, INFO, DEBUG)
- Filter by source (application, network, syslog)
- Export filtered results

## Development

### Adding New Features
1. Create new components in `src/components/`
2. Update TypeScript interfaces as needed
3. Follow the existing code style and patterns
4. Test thoroughly before committing

### Styling Guidelines
- Use Material-UI's `sx` prop for component styling
- Follow the dark theme color palette
- Ensure accessibility with proper contrast ratios
- Use consistent spacing and typography

## Backend Integration

The frontend is designed to integrate with a backend API. Key integration points:

- **Log Data API**: Fetch real log data from backend
- **AI Chat API**: Connect to AI backend for responses
- **Search API**: Backend-powered log search and filtering
- **Export API**: Backend log export functionality

## Contributing

1. Follow the existing code style
2. Write clean, maintainable code
3. Add TypeScript types for all new features
4. Test your changes thoroughly
5. Update documentation as needed

## License

This project is part of the TraceAgent log analysis platform.
