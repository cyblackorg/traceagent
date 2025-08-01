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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import { Send, Bot, User, Shield, AlertTriangle, Users, Globe, Activity } from 'lucide-react';
import apiService, { Client, SecurityInsights } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isLoading?: boolean;
  securityInsights?: SecurityInsights | null;
}

interface ChatInterfaceProps {
  onLogsReceived?: (logs: any) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onLogsReceived }) => {
  const { user, canSwitchClient } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m TraceAgent, your AI log analysis assistant. I can help you analyze application logs, network logs, and syslog data. What would you like to know about your logs?\n\n💡 Try these security-focused queries:\n• "Show me any suspicious login activity"\n• "Are there any SQL injection attacks?"\n• "What network connections were blocked?"\n• "Find suspicious activity from external IPs"',
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

    // Add a loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: 'Analyzing logs and generating response...',
      sender: 'bot',
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      // Include authentication token in the request
      const token = user?.session_token;
      const response = await apiService.sendChatMessage(inputValue, selectedClient, token);
      
            if (response) {
        console.log('Chat response:', response); // Debug log
        
        // Handle the new structured response format
        let messageText = '';
        let isError = false;
        let securityInsights: SecurityInsights | null = null;
        
        // Check for error responses
        if (response.error) {
          isError = true;
          const provider = response.provider || 'unknown';
          const details = response.details ? ` (${response.details})` : '';
          messageText = `[${provider.toUpperCase()}] Error: ${response.error}${details}`;
        }
        // Check for new structured response format
        else if (response.response) {
          messageText = response.response;
          
          // Handle logs data if present
          if (response.logs) {
            console.log('Logs data received:', response.logs);
            // Pass logs data to parent component
            if (onLogsReceived) {
              onLogsReceived(response.logs);
            }
          }
          
          // Handle security insights if present
          if (response.insights) {
            console.log('Security insights received:', response.insights);
            securityInsights = response.insights;
          }
          
          // Handle security alerts if present
          if (response.security_alert) {
            messageText += `\n\n🚨 ${response.security_alert}`;
          }
          
          if (response.suspicious_activity) {
            messageText += `\n\n⚠️ ${response.suspicious_activity}`;
          }
          
          // Handle SQL query info if present
          if (response.sql_query) {
            console.log('SQL query executed:', response.sql_query);
            messageText += `\n\nSQL Query: ${response.sql_query}`;
          }
        }
        // Check for legacy response format
        else if (response.response) {
          // Handle case where response.response might be an object
          if (typeof response.response === 'string') {
            messageText = response.response;
          } else if (typeof response.response === 'object') {
            // If response.response is an object, try to extract meaningful content
            const responseObj = response.response as any;
            if (responseObj.error) {
              isError = true;
              messageText = `Error: ${responseObj.error}`;
            } else if (responseObj.content) {
              messageText = responseObj.content;
            } else {
              messageText = JSON.stringify(responseObj, null, 2);
            }
          } else {
            messageText = String(response.response);
          }
        }
        // Handle other response formats
        else {
          messageText = typeof response === 'string' ? response : JSON.stringify(response, null, 2);
        }
        
        // Ensure messageText is a string and not too long
        if (typeof messageText !== 'string') {
          messageText = String(messageText);
        }
        
        // Truncate very long messages
        if (messageText.length > 5000) {
          messageText = messageText.substring(0, 5000) + '\n\n[Message truncated...]';
        }
        
        console.log('Final message text:', messageText); // Debug log
        
        // Replace the loading message with the actual response
        setMessages(prev => prev.map(msg => 
          msg.isLoading ? {
            ...msg,
            text: messageText,
            isLoading: false,
            securityInsights: securityInsights
          } : msg
        ));
        
        if (isError) {
          setError(`AI Error: ${response.error}`);
        }
      } else {
        // Replace loading message with error
        setMessages(prev => prev.map(msg => 
          msg.isLoading ? {
            ...msg,
            text: 'I apologize, but I\'m having trouble connecting to the backend. Please check if the backend server is running and try again.',
            isLoading: false
          } : msg
        ));
        setError('Failed to get response from AI backend');
      }
    } catch (error) {
      console.error('Chat error:', error);
      // Replace loading message with error
      setMessages(prev => prev.map(msg => 
        msg.isLoading ? {
          ...msg,
          text: 'I\'m experiencing technical difficulties. Please check your connection and try again.',
          isLoading: false
        } : msg
      ));
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

  // Component to render security insights
  const SecurityInsightsCard = ({ insights }: { insights: SecurityInsights }) => (
    <Card sx={{ mt: 2, mb: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Shield size={20} />
          Security Analysis
        </Typography>
        
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box sx={{ flex: '1 1 120px', textAlign: 'center' }}>
            <Typography variant="h4" color="error.main">
              {insights.security_events}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Security Events
            </Typography>
          </Box>
          
          <Box sx={{ flex: '1 1 120px', textAlign: 'center' }}>
            <Typography variant="h4" color="warning.main">
              {insights.failed_logins}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Failed Logins
            </Typography>
          </Box>
          
          <Box sx={{ flex: '1 1 120px', textAlign: 'center' }}>
            <Typography variant="h4" color="error.main">
              {insights.sql_injections}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              SQL Injections
            </Typography>
          </Box>
          
          <Box sx={{ flex: '1 1 120px', textAlign: 'center' }}>
            <Typography variant="h4" color="info.main">
              {insights.blocked_connections}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Blocked Connections
            </Typography>
          </Box>
        </Box>
        
        {(insights.suspicious_ips.length > 0 || insights.affected_users.length > 0) && (
          <Box sx={{ mt: 2 }}>
            {insights.suspicious_ips.length > 0 && (
              <Box sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Globe size={16} />
                  Suspicious IPs ({insights.suspicious_ips.length})
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {insights.suspicious_ips.slice(0, 5).map((ip, index) => (
                    <Chip key={index} label={ip} size="small" variant="outlined" />
                  ))}
                  {insights.suspicious_ips.length > 5 && (
                    <Chip label={`+${insights.suspicious_ips.length - 5} more`} size="small" />
                  )}
                </Box>
              </Box>
            )}
            
            {insights.affected_users.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Users size={16} />
                  Affected Users ({insights.affected_users.length})
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {insights.affected_users.slice(0, 5).map((user, index) => (
                    <Chip key={index} label={user} size="small" variant="outlined" />
                  ))}
                  {insights.affected_users.length > 5 && (
                    <Chip label={`+${insights.affected_users.length - 5} more`} size="small" />
                  )}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Box
      sx={{
        width: '40%',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
        overflow: 'hidden', // Prevent container overflow
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          flexShrink: 0, // Prevent header from shrinking
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

        {canSwitchClient() && (
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
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>

      <Box
        sx={{
          flexGrow: 1,
          overflow: 'hidden', // Prevent double scrollbars
          display: 'flex',
          flexDirection: 'column',
        }}
      >
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
                    {typeof message.text === 'string' ? message.text : String(message.text)}
                  </Typography>
                  
                  {/* Display security insights if available */}
                  {message.securityInsights && (
                    <SecurityInsightsCard insights={message.securityInsights} />
                  )}
                  {message.isLoading && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            animation: 'typing 1.4s infinite ease-in-out',
                            '&:nth-of-type(1)': { animationDelay: '0s' },
                            '&:nth-of-type(2)': { animationDelay: '0.2s' },
                            '&:nth-of-type(3)': { animationDelay: '0.4s' },
                          }}
                        />
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            animation: 'typing 1.4s infinite ease-in-out',
                            '&:nth-of-type(1)': { animationDelay: '0s' },
                            '&:nth-of-type(2)': { animationDelay: '0.2s' },
                            '&:nth-of-type(3)': { animationDelay: '0.4s' },
                          }}
                        />
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: 'primary.main',
                            animation: 'typing 1.4s infinite ease-in-out',
                            '&:nth-of-type(1)': { animationDelay: '0s' },
                            '&:nth-of-type(2)': { animationDelay: '0.2s' },
                            '&:nth-of-type(3)': { animationDelay: '0.4s' },
                          }}
                        />
                      </Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        AI is typing...
                      </Typography>
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
      </Box>

      <Divider />

      <Box sx={{ p: 2, flexShrink: 0 }}>
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