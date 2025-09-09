import React, { useState, useEffect } from 'react';
import {
  CircularProgress,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Group,
  MenuBook,
  StarBorder,
  Comment,
  FavoriteSharp,
  PersonAdd,
  PersonRemove,
  RateReview
} from '@mui/icons-material';
import { webSocketService } from '../services/WebSocketService';

interface ActivityFeedItem {
  id: string;
  type: 'NEW_FOLLOWER' | 'UNFOLLOWED' | 'REVIEW_LIKE' | 'REVIEW_REPLY' | 'NEW_REVIEW' | 'BOOK_RECOMMENDATION' | 'ACTIVITY_UPDATE';
  message: string;
  timestamp: Date;
  user?: {
    displayName: string;
    avatarUrl?: string;
  };
  data?: any;
}

const FriendsFeed: React.FC = () => {
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Subscribe to WebSocket activity updates
    const handleActivityUpdate = (message: any) => {
      console.log('Friends Feed received WebSocket message:', message);
      
      if (message.type === 'ACTIVITY_UPDATE' || 
          message.type === 'NEW_FOLLOWER' || 
          message.type === 'UNFOLLOWED' ||
          message.type === 'REVIEW_LIKE' ||
          message.type === 'REVIEW_REPLY' ||
          message.type === 'NEW_REVIEW' ||
          message.type === 'BOOK_RECOMMENDATION') {
        
        const newActivity: ActivityFeedItem = {
          id: Date.now().toString(),
          type: message.type,
          message: message.data?.message || message.data || message.message || 'New activity',
          timestamp: new Date(),
          user: {
            displayName: extractUserFromMessage(message.data?.message || message.data || message.message || ''),
            avatarUrl: undefined // Could be enhanced to include avatar URLs
          },
          data: message.data
        };

        setActivities(prev => [newActivity, ...prev.slice(0, 9)]); // Keep last 10 activities
      }
    };

    // Subscribe to WebSocket activity messages
    const messageTypes = ['ACTIVITY_UPDATE', 'NEW_FOLLOWER', 'UNFOLLOWED', 'REVIEW_LIKE', 'REVIEW_REPLY', 'NEW_REVIEW', 'BOOK_RECOMMENDATION'];
    
    messageTypes.forEach(type => {
      webSocketService.subscribe(type, handleActivityUpdate);
    });

    // Load some initial mock activities
    setActivities([
      {
        id: '1',
        type: 'NEW_FOLLOWER',
        message: 'rahildesai83 started following appleplayhouse',
        timestamp: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
        user: { displayName: 'rahildesai83' }
      },
      {
        id: '2', 
        type: 'REVIEW_LIKE',
        message: 'Someone liked your review of "The Four Winds"',
        timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
        user: { displayName: 'bookworm42' }
      },
      {
        id: '3',
        type: 'NEW_REVIEW',
        message: 'appleplayhouse reviewed "Fear the Flames"',
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        user: { displayName: 'appleplayhouse' }
      }
    ]);

    return () => {
      // Cleanup subscriptions
      messageTypes.forEach(type => {
        webSocketService.unsubscribe(type, handleActivityUpdate);
      });
    };
  }, []);

  const extractUserFromMessage = (message: string): string => {
    // Extract display name from messages like "rahildesai83 started following..."
    const match = message.match(/^(\w+)/);
    return match ? match[1] : 'Unknown User';
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'NEW_FOLLOWER':
        return <PersonAdd style={{ fontSize: '16px', color: '#2E7D32' }} />;
      case 'UNFOLLOWED':
        return <PersonRemove style={{ fontSize: '16px', color: '#D32F2F' }} />;
      case 'REVIEW_LIKE':
        return <FavoriteSharp style={{ fontSize: '16px', color: '#E91E63' }} />;
      case 'REVIEW_REPLY':
        return <Comment style={{ fontSize: '16px', color: '#1976D2' }} />;
      case 'NEW_REVIEW':
        return <RateReview style={{ fontSize: '16px', color: '#7B1FA2' }} />;
      case 'BOOK_RECOMMENDATION':
        return <StarBorder style={{ fontSize: '16px', color: '#F57C00' }} />;
      case 'ACTIVITY_UPDATE':
      default:
        return <MenuBook style={{ fontSize: '16px', color: '#5D4037' }} />;
    }
  };

  const getActivityColor = (type: string): string => {
    switch (type) {
      case 'NEW_FOLLOWER': return '#E8F5E8';
      case 'UNFOLLOWED': return '#FFEBEE';
      case 'REVIEW_LIKE': return '#FCE4EC';
      case 'REVIEW_REPLY': return '#E3F2FD';
      case 'NEW_REVIEW': return '#F3E5F5';
      case 'BOOK_RECOMMENDATION': return '#FFF3E0';
      case 'ACTIVITY_UPDATE':
      default: return '#F4E3C1';
    }
  };

  const formatTimeAgo = (timestamp: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #E6D7C3',
    boxShadow: '0 4px 12px rgba(75, 63, 48, 0.1)',
    marginBottom: '24px'
  };

  const headingStyle: React.CSSProperties = {
    fontFamily: 'Playfair Display, serif',
    fontSize: '20px',
    fontWeight: 600,
    color: '#4B3F30',
    marginBottom: '24px'
  };

  return (
    <div style={{ marginBottom: '48px' }}>
      <h2 style={headingStyle}>
        <Group style={{ marginRight: '8px', fontSize: '24px', color: '#D2691E' }} />
        Friends Feed
      </h2>
      
      {loading ? (
        <div style={{ ...cardStyle, display: 'flex', justifyContent: 'center', padding: '32px' }}>
          <CircularProgress sx={{ color: '#D2691E' }} size={24} />
        </div>
      ) : activities.length > 0 ? (
        <div style={cardStyle}>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {activities.map((activity, index) => (
              <div
                key={activity.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  marginBottom: index === activities.length - 1 ? '0' : '8px',
                  backgroundColor: getActivityColor(activity.type),
                  borderRadius: '8px',
                  border: '1px solid rgba(75, 63, 48, 0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateX(4px)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(75, 63, 48, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Activity Icon */}
                <div style={{
                  marginRight: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)'
                }}>
                  {getActivityIcon(activity.type)}
                </div>

                {/* User Avatar */}
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    marginRight: '12px',
                    fontSize: '14px',
                    backgroundColor: '#D2691E',
                    color: 'white'
                  }}
                  src={activity.user?.avatarUrl}
                >
                  {activity.user?.displayName?.charAt(0).toUpperCase()}
                </Avatar>

                {/* Activity Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 500,
                    color: '#4B3F30',
                    lineHeight: 1.4,
                    marginBottom: '4px',
                    wordBreak: 'break-word'
                  }}>
                    {activity.message}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: '#8B7355',
                    fontWeight: 400
                  }}>
                    {formatTimeAgo(activity.timestamp)}
                  </div>
                </div>

                {/* Action Button (optional) */}
                <Tooltip title="View details">
                  <IconButton
                    size="small"
                    sx={{
                      marginLeft: '8px',
                      color: '#D2691E',
                      '&:hover': {
                        backgroundColor: 'rgba(210, 105, 30, 0.1)'
                      }
                    }}
                  >
                    {getActivityIcon(activity.type)}
                  </IconButton>
                </Tooltip>
              </div>
            ))}
          </div>
          
          {/* View More Button */}
          <div style={{ textAlign: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E6D7C3' }}>
            <button
              style={{
                backgroundColor: 'transparent',
                color: '#D2691E',
                border: '1px solid #D2691E',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#D2691E';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#D2691E';
              }}
            >
              View All Activity
            </button>
          </div>
        </div>
      ) : (
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <Group style={{ color: '#D2691E', fontSize: '48px', marginBottom: '12px' }} />
          <p style={{ color: '#6A5E4D', marginBottom: '8px' }}>No recent activity</p>
          <p style={{ color: '#8B7355', fontSize: '14px' }}>
            Follow friends to see their reading activity here!
          </p>
        </div>
      )}
    </div>
  );
};

export default FriendsFeed;