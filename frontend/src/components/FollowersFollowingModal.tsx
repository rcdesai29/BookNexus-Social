import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Close as CloseIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  People as FriendsIcon
} from '@mui/icons-material';
import { UserProfileService, User, UserProfileResponse } from '../app/services/services/UserProfileService';
import { useAuth } from '../hooks/useAuth';

interface FollowersFollowingModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  type: 'followers' | 'following';
  title: string;
}

const FollowersFollowingModal: React.FC<FollowersFollowingModalProps> = ({
  isOpen,
  onClose,
  userId,
  type,
  title
}) => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfileResponse[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfileResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [followStates, setFollowStates] = useState<{[key: number]: boolean}>({});
  const [mutualFollowStates, setMutualFollowStates] = useState<{[key: number]: boolean}>({});

  // Load followers/following when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      loadUsers();
    }
  }, [isOpen, userId, type]);

  // Filter and sort users based on search query and mutual follows
  useEffect(() => {
    let filtered = users;
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      filtered = users.filter(user =>
        user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Sort by mutual follows first (friends first)
    const sorted = filtered.sort((a, b) => {
      const aIsMutual = mutualFollowStates[a.userId] || false;
      const bIsMutual = mutualFollowStates[b.userId] || false;
      
      if (aIsMutual && !bIsMutual) return -1;
      if (!aIsMutual && bIsMutual) return 1;
      return 0;
    });
    
    setFilteredUsers(sorted);
  }, [searchQuery, users, mutualFollowStates]);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      let basicUsers: User[];
      if (type === 'followers') {
        basicUsers = await UserProfileService.getFollowers(userId);
      } else {
        basicUsers = await UserProfileService.getFollowing(userId);
      }
      
      // Get full profile data for each user to access displayName
      const fetchedUsers: UserProfileResponse[] = [];
      const initialFollowStates: {[key: number]: boolean} = {};
      const initialMutualFollowStates: {[key: number]: boolean} = {};
      
      for (const basicUser of basicUsers) {
        try {
          const fullProfile = await UserProfileService.getUserProfile(basicUser.id);
          fetchedUsers.push(fullProfile);
          initialFollowStates[fullProfile.userId] = fullProfile.isFollowing;
          initialMutualFollowStates[fullProfile.userId] = fullProfile.isFollowing && fullProfile.isFollowedBy;
        } catch (err) {
          console.error('Failed to get full profile for user:', basicUser.id, err);
          // Fallback: create a basic profile object
          const fallbackProfile: UserProfileResponse = {
            userId: basicUser.id,
            username: basicUser.username,
            email: basicUser.email,
            fullName: basicUser.fullName,
            displayName: basicUser.fullName, // Fallback to fullName
            bio: null,
            location: null,
            website: null,
            avatarUrl: null,
            twitterHandle: null,
            instagramHandle: null,
            goodreadsHandle: null,
            profileVisibility: 'PUBLIC',
            activityVisibility: 'PUBLIC',
            reviewsVisibility: 'PUBLIC',
            annualReadingGoal: null,
            preferredFormat: null,
            readingSpeed: null,
            booksRead: 0,
            currentlyReading: 0,
            wantToRead: null,
            averageRating: null,
            reviewsCount: 0,
            followersCount: 0,
            followingCount: 0,
            memberSince: '',
            lastActive: null,
            isFollowing: false,
            isFollowedBy: false,
            isOwnProfile: false
          };
          fetchedUsers.push(fallbackProfile);
          initialFollowStates[basicUser.id] = false;
          initialMutualFollowStates[basicUser.id] = false;
        }
      }
      
      setUsers(fetchedUsers);
      setFilteredUsers(fetchedUsers);
      
      setFollowStates(initialFollowStates);
      setMutualFollowStates(initialMutualFollowStates);
    } catch (err: any) {
      setError(err?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async (targetUserId: number) => {
    if (!currentUser) return;

    try {
      const isCurrentlyFollowing = followStates[targetUserId];
      
      if (isCurrentlyFollowing) {
        await UserProfileService.unfollowUser(targetUserId);
      } else {
        await UserProfileService.followUser(targetUserId);
      }
      
      setFollowStates(prev => ({
        ...prev,
        [targetUserId]: !isCurrentlyFollowing
      }));
      
      // Update mutual follow state - need to check if target user follows back
      try {
        const targetUserProfile = await UserProfileService.getUserProfile(targetUserId);
        setMutualFollowStates(prev => ({
          ...prev,
          [targetUserId]: !isCurrentlyFollowing && targetUserProfile.isFollowedBy
        }));
      } catch (err) {
        console.error('Failed to update mutual follow state:', err);
      }
    } catch (err: any) {
      console.error('Failed to toggle follow:', err);
    }
  };

  const handleUserClick = (user: UserProfileResponse) => {
    navigate(`/profile/${user.userId}`);
    onClose();
  };

  if (!isOpen) return null;

  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  };

  const modalContentStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '80vh',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(230, 215, 195, 0.3)',
    position: 'relative'
  };

  const headerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #8B4513, #A0522D)',
    color: '#FFF8DC',
    padding: '20px',
    borderRadius: '16px 16px 0 0',
    position: 'relative',
    textAlign: 'center'
  };

  const closeButtonStyle: React.CSSProperties = {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'rgba(255, 255, 255, 0.2)',
    border: 'none',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFF8DC',
    fontSize: '18px',
    transition: 'all 0.2s ease'
  };

  const searchContainerStyle: React.CSSProperties = {
    padding: '16px',
    borderBottom: '1px solid #E6D7C3'
  };

  const searchInputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px 10px 40px',
    border: '1px solid #E6D7C3',
    borderRadius: '8px',
    fontSize: '14px',
    backgroundColor: '#FAFAFA',
    position: 'relative'
  };

  const usersListStyle: React.CSSProperties = {
    maxHeight: '400px',
    overflowY: 'auto',
    padding: '0'
  };

  const userItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    borderBottom: '1px solid #F0F0F0',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  };

  const userInfoStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1
  };

  const avatarStyle: React.CSSProperties = {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#D2691E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '18px'
  };

  const followButtonStyle: React.CSSProperties = {
    padding: '6px 12px',
    border: '1px solid #D2691E',
    borderRadius: '6px',
    backgroundColor: 'transparent',
    color: '#D2691E',
    fontSize: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '4px'
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <button 
            style={closeButtonStyle}
            onClick={onClose}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
          >
            <CloseIcon style={{ fontSize: '18px' }} />
          </button>
          <h2 style={{ margin: '0', fontSize: '20px' }}>
            {title}
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
            {users.length} {type}
          </p>
        </div>

        {/* Search Bar */}
        <div style={searchContainerStyle}>
          <div style={{ position: 'relative' }}>
            <SearchIcon style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#999',
              fontSize: '18px'
            }} />
            <input
              type="text"
              placeholder={`Search ${type}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={searchInputStyle}
            />
          </div>
        </div>

        {/* Users List */}
        <div style={usersListStyle}>
          {loading ? (
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <div style={{
                width: '24px',
                height: '24px',
                border: '2px solid #E6D7C3',
                borderTop: '2px solid #D2691E',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 8px'
              }} />
              <p style={{ color: '#666', fontSize: '14px' }}>Loading {type}...</p>
            </div>
          ) : error ? (
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <p style={{ color: '#DC2626', fontSize: '14px' }}>{error}</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <PersonIcon style={{ color: '#999', fontSize: '48px', marginBottom: '8px' }} />
              <p style={{ color: '#666', fontSize: '14px' }}>
                {searchQuery ? `No ${type} found matching "${searchQuery}"` : `No ${type} yet`}
              </p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div 
                key={user.userId}
                style={userItemStyle}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F9F7F4'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={userInfoStyle} onClick={() => handleUserClick(user)}>
                  <div style={avatarStyle}>
                    <PersonIcon style={{ fontSize: '20px' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      fontSize: '14px', 
                      fontWeight: 500, 
                      color: '#4B3F30',
                      marginBottom: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {user.displayName}
                      {mutualFollowStates[user.userId] && (
                        <FriendsIcon style={{ 
                          fontSize: '16px', 
                          color: '#D2691E',
                          backgroundColor: 'rgba(210, 105, 30, 0.1)',
                          borderRadius: '50%',
                          padding: '2px'
                        }} />
                      )}
                    </div>
                    <div style={{ 
                      fontSize: '12px', 
                      color: '#8B7355' 
                    }}>
                      @{user.username}
                    </div>
                  </div>
                </div>
                
                {/* Follow/Unfollow Button - only show for other users and only in followers list */}
                {currentUser && user.userId !== currentUser.id && type === 'followers' && (
                  <button
                    style={{
                      ...followButtonStyle,
                      backgroundColor: followStates[user.userId] ? '#D2691E' : 'transparent',
                      color: followStates[user.userId] ? 'white' : '#D2691E'
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFollowToggle(user.userId);
                    }}
                    onMouseOver={(e) => {
                      if (!followStates[user.userId]) {
                        e.currentTarget.style.backgroundColor = '#D2691E';
                        e.currentTarget.style.color = 'white';
                      } else {
                        e.currentTarget.style.backgroundColor = '#B85A1A';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!followStates[user.userId]) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#D2691E';
                      } else {
                        e.currentTarget.style.backgroundColor = '#D2691E';
                        e.currentTarget.style.color = 'white';
                      }
                    }}
                  >
                    {followStates[user.userId] ? (
                      <>
                        <PersonRemoveIcon style={{ fontSize: '14px' }} />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <PersonAddIcon style={{ fontSize: '14px' }} />
                        Follow
                      </>
                    )}
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default FollowersFollowingModal;