import React, { useEffect, useState } from 'react';
import { 
  Close as CloseIcon 
} from '@mui/icons-material';
import webSocketService, { WebSocketMessage } from '../services/WebSocketService';
import { useAuth } from '../hooks/useAuth';

interface Notification {
  id: string;
  type: string;
  message: string;
  timestamp: number;
}

const NotificationDisplay: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Check connection status
    setIsConnected(webSocketService.isConnected());

    // Subscribe to all notifications
    const handleNotification = (wsMessage: WebSocketMessage) => {
      if (wsMessage.type === 'CONNECTION_ESTABLISHED') {
        setIsConnected(true);
        return;
      }

      // Handle FOLLOWER_COUNT_UPDATE separately (no popup, just update UI)
      if (wsMessage.type === 'FOLLOWER_COUNT_UPDATE') {
        // This could trigger a UI update event for profile pages
        // For now, we'll log it and potentially dispatch an event
        console.log('Follower count update received:', wsMessage.data);
        
        // Dispatch custom event for components to listen to
        window.dispatchEvent(new CustomEvent('followerCountUpdate', { 
          detail: wsMessage.data 
        }));
        return;
      }

      // Create popup notifications for all notification types except system ones
      if (wsMessage.type && wsMessage.type !== 'CONNECTION_ESTABLISHED') {
        const notification: Notification = {
          id: `${Date.now()}-${Math.random()}`,
          type: wsMessage.type,
          message: typeof wsMessage.data === 'string' ? wsMessage.data : JSON.stringify(wsMessage.data),
          timestamp: wsMessage.timestamp || Date.now()
        };

        setNotifications(prev => [notification, ...prev].slice(0, 5)); // Keep only last 5 notifications

        // Auto-remove notification after 6 seconds
        setTimeout(() => {
          removeNotification(notification.id);
        }, 6000);
      }
    };

    // Subscribe to all message types
    webSocketService.subscribe('*', handleNotification);

    // Cleanup
    return () => {
      webSocketService.unsubscribe('*', handleNotification);
    };
  }, []);

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'NEW_FOLLOWER':
        return '👤';
      case 'UNFOLLOWED':
        return '👥';
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
      case 'UNFOLLOWED':
        return '#FF9800';
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
    <div style={{
      position: 'fixed',
      top: '80px',
      right: '20px',
      zIndex: 1000,
      maxWidth: '350px'
    }}>
      {/* Connection Status - Only show for logged-in users */}
      {isLoggedIn && (
        <div style={{
          padding: '8px 12px',
          marginBottom: '10px',
          backgroundColor: isConnected ? '#4CAF50' : '#F44336',
          color: 'white',
          borderRadius: '6px',
          fontSize: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <div style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: 'white',
            animation: isConnected ? 'pulse 2s infinite' : 'none'
          }} />
          {isConnected ? 'Connected to live notifications' : 'Disconnected'}
        </div>
      )}

      {/* Notifications */}
      {notifications.map((notification) => (
        <div
          key={notification.id}
          style={{
            backgroundColor: 'white',
            border: `2px solid ${getNotificationColor(notification.type)}`,
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            position: 'relative',
            animation: 'slideIn 0.3s ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ fontSize: '18px' }}>
              {getNotificationIcon(notification.type)}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 500,
                marginBottom: '4px',
                color: '#333'
              }}>
                {notification.message}
              </div>
              <div style={{
                fontSize: '11px',
                color: '#666'
              }}>
                {new Date(notification.timestamp).toLocaleTimeString()}
              </div>
            </div>
            <button
              onClick={() => removeNotification(notification.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#999',
                padding: '2px'
              }}
            >
              <CloseIcon style={{ fontSize: '16px' }} />
            </button>
          </div>
        </div>
      ))}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
};

export default NotificationDisplay;