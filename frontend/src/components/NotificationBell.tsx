import React, { useState, useEffect, useRef } from 'react';
import {
  IconButton,
  Badge,
  Paper,
  List,
  ListItem,
  ListItemText,
  Typography,
  Box,
  Divider,
  Button
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import webSocketService, { WebSocketMessage } from '../services/WebSocketService';

interface Notification {
  id: string;
  type: string;
  message: string;
  timestamp: number;
  read: boolean;
}

const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Subscribe to all notifications
    const handleNotification = (wsMessage: WebSocketMessage) => {
      if (wsMessage.type === 'CONNECTION_ESTABLISHED') {
        return;
      }

      // Create notification from WebSocket message
      const notification: Notification = {
        id: `${Date.now()}-${Math.random()}`,
        type: wsMessage.type,
        message: typeof wsMessage.data === 'string' ? wsMessage.data : JSON.stringify(wsMessage.data),
        timestamp: wsMessage.timestamp || Date.now(),
        read: false
      };

      setNotifications(prev => [notification, ...prev].slice(0, 50)); // Keep last 50 notifications
      setUnreadCount(prev => prev + 1);
    };

    // Subscribe to all message types
    webSocketService.subscribe('*', handleNotification);

    // Cleanup
    return () => {
      webSocketService.unsubscribe('*', handleNotification);
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  const handleBellClick = () => {
    setDropdownOpen(!dropdownOpen);
    if (!dropdownOpen && unreadCount > 0) {
      // Mark all as read when opening
      setTimeout(() => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }, 100);
    }
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NEW_FOLLOWER':
        return '👤';
      case 'NEW_REVIEW':
        return '⭐';
      case 'REVIEW_REPLY':
        return '💬';
      case 'REVIEW_LIKE':
        return '👍';
      case 'REPLY_LIKE':
        return '👍';
      case 'BOOK_RECOMMENDATION':
        return '📚';
      case 'ACTIVITY_UPDATE':
        return '🔄';
      default:
        return '📢';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'NEW_FOLLOWER':
        return '#4CAF50';
      case 'NEW_REVIEW':
        return '#FF9800';
      case 'REVIEW_REPLY':
        return '#E91E63';
      case 'REVIEW_LIKE':
        return '#FF5722';
      case 'REPLY_LIKE':
        return '#FF5722';
      case 'BOOK_RECOMMENDATION':
        return '#2196F3';
      case 'ACTIVITY_UPDATE':
        return '#9C27B0';
      default:
        return '#757575';
    }
  };

  return (
    <Box sx={{ position: 'relative' }} ref={dropdownRef}>
      <IconButton
        onClick={handleBellClick}
        sx={{
          color: '#3C2A1E',
          '&:hover': {
            backgroundColor: '#F7F1E8'
          }
        }}
      >
        <Badge 
          badgeContent={unreadCount} 
          color="error"
          sx={{
            '& .MuiBadge-badge': {
              backgroundColor: '#FF4444',
              color: 'white'
            }
          }}
        >
          <NotificationsIcon />
        </Badge>
      </IconButton>

      {dropdownOpen && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            right: 0,
            width: '350px',
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 1300,
            mt: 1,
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            border: '1px solid #E6D7C3'
          }}
        >
          <Box sx={{ p: 2, borderBottom: '1px solid #E6D7C3' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="h6" sx={{ fontFamily: 'Inter, sans-serif', fontWeight: 600, color: '#3C2A1E' }}>
                Notifications
              </Typography>
              {notifications.length > 0 && (
                <Button
                  size="small"
                  onClick={clearAllNotifications}
                  sx={{
                    color: '#8B7355',
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#F7F1E8'
                    }
                  }}
                >
                  Clear All
                </Button>
              )}
            </Box>
          </Box>

          {notifications.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontFamily: 'Inter, sans-serif' }}>
                No notifications yet
              </Typography>
            </Box>
          ) : (
            <List sx={{ p: 0 }}>
              {notifications.map((notification, index) => (
                <React.Fragment key={notification.id}>
                  <ListItem
                    sx={{
                      alignItems: 'flex-start',
                      backgroundColor: notification.read ? 'transparent' : 'rgba(33, 150, 243, 0.04)',
                      '&:hover': {
                        backgroundColor: '#F7F1E8'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, width: '100%' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: getNotificationColor(notification.type),
                          color: 'white',
                          fontSize: '14px',
                          flexShrink: 0,
                          mt: 0.5
                        }}
                      >
                        {getNotificationIcon(notification.type)}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <ListItemText
                          primary={notification.message}
                          secondary={new Date(notification.timestamp).toLocaleString()}
                          primaryTypographyProps={{
                            sx: {
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '0.875rem',
                              fontWeight: notification.read ? 400 : 500,
                              color: '#3C2A1E',
                              wordWrap: 'break-word'
                            }
                          }}
                          secondaryTypographyProps={{
                            sx: {
                              fontFamily: 'Inter, sans-serif',
                              fontSize: '0.75rem',
                              color: '#8B7355'
                            }
                          }}
                        />
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => removeNotification(notification.id)}
                        sx={{
                          color: '#999',
                          '&:hover': {
                            color: '#666'
                          }
                        }}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </ListItem>
                  {index < notifications.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      )}
    </Box>
  );
};

export default NotificationBell;