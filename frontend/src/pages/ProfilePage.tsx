import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Edit as EditIcon,
  LocationOn as LocationIcon,
  Language as WebsiteIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  Book as BookIcon,
  Person as PersonIcon,
  CalendarToday as CalendarIcon,
  Star as StarIcon,
  RateReview as ReviewIcon,
  People as PeopleIcon,
  Add as FollowIcon,
  Check as FollowingIcon
} from '@mui/icons-material';
import { UserProfileService, UserProfileResponse } from '../app/services/services/UserProfileService';
import { FeedbackService } from '../app/services/services/FeedbackService';
import { FeedbackResponse } from '../app/services/models/FeedbackResponse';
import { tokenService } from '../services/tokenService';
import StarRating from '../components/StarRating';

type UserProfile = UserProfileResponse;

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [recentReviews, setRecentReviews] = useState<FeedbackResponse[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setError('No user ID provided');
      setLoading(false);
      return;
    }
    
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const profileData = await UserProfileService.getUserProfile(parseInt(userId));
        setProfile(profileData);
      } catch (err: any) {
        console.error('Profile loading error:', err);
        setError(err?.body?.message || err?.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  const fetchRecentReviews = async (userIdNum: number) => {
    try {
      setReviewsLoading(true);
      const reviewsData = await FeedbackService.findAllFeedbacksByUser(userIdNum, 0, 2);
      setRecentReviews(reviewsData.content || []);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (profile && userId) {
      fetchRecentReviews(parseInt(userId));
    }
  }, [profile, userId]);

  const handleFollow = async () => {
    if (!profile || !userId) return;
    
    try {
      setFollowLoading(true);
      if (profile.isFollowing) {
        await UserProfileService.unfollowUser(parseInt(userId));
        setProfile(prev => prev ? { ...prev, isFollowing: false, followersCount: prev.followersCount - 1 } : null);
      } else {
        await UserProfileService.followUser(parseInt(userId));
        setProfile(prev => prev ? { ...prev, isFollowing: true, followersCount: prev.followersCount + 1 } : null);
      }
    } catch (err: any) {
      setError(err?.body?.message || 'Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleEditProfile = () => {
    navigate(`/profile/${userId}/edit`);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const tabStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '12px 24px',
    backgroundColor: isActive ? '#D2691E' : 'transparent',
    color: isActive ? 'white' : '#4B3F30',
    border: 'none',
    borderRadius: '8px 8px 0 0',
    fontSize: '16px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    borderBottom: isActive ? '3px solid #B85A1A' : '1px solid #E6D7C3'
  });

  const statsCardStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    padding: '24px',
    borderRadius: '12px',
    border: '1px solid #E6D7C3',
    boxShadow: '0 4px 12px rgba(75, 63, 48, 0.1)',
    textAlign: 'center',
    transition: 'all 0.3s ease'
  };

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#FAF3E3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #E6D7C3',
          borderTop: '4px solid #D2691E',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#FAF3E3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #E6D7C3',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontFamily: 'Playfair Display, serif',
            color: '#4B3F30',
            marginBottom: '8px'
          }}>
            Error Loading Profile
          </h3>
          <p style={{ color: '#6A5E4D' }}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#FAF3E3',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '24px',
          borderRadius: '12px',
          border: '1px solid #E6D7C3',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontFamily: 'Playfair Display, serif',
            color: '#4B3F30',
            marginBottom: '8px'
          }}>
            Profile Not Found
          </h3>
          <p style={{ color: '#6A5E4D' }}>
            The profile you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

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
            Profile
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Discover the literary world of {profile.displayName || profile.fullName}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Profile Header Card */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          padding: '32px',
          borderRadius: '16px',
          border: '1px solid #E6D7C3',
          boxShadow: '0 4px 20px rgba(75, 63, 48, 0.1)',
          marginBottom: '32px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 2fr',
            gap: '32px',
            alignItems: 'start'
          }}>
            {/* Avatar and Basic Info */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                backgroundColor: '#E6D7C3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '48px',
                color: '#8B7355',
                fontWeight: 'bold'
              }}>
                {profile.displayName?.charAt(0) || profile.fullName?.charAt(0) || 'U'}
              </div>
              <h2 style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '28px',
                fontWeight: 600,
                color: '#4B3F30',
                marginBottom: '8px'
              }}>
                {profile.displayName || profile.fullName}
              </h2>
              <p style={{
                color: '#6A5E4D',
                fontSize: '16px',
                marginBottom: '16px'
              }}>
                @{profile.username}
              </p>
              
              {/* Follow Button */}
              {!profile.isOwnProfile && (
                <button
                  style={{
                    backgroundColor: profile.isFollowing ? 'transparent' : '#D2691E',
                    color: profile.isFollowing ? '#D2691E' : 'white',
                    border: `1px solid #D2691E`,
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    margin: '0 auto'
                  }}
                  onMouseOver={(e) => {
                    if (profile.isFollowing) {
                      e.currentTarget.style.backgroundColor = '#D2691E';
                      e.currentTarget.style.color = 'white';
                    } else {
                      e.currentTarget.style.backgroundColor = '#B85A1A';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (profile.isFollowing) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#D2691E';
                    } else {
                      e.currentTarget.style.backgroundColor = '#D2691E';
                    }
                  }}
                  onClick={handleFollow}
                  disabled={followLoading}
                >
                  {profile.isFollowing ? <FollowingIcon /> : <FollowIcon />}
                  {profile.isFollowing ? 'Following' : 'Follow'}
                </button>
              )}
              
              {/* Edit Profile Button */}
              {profile.isOwnProfile && (
                <button
                  style={{
                    backgroundColor: 'transparent',
                    color: '#D2691E',
                    border: '1px solid #D2691E',
                    borderRadius: '8px',
                    padding: '12px 24px',
                    fontSize: '16px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    margin: '0 auto'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#D2691E';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#D2691E';
                  }}
                  onClick={handleEditProfile}
                >
                  <EditIcon />
                  Edit Profile
                </button>
              )}
            </div>

            {/* Profile Details */}
            <div>
              {profile.bio && (
                <p style={{
                  fontSize: '18px',
                  color: '#4B3F30',
                  marginBottom: '24px',
                  lineHeight: 1.6
                }}>
                  {profile.bio}
                </p>
              )}

              {/* Contact Info */}
              {(profile.location || profile.website) && (
                <div style={{ marginBottom: '16px' }}>
                  {profile.location && (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.5)',
                      borderRadius: '6px',
                      border: '1px solid #E6D7C3',
                      marginRight: '8px',
                      marginBottom: '8px'
                    }}>
                      <LocationIcon style={{ color: '#8B7355', fontSize: '16px' }} />
                      <span style={{ color: '#4B3F30', fontSize: '14px' }}>
                        {profile.location}
                      </span>
                    </div>
                  )}
                  {profile.website && (
                    <button
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        borderRadius: '6px',
                        border: '1px solid #E6D7C3',
                        marginRight: '8px',
                        marginBottom: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                        e.currentTarget.style.borderColor = '#D2691E';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
                        e.currentTarget.style.borderColor = '#E6D7C3';
                      }}
                      onClick={() => profile.website && window.open(profile.website, '_blank')}
                    >
                      <WebsiteIcon style={{ color: '#8B7355', fontSize: '16px' }} />
                      <span style={{ color: '#4B3F30', fontSize: '14px' }}>
                        Website
                      </span>
                    </button>
                  )}
                </div>
              )}

              {/* Social Links */}
              {(profile.twitterHandle || profile.instagramHandle || profile.goodreadsHandle) && (
                <div style={{ marginBottom: '16px' }}>
                  {profile.twitterHandle && (
                    <button
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        borderRadius: '6px',
                        border: '1px solid #E6D7C3',
                        marginRight: '8px',
                        marginBottom: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                        e.currentTarget.style.borderColor = '#D2691E';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
                        e.currentTarget.style.borderColor = '#E6D7C3';
                      }}
                      onClick={() => window.open(`https://twitter.com/${profile.twitterHandle}`, '_blank')}
                    >
                      <TwitterIcon style={{ color: '#8B7355', fontSize: '16px' }} />
                      <span style={{ color: '#4B3F30', fontSize: '14px' }}>
                        @{profile.twitterHandle}
                      </span>
                    </button>
                  )}
                  {profile.instagramHandle && (
                    <button
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        borderRadius: '6px',
                        border: '1px solid #E6D7C3',
                        marginRight: '8px',
                        marginBottom: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                        e.currentTarget.style.borderColor = '#D2691E';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
                        e.currentTarget.style.borderColor = '#E6D7C3';
                      }}
                      onClick={() => window.open(`https://instagram.com/${profile.instagramHandle}`, '_blank')}
                    >
                      <InstagramIcon style={{ color: '#8B7355', fontSize: '16px' }} />
                      <span style={{ color: '#4B3F30', fontSize: '14px' }}>
                        @{profile.instagramHandle}
                      </span>
                    </button>
                  )}
                  {profile.goodreadsHandle && (
                    <button
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        backgroundColor: 'rgba(255, 255, 255, 0.5)',
                        borderRadius: '6px',
                        border: '1px solid #E6D7C3',
                        marginRight: '8px',
                        marginBottom: '8px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                        e.currentTarget.style.borderColor = '#D2691E';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.5)';
                        e.currentTarget.style.borderColor = '#E6D7C3';
                      }}
                      onClick={() => window.open(`https://goodreads.com/user/show/${profile.goodreadsHandle}`, '_blank')}
                    >
                      <BookIcon style={{ color: '#8B7355', fontSize: '16px' }} />
                      <span style={{ color: '#4B3F30', fontSize: '14px' }}>
                        {profile.goodreadsHandle}
                      </span>
                    </button>
                  )}
                </div>
              )}

              {/* Reading Preferences */}
              {(profile.annualReadingGoal || profile.preferredFormat || profile.readingSpeed) && (
                <div style={{ marginBottom: '16px' }}>
                  <h4 style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '16px',
                    color: '#4B3F30',
                    marginBottom: '12px',
                    fontWeight: 600
                  }}>
                    Reading Preferences
                  </h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {profile.annualReadingGoal && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 12px',
                        backgroundColor: 'rgba(210, 105, 30, 0.1)',
                        borderRadius: '6px',
                        border: '1px solid rgba(210, 105, 30, 0.3)'
                      }}>
                        <StarIcon style={{ color: '#D2691E', fontSize: '14px' }} />
                        <span style={{ color: '#4B3F30', fontSize: '12px', fontWeight: 500 }}>
                          Goal: {profile.annualReadingGoal} books/year
                        </span>
                      </div>
                    )}
                    {profile.preferredFormat && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 12px',
                        backgroundColor: 'rgba(210, 105, 30, 0.1)',
                        borderRadius: '6px',
                        border: '1px solid rgba(210, 105, 30, 0.3)'
                      }}>
                        <BookIcon style={{ color: '#D2691E', fontSize: '14px' }} />
                        <span style={{ color: '#4B3F30', fontSize: '12px', fontWeight: 500 }}>
                          {profile.preferredFormat === 'PHYSICAL' && 'Physical Books'}
                          {profile.preferredFormat === 'EBOOK' && 'E-Books'}
                          {profile.preferredFormat === 'AUDIOBOOK' && 'Audiobooks'}
                        </span>
                      </div>
                    )}
                    {profile.readingSpeed && (
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '6px 12px',
                        backgroundColor: 'rgba(210, 105, 30, 0.1)',
                        borderRadius: '6px',
                        border: '1px solid rgba(210, 105, 30, 0.3)'
                      }}>
                        <PersonIcon style={{ color: '#D2691E', fontSize: '14px' }} />
                        <span style={{ color: '#4B3F30', fontSize: '12px', fontWeight: 500 }}>
                          {profile.readingSpeed === 'FAST' && 'Fast Reader'}
                          {profile.readingSpeed === 'AVERAGE' && 'Average Reader'}
                          {profile.readingSpeed === 'SLOW' && 'Slow Reader'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Join Date */}
              {profile.memberSince && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: '#6A5E4D',
                  fontSize: '14px'
                }}>
                  <CalendarIcon style={{ fontSize: '16px' }} />
                  <span>Member since {formatDate(profile.memberSince)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          <div style={statsCardStyle}>
            <BookIcon style={{ color: '#D2691E', fontSize: '40px', marginBottom: '8px' }} />
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#4B3F30',
              marginBottom: '4px'
            }}>
              {profile.booksRead || 0}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#6A5E4D'
            }}>
              Books Read
            </div>
          </div>
          <div style={statsCardStyle}>
            <PersonIcon style={{ color: '#D2691E', fontSize: '40px', marginBottom: '8px' }} />
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#4B3F30',
              marginBottom: '4px'
            }}>
              {profile.followersCount || 0}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#6A5E4D'
            }}>
              Followers
            </div>
          </div>
          <div style={statsCardStyle}>
            <PeopleIcon style={{ color: '#D2691E', fontSize: '40px', marginBottom: '8px' }} />
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#4B3F30',
              marginBottom: '4px'
            }}>
              {profile.followingCount || 0}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#6A5E4D'
            }}>
              Following
            </div>
          </div>
          <div style={statsCardStyle}>
            <ReviewIcon style={{ color: '#D2691E', fontSize: '40px', marginBottom: '8px' }} />
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#4B3F30',
              marginBottom: '4px'
            }}>
              {profile.reviewsCount || 0}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#6A5E4D'
            }}>
              Reviews
            </div>
          </div>
        </div>

        {/* Tabs for different sections */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: '1px solid #E6D7C3',
          boxShadow: '0 4px 20px rgba(75, 63, 48, 0.1)',
          overflow: 'hidden'
        }}>
          {/* Tab Navigation */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #E6D7C3',
            backgroundColor: 'rgba(255, 255, 255, 0.5)'
          }}>
            <button
              style={tabStyle(activeTab === 0)}
              onClick={() => setActiveTab(0)}
            >
              Currently Reading
            </button>
            <button
              style={tabStyle(activeTab === 1)}
              onClick={() => setActiveTab(1)}
            >
              Read Books
            </button>
            <button
              style={tabStyle(activeTab === 2)}
              onClick={() => setActiveTab(2)}
            >
              Reviews
            </button>
            <button
              style={tabStyle(activeTab === 3)}
              onClick={() => setActiveTab(3)}
            >
              Followers
            </button>
            <button
              style={tabStyle(activeTab === 4)}
              onClick={() => setActiveTab(4)}
            >
              Following
            </button>
          </div>
          
          {/* Tab Content */}
          <div style={{ padding: '32px' }}>
            {activeTab === 0 && (
              <div style={{
                textAlign: 'center',
                color: '#6A5E4D',
                fontSize: '16px'
              }}>
                Currently reading: {profile.currentlyReading || 0} books
                <div style={{ marginTop: '16px' }}>
                  <BookIcon style={{ color: '#8B7355', fontSize: '48px' }} />
                  <p style={{ marginTop: '8px' }}>Reading activity will be displayed here</p>
                </div>
              </div>
            )}
            {activeTab === 1 && (
              <div style={{
                textAlign: 'center',
                color: '#6A5E4D',
                fontSize: '16px'
              }}>
                Read: {profile.booksRead || 0} books
                <div style={{ marginTop: '16px' }}>
                  <BookIcon style={{ color: '#8B7355', fontSize: '48px' }} />
                  <p style={{ marginTop: '8px' }}>Completed books will be displayed here</p>
                </div>
              </div>
            )}
            {activeTab === 2 && (
              <div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '24px'
                }}>
                  <h3 style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '24px',
                    color: '#4B3F30',
                    margin: 0
                  }}>
                    Recent Reviews
                  </h3>
                  <span style={{
                    color: '#6A5E4D',
                    fontSize: '14px'
                  }}>
                    {profile.reviewsCount || 0} total reviews
                  </span>
                </div>

                {reviewsLoading ? (
                  <div style={{
                    textAlign: 'center',
                    color: '#6A5E4D',
                    padding: '32px'
                  }}>
                    Loading reviews...
                  </div>
                ) : recentReviews.length > 0 ? (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '16px'
                  }}>
                    {recentReviews.map((review, index) => (
                      <div
                        key={index}
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.6)',
                          borderRadius: '12px',
                          padding: '20px',
                          border: '1px solid #E6D7C3',
                          boxShadow: '0 2px 8px rgba(75, 63, 48, 0.05)'
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          gap: '16px',
                          marginBottom: '12px'
                        }}>
                          {review.bookCover && (
                            <img
                              src={review.bookCover}
                              alt={review.bookTitle}
                              style={{
                                width: '60px',
                                height: '90px',
                                objectFit: 'cover',
                                borderRadius: '6px',
                                border: '1px solid #E6D7C3'
                              }}
                            />
                          )}
                          <div style={{ flex: 1 }}>
                            <h4 style={{
                              fontFamily: 'Playfair Display, serif',
                              fontSize: '18px',
                              color: '#4B3F30',
                              margin: '0 0 4px 0',
                              lineHeight: 1.2
                            }}>
                              {review.bookTitle}
                            </h4>
                            <p style={{
                              color: '#6A5E4D',
                              fontSize: '14px',
                              margin: '0 0 8px 0'
                            }}>
                              by {review.bookAuthor}
                            </p>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginBottom: '8px'
                            }}>
                              <StarRating 
                                rating={review.rating || 0} 
                                size="small" 
                                color="#D2691E"
                              />
                              <span style={{
                                color: '#6A5E4D',
                                fontSize: '12px'
                              }}>
                                {review.createdDate && new Date(review.createdDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        {review.review && (
                          <p style={{
                            color: '#4B3F30',
                            fontSize: '14px',
                            lineHeight: 1.5,
                            margin: '0',
                            fontStyle: 'italic'
                          }}>
                            "{review.review}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{
                    textAlign: 'center',
                    color: '#6A5E4D',
                    fontSize: '16px',
                    padding: '32px'
                  }}>
                    <ReviewIcon style={{ color: '#8B7355', fontSize: '48px', marginBottom: '16px' }} />
                    <p>No reviews yet</p>
                    <p style={{ fontSize: '14px', marginTop: '8px' }}>
                      Reviews will appear here when {profile.isOwnProfile ? 'you review' : `${profile.displayName || profile.fullName} reviews`} books
                    </p>
                  </div>
                )}
              </div>
            )}
            {activeTab === 3 && (
              <div style={{
                textAlign: 'center',
                color: '#6A5E4D',
                fontSize: '16px'
              }}>
                Followers: {profile.followersCount || 0} followers
                <div style={{ marginTop: '16px' }}>
                  <PeopleIcon style={{ color: '#8B7355', fontSize: '48px' }} />
                  <p style={{ marginTop: '8px' }}>Follower list will be displayed here</p>
                </div>
              </div>
            )}
            {activeTab === 4 && (
              <div style={{
                textAlign: 'center',
                color: '#6A5E4D',
                fontSize: '16px'
              }}>
                Following: {profile.followingCount || 0} users
                <div style={{ marginTop: '16px' }}>
                  <PeopleIcon style={{ color: '#8B7355', fontSize: '48px' }} />
                  <p style={{ marginTop: '8px' }}>Following list will be displayed here</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
