import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search as SearchIcon,
  Person as PersonIcon,
  PersonAdd as PersonAddIcon,
  PersonRemove as PersonRemoveIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { UserProfileService, UserProfileResponse } from '../app/services/services/UserProfileService';
import { useAuth } from '../hooks/useAuth';

const FindFriendsPage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserProfileResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followingUsers, setFollowingUsers] = useState<Set<number>>(new Set());

  const debounceDelay = 500;

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (query: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => performSearch(query), debounceDelay);
      };
    })(),
    []
  );

  useEffect(() => {
    if (searchQuery.trim() && searchQuery.length >= 2) {
      debouncedSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
    return () => {
      // Cleanup timeout on unmount
    };
  }, [searchQuery, debouncedSearch]);

  const performSearch = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await UserProfileService.searchUsersByDisplayName(query);
      setSearchResults(results || []);
    } catch (err: any) {
      setError(err?.body?.message || 'Failed to search users');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: number) => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    try {
      if (followingUsers.has(userId)) {
        await UserProfileService.unfollowUser(userId);
        setFollowingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      } else {
        await UserProfileService.followUser(userId);
        setFollowingUsers(prev => new Set([...prev, userId]));
      }
      
      // Update the search results to reflect the new follow status
      setSearchResults(prev => prev.map(user => 
        user.userId === userId 
          ? { ...user, isFollowing: !user.isFollowing, followersCount: user.followersCount + (followingUsers.has(userId) ? -1 : 1) }
          : user
      ));
    } catch (err: any) {
      setError(err?.body?.message || 'Failed to update follow status');
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
  };

  const handleProfileClick = (userId: number) => {
    navigate(`/profile/${userId}`);
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    padding: '20px',
    borderRadius: '12px',
    border: '1px solid #E6D7C3',
    boxShadow: '0 4px 12px rgba(75, 63, 48, 0.1)',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  };

  const buttonStyle = (isFollowing: boolean): React.CSSProperties => ({
    backgroundColor: isFollowing ? 'transparent' : '#D2691E',
    color: isFollowing ? '#D2691E' : 'white',
    border: `1px solid #D2691E`,
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF3E3' }}>
      {/* Header Section */}
      <div style={{
        background: 'linear-gradient(90deg, #4B3F30, #5D4A33, #4B3F30)',
        color: 'white',
        padding: '48px 0',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '36px',
            fontWeight: 700,
            marginBottom: '16px'
          }}>
            Find Friends
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Connect with fellow book lovers and discover new reading companions
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Search Section */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          padding: '32px',
          borderRadius: '16px',
          border: '1px solid #E6D7C3',
          boxShadow: '0 4px 20px rgba(75, 63, 48, 0.1)',
          marginBottom: '32px'
        }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <SearchIcon style={{
                position: 'absolute',
                left: '16px',
                color: '#8B7355',
                fontSize: '20px',
                zIndex: 1
              }} />
              <input
                type="text"
                placeholder="Search by display name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '16px 16px 16px 48px',
                  paddingRight: searchQuery ? '48px' : '16px',
                  fontSize: '16px',
                  border: '2px solid #E6D7C3',
                  borderRadius: '8px',
                  backgroundColor: 'white',
                  fontFamily: 'Inter, sans-serif',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#D2691E';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(210, 105, 30, 0.1)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#E6D7C3';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              {searchQuery && (
                <button
                  style={{
                    position: 'absolute',
                    right: '16px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#8B7355',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'all 0.2s'
                  }}
                  onClick={handleClearSearch}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(139, 115, 85, 0.1)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <ClearIcon style={{ fontSize: '18px' }} />
                </button>
              )}
            </div>
            
            {loading && (
              <div style={{
                textAlign: 'center',
                padding: '16px',
                color: '#6A5E4D',
                fontSize: '14px'
              }}>
                Searching...
              </div>
            )}

            {error && (
              <div style={{
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                padding: '12px',
                borderRadius: '8px',
                marginTop: '16px',
                fontSize: '14px',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div>
            <h2 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '24px',
              color: '#4B3F30',
              marginBottom: '24px'
            }}>
              Search Results ({searchResults.length})
            </h2>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {searchResults.map((user) => (
                <div
                  key={user.userId}
                  style={cardStyle}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(75, 63, 48, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(75, 63, 48, 0.1)';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    {/* Avatar */}
                    <div 
                      style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: '#E6D7C3',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        color: '#8B7355',
                        fontWeight: 'bold',
                        flexShrink: 0,
                        cursor: 'pointer'
                      }}
                      onClick={() => handleProfileClick(user.userId)}
                    >
                      {user.displayName?.charAt(0) || user.fullName?.charAt(0) || 'U'}
                    </div>

                    {/* User Info */}
                    <div 
                      style={{ flex: 1, cursor: 'pointer' }}
                      onClick={() => handleProfileClick(user.userId)}
                    >
                      <h3 style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: '20px',
                        fontWeight: 600,
                        color: '#4B3F30',
                        marginBottom: '4px'
                      }}>
                        {user.displayName || user.fullName}
                      </h3>
                      <p style={{
                        color: '#6A5E4D',
                        fontSize: '14px',
                        marginBottom: '8px'
                      }}>
                        @{user.username}
                      </p>
                      {user.bio && (
                        <p style={{
                          color: '#8B7355',
                          fontSize: '14px',
                          lineHeight: 1.4,
                          marginBottom: '8px'
                        }}>
                          {user.bio.length > 100 ? `${user.bio.substring(0, 100)}...` : user.bio}
                        </p>
                      )}
                      <div style={{
                        display: 'flex',
                        gap: '16px',
                        fontSize: '12px',
                        color: '#8B7355'
                      }}>
                        <span>{user.booksRead || 0} books read</span>
                        <span>{user.followersCount || 0} followers</span>
                        <span>{user.followingCount || 0} following</span>
                      </div>
                    </div>

                    {/* Follow Button */}
                    {!user.isOwnProfile && (
                      <button
                        style={buttonStyle(user.isFollowing || false)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFollow(user.userId);
                        }}
                        onMouseOver={(e) => {
                          if (user.isFollowing) {
                            e.currentTarget.style.backgroundColor = '#DC2626';
                            e.currentTarget.style.color = 'white';
                            e.currentTarget.style.borderColor = '#DC2626';
                          } else {
                            e.currentTarget.style.backgroundColor = '#B85A1A';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (user.isFollowing) {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = '#D2691E';
                            e.currentTarget.style.borderColor = '#D2691E';
                          } else {
                            e.currentTarget.style.backgroundColor = '#D2691E';
                          }
                        }}
                      >
                        {user.isFollowing ? (
                          <>
                            <PersonRemoveIcon style={{ fontSize: '16px' }} />
                            Unfollow
                          </>
                        ) : (
                          <>
                            <PersonAddIcon style={{ fontSize: '16px' }} />
                            Follow
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && searchQuery.trim() && searchResults.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '64px 24px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '16px',
            border: '1px solid #E6D7C3'
          }}>
            <PersonIcon style={{ 
              color: '#8B7355', 
              fontSize: '64px',
              marginBottom: '24px'
            }} />
            <h3 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '24px',
              color: '#4B3F30',
              marginBottom: '16px'
            }}>
              No Users Found
            </h3>
            <p style={{
              color: '#6A5E4D',
              fontSize: '16px',
              marginBottom: '24px'
            }}>
              No users found with the name "{searchQuery}". Try a different search term.
            </p>
          </div>
        )}

        {/* Initial State */}
        {!searchQuery.trim() && (
          <div style={{
            textAlign: 'center',
            padding: '64px 24px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '16px',
            border: '1px solid #E6D7C3'
          }}>
            <SearchIcon style={{ 
              color: '#8B7355', 
              fontSize: '64px',
              marginBottom: '24px'
            }} />
            <h3 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '24px',
              color: '#4B3F30',
              marginBottom: '16px'
            }}>
              Find Book Lovers
            </h3>
            <p style={{
              color: '#6A5E4D',
              fontSize: '16px',
              maxWidth: '400px',
              margin: '0 auto'
            }}>
              Search for users by their display name to connect with fellow readers and discover new book recommendations.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FindFriendsPage;