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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
} from '@mui/material';
import { Send, Bot, User } from 'lucide-react';
import apiService, { Client } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isLoading?: boolean;
}

const ChatInterface: React.FC = () => {
  const { user } = useAuth();
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
  const [selectedClient, setSelectedClient] = useState<string>('maze_bank');
  const [clients, setClients] = useState<Client[]>([]);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch available clients on component mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const clientsData = await apiService.getClients();
        setClients(clientsData);
        
        // Set default client based on user's client_id
        if (user?.client_id) {
          setSelectedClient(user.client_id);
        } else if (clientsData.length > 0) {
          setSelectedClient(clientsData[0].id);
        }
      } catch (error) {
        setError('Failed to fetch clients');
        console.error('Error fetching clients:', error);
      }
    };

    fetchClients();
  }, [user]);

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
    setError(null);

    try {
      // Include authentication token in the request
      const token = user?.session_token;
      const response = await apiService.sendChatMessage(inputValue, selectedClient, token);
      
      if (response) {
        const botResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: response.response,
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botResponse]);
      } else {
        // Fallback response if API fails
        const fallbackResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: 'I apologize, but I\'m having trouble connecting to the backend. Please check if the backend server is running and try again.',
          sender: 'bot',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, fallbackResponse]);
        setError('Failed to get response from AI backend');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I\'m experiencing technical difficulties. Please check your connection and try again.',
        sender: 'bot',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
      setError('Failed to send message to backend');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleClientChange = (event: any) => {
    setSelectedClient(event.target.value);
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
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

        <FormControl size="small" fullWidth>
          <InputLabel>Client Context</InputLabel>
          <Select
            value={selectedClient}
            label="Client Context"
            onChange={handleClientChange}
          >
            {clients.map((client) => (
              <MenuItem key={client.id} value={client.id}>
                {client.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
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