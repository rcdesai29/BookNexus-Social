import React, { useState, useEffect } from 'react';
import {
  CircularProgress,
  Avatar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button
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
import { useAuth } from '../hooks/useAuth';
import { API_CONFIG } from '../config/api';

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

interface BackendActivityFeedItem {
  id: number;
  type: string;
  message: string;
  userDisplayName: string;
  bookTitle?: string;
  googleBookId?: string;
  bookId?: number;
  createdDate: string;
}

const FriendsFeed: React.FC = () => {
  const [activities, setActivities] = useState<ActivityFeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAllActivities, setShowAllActivities] = useState(false);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const { isLoggedIn, user } = useAuth();

  // Load historical activity data from API
  const loadHistoricalActivity = async (loadAll: boolean = false) => {
    if (!isLoggedIn || !user?.id) return;
    
    try {
      setLoading(true);
      const size = loadAll ? 50 : 10; // Load more if showing all activities
      const response = await fetch(`${API_CONFIG.BASE_URL}/activity/friends?page=0&size=${size}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const historicalActivities: ActivityFeedItem[] = data.content.map((item: BackendActivityFeedItem) => ({
          id: item.id.toString(),
          type: 'ACTIVITY_UPDATE',
          message: item.message,
          timestamp: new Date(item.createdDate),
          user: {
            displayName: item.userDisplayName,
            avatarUrl: undefined
          },
          data: {
            bookTitle: item.bookTitle,
            googleBookId: item.googleBookId,
            bookId: item.bookId
          }
        }));
        
        setActivities(historicalActivities);
      } else if (response.status === 403 || response.status === 401) {
        console.warn('Authentication required for activity feed');
        // Show authentication-related message
        setActivities([
          {
            id: '1',
            type: 'NEW_REVIEW',
            message: 'Please log in to see your friends\' activity',
            timestamp: new Date(),
            user: { displayName: 'System' }
          }
        ]);
      } else {
        console.warn('Failed to load historical activity:', response.status);
        // Fall back to mock data if API fails
        setActivities([
          {
            id: '1',
            type: 'NEW_REVIEW',
            message: 'Unable to load activity feed at this time',
            timestamp: new Date(),
            user: { displayName: 'System' }
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading historical activity:', error);
      // Fall back to mock data if API fails
      setActivities([
        {
          id: '1',
          type: 'NEW_REVIEW',
          message: 'Unable to load activity feed',
          timestamp: new Date(),
          user: { displayName: 'System' }
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load historical activity on component mount
    loadHistoricalActivity();

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
        
        const messageText = message.data?.message || message.data || message.message || 'New activity';
        
        // Extract user name from notification message with improved pattern matching
        const extractUserFromMessage = (message: string): string => {
          // Try multiple patterns to extract the user name
          // Pattern 1: "Name action verb" (e.g., "Rahil Desai finished reading")
          let match = message.match(/^(.+?)\s+(added to|is currently|finished|started|wrote|removed from)/);
          if (match) return match[1].trim();
          
          // Pattern 2: "Name verb" (e.g., "Rahil Desai added")
          match = message.match(/^(.+?)\s+(added|finished|started|wrote|removed)/);
          if (match) return match[1].trim();
          
          // Pattern 3: Just get everything before common action phrases
          match = message.match(/^(.+?)\s+(to TBR|reading|to Read)/);
          if (match) return match[1].trim();
          
          // Fallback: first two words (assuming "First Last")
          match = message.match(/^(\w+\s+\w+)/);
          return match ? match[1].trim() : 'Unknown User';
        };
        
        const activityUserDisplayName = extractUserFromMessage(messageText);
        
        // Filter out notifications from the current user
        const currentUserDisplayName = user?.name || user?.email?.split('@')[0]; // Use name or email prefix
        
        console.log('FriendsFeed notification check:', {
          messageText,
          activityUserDisplayName,
          currentUserDisplayName,
          userObject: user
        });
        
        if (activityUserDisplayName === currentUserDisplayName) {
          console.log('Ignoring self-notification from:', activityUserDisplayName);
          return; // Skip notifications from yourself
        }
        
        const newActivity: ActivityFeedItem = {
          id: Date.now().toString(),
          type: message.type,
          message: messageText,
          timestamp: new Date(),
          user: {
            displayName: activityUserDisplayName,
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

    return () => {
      // Cleanup subscriptions
      messageTypes.forEach(type => {
        webSocketService.unsubscribe(type, handleActivityUpdate);
      });
    };
  }, [isLoggedIn, user?.id]);


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

  const handleClearFeed = async () => {
    console.log('🔥 handleClearFeed called');
    setClearing(true);
    try {
      console.log('🔥 Making API call to clear feed...');
      const response = await fetch(`${API_CONFIG.BASE_URL}/activity/clear-friends-feed`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('🔥 API response status:', response.status, response.ok);

      if (response.ok) {
        console.log('🔥 API call successful, clearing local state...');
        // Clear local state immediately for better UX
        setActivities([]);
        setClearConfirmOpen(false);
        
        console.log('🔥 Reloading historical activity...');
        // Reload data from API to reflect backend changes (hidden activities)
        await loadHistoricalActivity(showAllActivities);
        
        console.log('🔥 Friends feed cleared successfully');
      } else {
        console.error('🔥 Failed to clear friends feed, status:', response.status);
        const errorText = await response.text();
        console.error('🔥 Error response:', errorText);
      }
    } catch (error) {
      console.error('🔥 Error clearing friends feed:', error);
    } finally {
      console.log('🔥 Setting clearing to false');
      setClearing(false);
    }
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
          <div style={{ maxHeight: showAllActivities ? '500px' : '300px', overflowY: 'auto' }}>
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
          
          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '12px', 
            marginTop: '16px', 
            paddingTop: '16px', 
            borderTop: '1px solid #E6D7C3' 
          }}>
            <button
              onClick={() => {
                const newShowAllState = !showAllActivities;
                setShowAllActivities(newShowAllState);
                loadHistoricalActivity(newShowAllState);
              }}
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
              {showAllActivities ? 'Show Recent' : 'View All Activity'}
            </button>
            
            <button
              onClick={() => setClearConfirmOpen(true)}
              disabled={clearing}
              style={{
                backgroundColor: 'transparent',
                color: '#D32F2F',
                border: '1px solid #D32F2F',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#D32F2F';
                e.currentTarget.style.color = 'white';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#D32F2F';
              }}
            >
              {clearing ? 'Clearing...' : 'Clear Feed'}
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
      
      {/* Clear Feed Confirmation Dialog */}
      <Dialog
        open={clearConfirmOpen}
        onClose={() => setClearConfirmOpen(false)}
        aria-labelledby="clear-feed-dialog-title"
        aria-describedby="clear-feed-dialog-description"
      >
        <DialogTitle id="clear-feed-dialog-title" sx={{ color: '#4B3F30' }}>
          Clear Friends Feed
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="clear-feed-dialog-description" sx={{ color: '#6A5E4D' }}>
            Are you sure you want to clear your entire friends feed? This will hide all current activities from your view. You can always refresh the page to see new activities.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setClearConfirmOpen(false)} 
            sx={{ color: '#8B7355' }}
            disabled={clearing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleClearFeed} 
            sx={{ color: '#D32F2F' }}
            disabled={clearing}
            autoFocus
          >
            {clearing ? 'Clearing...' : 'Clear Feed'}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FriendsFeed;