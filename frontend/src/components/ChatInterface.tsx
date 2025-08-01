import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItem,
  Divider,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isLoading?: boolean;
}

const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m TraceAgent, your AI log analysis assistant. I can help you analyze application logs, network logs, and syslog data. What would you like to know about your logs?',
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    
    if (input.includes('error') || input.includes('failed')) {
      return 'I found several error logs in your data. The most critical ones include:\n\n• Application errors: Database connection failures, authentication errors, and session issues\n• Network errors: Multiple DROP and REJECT actions on suspicious IP addresses\n• System errors: Disk space warnings and failed login attempts\n\nWould you like me to show you the specific error patterns or help you investigate the root cause?';
    }
    
    if (input.includes('security') || input.includes('auth') || input.includes('login')) {
      return 'Security analysis shows multiple concerning patterns:\n\n• Failed login attempts from various IP addresses\n• SQL injection attempts detected in application logs\n• Suspicious network connections being dropped/rejected\n• Multiple authentication failures across different hosts\n\nI\'ve identified several suspicious IP addresses and unusual access patterns. Would you like me to create a security report or investigate specific incidents?';
    }
    
    if (input.includes('network') || input.includes('connection') || input.includes('drop') || input.includes('reject')) {
      return 'Network logs show significant security activity:\n\n• Multiple DROP actions on suspicious connections\n• REJECT actions on ICMP and TCP traffic\n• Various protocols affected: TCP, UDP, ICMP\n• Source IPs from diverse geographic locations\n\nI can see connection timeouts and packet loss in certain time windows. Should I help you analyze the network security trends or identify potential threats?';
    }
    
    if (input.includes('application') || input.includes('api') || input.includes('endpoint')) {
      return 'Application logs reveal several patterns:\n\n• Multiple API endpoints being accessed: /api/login, /api/delete, /api/update, /api/export\n• User authentication attempts with various success rates\n• Data export activities and session management\n• Some suspicious activities like SQL injection attempts\n\nWould you like me to analyze specific endpoints or user activities?';
    }
    
    if (input.includes('syslog') || input.includes('system') || input.includes('disk')) {
      return 'System logs show several issues:\n\n• Multiple disk space warnings across different hosts\n• Failed login attempts on various systems\n• System reboots and process executions\n• SSH and nginx service activities\n\nI can help you investigate system health, disk space issues, or security events. What would you like to focus on?';
    }
    
    if (input.includes('performance') || input.includes('slow') || input.includes('latency')) {
      return 'Performance analysis across your logs shows:\n\n• Network performance: Various bytes sent/received patterns\n• Application response times from different endpoints\n• System resource usage and disk space issues\n• Connection handling across different protocols\n\nShould I help you identify performance bottlenecks or analyze specific metrics?';
    }
    
    return 'I can help you analyze your logs across three main categories:\n\n• **Application Logs**: API endpoints, user activities, authentication\n• **Network Logs**: Connection attempts, security actions, traffic analysis\n• **System Logs**: Host activities, process monitoring, system health\n\nWhat specific aspect would you like to investigate? Try asking about errors, security events, performance issues, or specific log sources.';
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box
      sx={{
        width: '40%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
            <Bot size={20} />
          </Avatar>
          <Typography variant="h6">TraceAgent AI</Typography>
          <Chip
            label="Online"
            size="small"
            color="success"
            sx={{ ml: 'auto' }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <List sx={{ p: 0 }}>
          {messages.map((message) => (
            <ListItem
              key={message.id}
              sx={{
                flexDirection: 'column',
                alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                p: 0,
                mb: 2,
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1,
                  maxWidth: '85%',
                }}
              >
                {message.sender === 'bot' && (
                  <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                    <Bot size={20} />
                  </Avatar>
                )}
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: message.sender === 'user' ? 'primary.main' : 'background.default',
                    color: message.sender === 'user' ? 'white' : 'text.primary',
                    borderRadius: 2,
                    maxWidth: '100%',
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.text}
                  </Typography>
                  {message.isLoading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <CircularProgress size={16} />
                      <Typography variant="caption">AI is thinking...</Typography>
                    </Box>
                  )}
                </Paper>
                {message.sender === 'user' && (
                  <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
                    <User size={20} />
                  </Avatar>
                )}
              </Box>
            </ListItem>
          ))}
        </List>
        <div ref={messagesEndRef} />
      </Box>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Ask me about your logs..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
              },
            }}
          />
          <IconButton
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': {
                bgcolor: 'primary.dark',
              },
              '&:disabled': {
                bgcolor: 'action.disabledBackground',
                color: 'action.disabled',
              },
            }}
          >
            <Send size={20} />
          </IconButton>
        </Box>
        
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Try asking: "Show me all errors", "Analyze performance issues", or "Check for security events"
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatInterface; 