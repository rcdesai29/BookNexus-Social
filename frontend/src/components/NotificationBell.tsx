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
import { useAuth } from '../hooks/useAuth';
import { profileService } from '../services/profileService';
import { notificationService, NotificationResponse } from '../services/notificationService';

interface Notification {
  id: string;
  type: string;
  message: string;
  timestamp: number;
  read: boolean;
  persistent?: boolean; // Flag to differentiate persistent vs real-time notifications
  persistentId?: number; // ID in the database
}

const NotificationBell: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUserDisplayName, setCurrentUserDisplayName] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch current user's display name
  useEffect(() => {
    const fetchCurrentUserDisplayName = async () => {
      if (user?.id) {
        try {
          const profile = await profileService.getCurrentUserProfile();
          setCurrentUserDisplayName(profile.displayName);
        } catch (error) {
          console.error('Failed to fetch user display name:', error);
          // Fallback to email prefix or full name
          setCurrentUserDisplayName(user?.email?.split('@')[0] || user?.name || '');
        }
      }
    };

    fetchCurrentUserDisplayName();
  }, [user]);

  // Load persistent notifications on component mount and when user changes
  useEffect(() => {
    const loadPersistentNotifications = async () => {
      if (user?.id) {
        try {
          const [notificationsData, countsData] = await Promise.all([
            notificationService.getNotifications(0, 20, false),
            notificationService.getNotificationCounts()
          ]);

          // Convert persistent notifications to component format
          const persistentNotifications: Notification[] = notificationsData.content.map(noti => ({
            id: `persistent-${noti.id}`,
            type: noti.type,
            message: noti.message,
            timestamp: new Date(noti.createdDate).getTime(),
            read: noti.isRead,
            persistent: true,
            persistentId: noti.id
          }));

          setNotifications(persistentNotifications);
          setUnreadCount(countsData.unreadCount);
        } catch (error) {
          console.error('Failed to load persistent notifications:', error);
        }
      }
    };

    loadPersistentNotifications();
  }, [user]);

  useEffect(() => {
    // Subscribe to all notifications
    const handleNotification = (wsMessage: WebSocketMessage) => {
      if (wsMessage.type === 'CONNECTION_ESTABLISHED') {
        // Identify user when connection is established
        if (user?.id) {
          webSocketService.identifyUser(user.id.toString());
        }
        return;
      }

      // Ignore user identification confirmation messages
      if (wsMessage.type === 'USER_IDENTIFIED') {
        return;
      }

      // Handle FOLLOWER_COUNT_UPDATE separately (no notification, just update UI)
      if (wsMessage.type === 'FOLLOWER_COUNT_UPDATE') {
        // Dispatch custom event for components to listen to
        window.dispatchEvent(new CustomEvent('followerCountUpdate', { 
          detail: wsMessage.data 
        }));
        return;
      }

      // Create notification from WebSocket message
      if (wsMessage.type && wsMessage.type !== 'CONNECTION_ESTABLISHED') {
        const messageText = typeof wsMessage.data === 'string' ? wsMessage.data : JSON.stringify(wsMessage.data);
        
        // Extract user name from notification message and filter out self-notifications
        const extractUserFromMessage = (message: string): string => {
          // Try multiple patterns to extract the user name
          // Pattern 1: "Name action verb" (e.g., "Rahil Desai finished reading")
          let match = message.match(/^(.+?)\s+(added to|is currently|finished|started|wrote|removed from)/);
          if (match) return match[1].trim();
          
          // Pattern 2: "Name verb" (e.g., "Rahil Desai added", "rahildesai83 reviewed")
          match = message.match(/^(.+?)\s+(added|finished|started|wrote|removed|reviewed)/);
          if (match) return match[1].trim();
          
          // Pattern 3: Follow patterns (e.g., "John Doe started following", "Jane Smith unfollowed")
          match = message.match(/^(.+?)\s+(started following|unfollowed|liked your|replied to)/);
          if (match) return match[1].trim();
          
          // Pattern 4: Just get everything before common action phrases
          match = message.match(/^(.+?)\s+(to TBR|reading|to Read)/);
          if (match) return match[1].trim();
          
          // Fallback: first two words (assuming "First Last")
          match = message.match(/^(\w+\s+\w+)/);
          return match ? match[1].trim() : 'Unknown User';
        };
        
        const activityUserDisplayName = extractUserFromMessage(messageText);
        const currentUserFullName = user?.name || '';
        const currentUserEmail = user?.email?.split('@')[0] || '';
        
        console.log('NotificationBell check:', {
          messageText,
          activityUserDisplayName,
          currentUserFullName,
          currentUserEmail,
          currentUserDisplayName,
          userObject: user,
          userKeys: user ? Object.keys(user) : [],
          isMatchFullName: activityUserDisplayName === currentUserFullName,
          isMatchEmail: activityUserDisplayName === currentUserEmail,
          isMatchDisplayName: activityUserDisplayName === currentUserDisplayName
        });
        
        // Skip notifications from yourself - check full name, email prefix, and display name
        if (activityUserDisplayName === currentUserFullName || 
            activityUserDisplayName === currentUserEmail ||
            activityUserDisplayName === currentUserDisplayName) {
          console.log('Ignoring self-notification in bell from:', activityUserDisplayName);
          return;
        }

        const notification: Notification = {
          id: `realtime-${Date.now()}-${Math.random()}`,
          type: wsMessage.type,
          message: messageText,
          timestamp: wsMessage.timestamp || Date.now(),
          read: false,
          persistent: false
        };

        // Add to the top of the list, but don't exceed 50 total notifications
        setNotifications(prev => [notification, ...prev].slice(0, 50));
        setUnreadCount(prev => prev + 1);
      }
    };

    // Subscribe to all message types
    webSocketService.subscribe('*', handleNotification);

    // Cleanup
    return () => {
      webSocketService.unsubscribe('*', handleNotification);
    };
  }, [user, currentUserDisplayName]);

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

  const handleBellClick = async () => {
    setDropdownOpen(!dropdownOpen);
    if (!dropdownOpen && unreadCount > 0) {
      try {
        // Mark all persistent notifications as read in backend
        await notificationService.markAllNotificationsAsRead();
        
        // Update local state
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      } catch (error) {
        console.error('Failed to mark notifications as read:', error);
        // Still update local state for better UX
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    }
  };

  const removeNotification = async (id: string) => {
    const notification = notifications.find(n => n.id === id);
    
    if (notification?.persistent && notification.persistentId) {
      try {
        // Delete persistent notification from backend
        await notificationService.deleteNotification(notification.persistentId);
      } catch (error) {
        console.error('Failed to delete notification:', error);
        return; // Don't remove from UI if backend deletion failed
      }
    }
    
    // Remove from local state
    setNotifications(prev => prev.filter(n => n.id !== id));
    
    // Update unread count if the notification was unread
    if (!notification?.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const clearAllNotifications = async () => {
    try {
      // Delete all persistent notifications from backend
      const persistentNotifications = notifications.filter(n => n.persistent && n.persistentId);
      await Promise.all(
        persistentNotifications.map(n => 
          n.persistentId ? notificationService.deleteNotification(n.persistentId) : Promise.resolve()
        )
      );
    } catch (error) {
      console.error('Failed to clear some notifications:', error);
    }
    
    // Clear all from local state (including real-time ones)
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