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
  Check as FollowingIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { UserProfileService, UserProfileResponse } from '../app/services/services/UserProfileService';
import { FeedbackService } from '../app/services/services/FeedbackService';
import { FeedbackResponse } from '../app/services/models/FeedbackResponse';
import { GoogleBookFeedbackService, GoogleBookFeedbackResponse } from '../app/services/services/GoogleBookFeedbackService';
import { UserBookListService, UserBookList } from '../app/services/services/UserBookListService';
import StarRating from '../components/StarRating';

type UserProfile = UserProfileResponse;

const ProfilePage: React.FC = () => {
  // Force recompilation to clear TypeScript cache
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [recentReviews, setRecentReviews] = useState<FeedbackResponse[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [editingReview, setEditingReview] = useState<number | null>(null);
  const [deletingReview, setDeletingReview] = useState<number | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [reviewToDelete, setReviewToDelete] = useState<FeedbackResponse | null>(null);
  const [editFormData, setEditFormData] = useState<{ rating: number; review: string; isAnonymous: boolean }>({ rating: 5, review: '', isAnonymous: false });
  const [currentlyReadingBooks, setCurrentlyReadingBooks] = useState<UserBookList[]>([]);
  const [readBooks, setReadBooks] = useState<UserBookList[]>([]);
  const [booksLoading, setBooksLoading] = useState(false);

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
      console.log('Fetching reviews for user ID:', userIdNum);
      
      // Fetch both regular reviews and Google Book reviews
      const [regularReviewsData, googleBookReviews] = await Promise.all([
        FeedbackService.findAllFeedbacksByUser(userIdNum, 0, 10),
        GoogleBookFeedbackService.getFeedbackByUserId(userIdNum)
      ]);
      
      console.log('Regular reviews data received:', regularReviewsData);
      console.log('Google Book reviews data received:', googleBookReviews);
      
      // Convert Google Book reviews to the same format as regular reviews  
      console.log('Raw Google Book reviews from API:', googleBookReviews);
      const convertedGoogleBookReviews = googleBookReviews.map((review: GoogleBookFeedbackResponse): FeedbackResponse & { isGoogleBookReview?: boolean; googleBookId?: string } => {
        console.log('Converting Google Book review:', review);
        // Convert the array-based date to string
        const dateString = Array.isArray(review.createdDate) && review.createdDate.length >= 3
          ? `${review.createdDate[0]}-${String(review.createdDate[1]).padStart(2, '0')}-${String(review.createdDate[2]).padStart(2, '0')}`
          : new Date().toISOString();
          
        return {
          id: review.id,
          rating: review.rating,
          review: review.review,
          bookTitle: review.bookTitle,
          bookAuthor: review.authorName,
          createdDate: dateString,
          displayName: review.displayName,
          userId: review.userId,
          isAnonymous: review.anonymous, // Backend uses 'anonymous' not 'isAnonymous'
          // Add a flag to identify this as a Google Book review and preserve the googleBookId
          isGoogleBookReview: true,
          googleBookId: review.googleBookId
        } as FeedbackResponse & { isGoogleBookReview?: boolean; googleBookId?: string };
      });
      
      // Merge both types of reviews and remove duplicates
      const allReviewsRaw = [
        ...(regularReviewsData.content || []),
        ...convertedGoogleBookReviews
      ];
      
      // Remove duplicates based on review content and book title
      // When there are duplicates, prefer Google Book reviews (which have googleBookId)
      const uniqueReviews = allReviewsRaw.filter((review, index, self) => {
        const duplicateIndex = self.findIndex(r => 
          r.bookTitle === review.bookTitle && 
          r.review === review.review && 
          r.rating === review.rating
        );
        
        if (duplicateIndex === index) {
          // This is the first occurrence, keep it
          return true;
        } else {
          // This is a duplicate. Keep it only if it's a Google Book review and the original isn't
          const original = self[duplicateIndex];
          const isGoogleBookReview = (review as any).isGoogleBookReview;
          const originalIsGoogleBookReview = (original as any).isGoogleBookReview;
          
          // If current is Google Book review and original isn't, replace the original
          if (isGoogleBookReview && !originalIsGoogleBookReview) {
            // Remove the original from the array by marking it for exclusion
            return true;
          }
          return false;
        }
      }).filter((review, index, self) => {
        // Final cleanup: ensure we don't have both regular and Google Book versions
        const isGoogleBookReview = (review as any).isGoogleBookReview;
        if (!isGoogleBookReview) {
          // Check if there's a Google Book version of this review
          const hasGoogleBookVersion = self.some((r, i) => 
            i !== index &&
            (r as any).isGoogleBookReview &&
            r.bookTitle === review.bookTitle && 
            r.review === review.review && 
            r.rating === review.rating
          );
          return !hasGoogleBookVersion; // Exclude regular review if Google Book version exists
        }
        return true; // Always keep Google Book reviews
      });
      
      // Sort by date
      const allReviews = uniqueReviews.sort((a, b) => {
        const dateA = new Date(a.createdDate || 0);
        const dateB = new Date(b.createdDate || 0);
        return dateB.getTime() - dateA.getTime(); // Sort descending (newest first)
      });
      
      console.log('Merged reviews:', allReviews);
      console.log('About to render reviews. Count:', allReviews.length);
      setRecentReviews(allReviews);
    } catch (err: any) {
      console.error('Error fetching reviews:', err);
      console.error('Full error object:', JSON.stringify(err, null, 2));
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (profile && userId) {
      console.log('Profile loaded. reviewsCount:', profile.reviewsCount);
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

  const handleEditReview = (review: FeedbackResponse) => {
    setEditingReview(review.id || null);
    setEditFormData({
      rating: review.rating || 5,
      review: review.review || '',
      isAnonymous: review.isAnonymous || false
    });
  };

  const saveEditReview = async (review: FeedbackResponse) => {
    if (!review.id) {
      setError('Review ID not found');
      return;
    }

    try {
      console.log('Attempting to save review:', {
        reviewId: review.id,
        bookId: review.bookId,
        editFormData,
        reviewObject: review
      });
      
      // Determine if it's a Google Book review (bookId is null) or regular book review
      if (review.bookId === null || review.bookId === undefined) {
        // This is a Google Book review
        const googleBookReview = review as FeedbackResponse & { googleBookId?: string };
        console.log('Google Book review object:', googleBookReview);
        console.log('Available googleBookId:', googleBookReview.googleBookId);
        
        // Validate required fields before sending
        if (!googleBookReview.googleBookId) {
          throw new Error('Google Book ID is missing');
        }
        if (!review.bookTitle) {
          throw new Error('Book title is missing');
        }
        if (!review.bookAuthor) {
          throw new Error('Author name is missing');
        }
        if (!editFormData.review || editFormData.review.trim() === '') {
          throw new Error('Review text cannot be empty');
        }
        
        const updateData = {
          googleBookId: googleBookReview.googleBookId,
          bookTitle: review.bookTitle,
          authorName: review.bookAuthor,
          rating: parseFloat(editFormData.rating.toString()), // Ensure it's a Double
          review: editFormData.review.trim(),
          isAnonymous: editFormData.isAnonymous
        };
        
        console.log('Updating Google Book review with data:', updateData);
        
        await GoogleBookFeedbackService.updateFeedback(review.id, updateData);
      } else {
        // This is a regular book review
        console.log('Updating regular book review');
        await FeedbackService.updateFeedback(review.id, {
          bookId: review.bookId || 0,
          rating: editFormData.rating,
          review: editFormData.review,
          isAnonymous: editFormData.isAnonymous
        });
      }
      
      console.log('Review update successful, refreshing list...');
      
      // Refresh the reviews list
      if (userId) {
        await fetchRecentReviews(parseInt(userId));
      }
      
      setEditingReview(null);
      console.log('Review save completed successfully');
    } catch (err: any) {
      console.error('Failed to update review:', err);
      console.error('Error details:', err?.response || err?.body || err?.message);
      setError(`Failed to update review: ${err?.message || err?.body?.message || 'Unknown error'}`);
    }
  };

  const cancelEditReview = () => {
    setEditingReview(null);
    setEditFormData({ rating: 5, review: '', isAnonymous: false });
  };

  const handleDeleteReview = (review: FeedbackResponse) => {
    setReviewToDelete(review);
    setShowDeleteDialog(true);
  };

  const confirmDeleteReview = async () => {
    if (!reviewToDelete?.id) {
      setError('Review ID not found');
      setShowDeleteDialog(false);
      setReviewToDelete(null);
      return;
    }

    try {
      setDeletingReview(reviewToDelete.id);
      
      // Determine if it's a Google Book review (bookId is null) or regular book review
      if (reviewToDelete.bookId === null || reviewToDelete.bookId === undefined) {
        // This is a Google Book review
        await GoogleBookFeedbackService.deleteFeedback(reviewToDelete.id);
      } else {
        // This is a regular book review
        await FeedbackService.deleteFeedback(reviewToDelete.id);
      }
      
      // Refresh the reviews list
      if (userId) {
        await fetchRecentReviews(parseInt(userId));
      }
    } catch (err: any) {
      console.error('Failed to delete review:', err);
      setError('Failed to delete review');
    } finally {
      setDeletingReview(null);
      setShowDeleteDialog(false);
      setReviewToDelete(null);
    }
  };

  const cancelDeleteReview = () => {
    setShowDeleteDialog(false);
    setReviewToDelete(null);
  };

  const fetchCurrentlyReadingBooks = async () => {
    try {
      setBooksLoading(true);
      const response = await UserBookListService.getCurrentlyReading();
      setCurrentlyReadingBooks(response || []);
    } catch (error) {
      console.error('Error fetching currently reading books:', error);
    } finally {
      setBooksLoading(false);
    }
  };

  const fetchReadBooks = async () => {
    try {
      setBooksLoading(true);
      const response = await UserBookListService.getRead();
      setReadBooks(response || []);
    } catch (error) {
      console.error('Error fetching read books:', error);
    } finally {
      setBooksLoading(false);
    }
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
              onClick={() => {
                setActiveTab(0);
                fetchCurrentlyReadingBooks();
              }}
            >
              Currently Reading
            </button>
            <button
              style={tabStyle(activeTab === 1)}
              onClick={() => {
                setActiveTab(1);
                fetchReadBooks();
              }}
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
              <div>
                <h3 style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '24px',
                  color: '#4B3F30',
                  marginBottom: '24px',
                  textAlign: 'center'
                }}>
                  Currently Reading ({currentlyReadingBooks.length} books)
                </h3>
                {booksLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div>Loading books...</div>
                  </div>
                ) : currentlyReadingBooks.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    color: '#6A5E4D',
                    fontSize: '16px',
                    padding: '40px'
                  }}>
                    <BookIcon style={{ color: '#8B7355', fontSize: '48px' }} />
                    <p style={{ marginTop: '8px' }}>No books currently being read</p>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '20px'
                  }}>
                    {currentlyReadingBooks.map((bookList) => {
                      const book = bookList.book || bookList.googleBook;
                      const coverUrl = bookList.book?.cover || bookList.googleBook?.coverUrl;
                      return (
                        <div key={bookList.id} style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          borderRadius: '12px',
                          padding: '16px',
                          border: '1px solid #E6D7C3',
                          boxShadow: '0 2px 8px rgba(75, 63, 48, 0.1)',
                          textAlign: 'center'
                        }}>
                          <div style={{
                            width: '120px',
                            height: '180px',
                            backgroundColor: '#f0f0f0',
                            borderRadius: '8px',
                            margin: '0 auto 12px',
                            backgroundImage: coverUrl ? `url(${coverUrl})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {!coverUrl && <BookIcon style={{ color: '#8B7355', fontSize: '40px' }} />}
                          </div>
                          <h4 style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#4B3F30',
                            marginBottom: '4px',
                            lineHeight: 1.3,
                            height: '36px',
                            overflow: 'hidden'
                          }}>
                            {book?.title}
                          </h4>
                          <p style={{
                            fontSize: '12px',
                            color: '#6A5E4D',
                            margin: 0
                          }}>
                            by {book?.authorName}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
            {activeTab === 1 && (
              <div>
                <h3 style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '24px',
                  color: '#4B3F30',
                  marginBottom: '24px',
                  textAlign: 'center'
                }}>
                  Read Books ({readBooks.length} books)
                </h3>
                {booksLoading ? (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <div>Loading books...</div>
                  </div>
                ) : readBooks.length === 0 ? (
                  <div style={{
                    textAlign: 'center',
                    color: '#6A5E4D',
                    fontSize: '16px',
                    padding: '40px'
                  }}>
                    <BookIcon style={{ color: '#8B7355', fontSize: '48px' }} />
                    <p style={{ marginTop: '8px' }}>No completed books yet</p>
                  </div>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '20px'
                  }}>
                    {readBooks.map((bookList) => {
                      const book = bookList.book || bookList.googleBook;
                      const coverUrl = bookList.book?.cover || bookList.googleBook?.coverUrl;
                      return (
                        <div key={bookList.id} style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.8)',
                          borderRadius: '12px',
                          padding: '16px',
                          border: '1px solid #E6D7C3',
                          boxShadow: '0 2px 8px rgba(75, 63, 48, 0.1)',
                          textAlign: 'center'
                        }}>
                          <div style={{
                            width: '120px',
                            height: '180px',
                            backgroundColor: '#f0f0f0',
                            borderRadius: '8px',
                            margin: '0 auto 12px',
                            backgroundImage: coverUrl ? `url(${coverUrl})` : 'none',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                          }}>
                            {!coverUrl && <BookIcon style={{ color: '#8B7355', fontSize: '40px' }} />}
                          </div>
                          <h4 style={{
                            fontSize: '14px',
                            fontWeight: 600,
                            color: '#4B3F30',
                            marginBottom: '4px',
                            lineHeight: 1.3,
                            height: '36px',
                            overflow: 'hidden'
                          }}>
                            {book?.title}
                          </h4>
                          <p style={{
                            fontSize: '12px',
                            color: '#6A5E4D',
                            margin: 0
                          }}>
                            by {book?.authorName}
                          </p>
                          {bookList.userRating && (
                            <div style={{ marginTop: '8px' }}>
                              <StarRating rating={bookList.userRating} size="small" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
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
                    All Reviews
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
                    maxHeight: '400px', // Fixed height container
                    overflowY: 'auto', // Enable vertical scrolling
                    paddingRight: '8px', // Space for scrollbar
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
                          boxShadow: '0 2px 8px rgba(75, 63, 48, 0.05)',
                          position: 'relative'
                        }}
                      >
                        {/* Action buttons for user's own reviews */}
                        {profile?.isOwnProfile && (
                          <div style={{
                            position: 'absolute',
                            top: '16px',
                            right: '16px',
                            display: 'flex',
                            gap: '8px'
                          }}>
                            <button
                              onClick={() => handleEditReview(review)}
                              disabled={editingReview === review.id}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '8px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(210, 105, 30, 0.1)',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(210, 105, 30, 0.2)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(210, 105, 30, 0.1)';
                              }}
                              title="Edit review"
                            >
                              <EditIcon 
                                style={{ 
                                  color: '#D2691E', 
                                  fontSize: '18px' 
                                }} 
                              />
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review)}
                              disabled={deletingReview === review.id}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '8px',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: 'rgba(220, 53, 69, 0.1)',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.2)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
                              }}
                              title="Delete review"
                            >
                              <DeleteIcon 
                                style={{ 
                                  color: '#dc3545', 
                                  fontSize: '18px' 
                                }} 
                              />
                            </button>
                          </div>
                        )}
                        
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
                              {editingReview === review.id ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '12px', color: '#6A5E4D' }}>Rating:</span>
                                  <select
                                    value={editFormData.rating}
                                    onChange={(e) => setEditFormData(prev => ({ ...prev, rating: Number(e.target.value) }))}
                                    style={{
                                      padding: '4px 8px',
                                      borderRadius: '4px',
                                      border: '1px solid #E6D7C3',
                                      fontSize: '12px',
                                      backgroundColor: 'white'
                                    }}
                                  >
                                    {[1, 2, 3, 4, 5].map(rating => (
                                      <option key={rating} value={rating}>
                                        {rating} star{rating !== 1 ? 's' : ''}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              ) : (
                                <StarRating 
                                  rating={review.rating || 0} 
                                  size="small" 
                                  color="#D2691E"
                                />
                              )}
                              <span style={{
                                color: '#6A5E4D',
                                fontSize: '12px'
                              }}>
                                {review.createdDate && new Date(review.createdDate).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        {editingReview === review.id ? (
                          <div style={{ marginTop: '12px' }}>
                            <textarea
                              value={editFormData.review}
                              onChange={(e) => setEditFormData(prev => ({ ...prev, review: e.target.value }))}
                              placeholder="Write your review..."
                              style={{
                                width: '100%',
                                minHeight: '80px',
                                padding: '12px',
                                borderRadius: '6px',
                                border: '1px solid #E6D7C3',
                                fontSize: '14px',
                                fontFamily: 'inherit',
                                resize: 'vertical',
                                backgroundColor: 'white'
                              }}
                            />
                            <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6A5E4D' }}>
                                <input
                                  type="checkbox"
                                  checked={editFormData.isAnonymous}
                                  onChange={(e) => setEditFormData(prev => ({ ...prev, isAnonymous: e.target.checked }))}
                                />
                                Post anonymously
                              </label>
                            </div>
                            <div style={{ marginTop: '12px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button
                                onClick={cancelEditReview}
                                style={{
                                  padding: '8px 16px',
                                  backgroundColor: 'transparent',
                                  border: '1px solid #6A5E4D',
                                  borderRadius: '4px',
                                  color: '#6A5E4D',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: 600
                                }}
                              >
                                <CloseIcon style={{ fontSize: '14px', marginRight: '4px' }} />
                                Cancel
                              </button>
                              <button
                                onClick={() => saveEditReview(review)}
                                style={{
                                  padding: '8px 16px',
                                  backgroundColor: '#D2691E',
                                  border: 'none',
                                  borderRadius: '4px',
                                  color: 'white',
                                  cursor: 'pointer',
                                  fontSize: '12px',
                                  fontWeight: 600
                                }}
                              >
                                <SaveIcon style={{ fontSize: '14px', marginRight: '4px' }} />
                                Save
                              </button>
                            </div>
                          </div>
                        ) : (
                          review.review && (
                            <p style={{
                              color: '#4B3F30',
                              fontSize: '14px',
                              lineHeight: 1.5,
                              margin: '0',
                              fontStyle: 'italic'
                            }}>
                              "{review.review}"
                            </p>
                          )
                        )}
                        
                        {/* Anonymous indicator */}
                        {review.isAnonymous && (
                          <div style={{
                            marginTop: '12px',
                            padding: '6px 10px',
                            backgroundColor: 'rgba(139, 115, 85, 0.1)',
                            borderRadius: '6px',
                            border: '1px solid rgba(139, 115, 85, 0.3)',
                            display: 'inline-block'
                          }}>
                            <span style={{
                              color: '#8B7355',
                              fontSize: '11px',
                              fontWeight: 600
                            }}>
                              🕶️ Posted anonymously
                            </span>
                          </div>
                        )}
                        
                        {/* "Your Review" indicator */}
                        {profile?.isOwnProfile && (
                          <div style={{
                            marginTop: '12px',
                            padding: '8px 12px',
                            backgroundColor: 'rgba(210, 105, 30, 0.1)',
                            borderRadius: '6px',
                            border: '1px solid rgba(210, 105, 30, 0.3)',
                            display: 'inline-block'
                          }}>
                            <span style={{
                              color: '#D2691E',
                              fontSize: '12px',
                              fontWeight: 600
                            }}>
                              📝 This is your review
                            </span>
                          </div>
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
                    <p>No reviews found in response</p>
                    <p style={{ fontSize: '14px', marginTop: '8px' }}>
                      Debug: recentReviews.length = {recentReviews.length}, reviewsCount = {profile.reviewsCount}
                    </p>
                    <p style={{ fontSize: '12px', marginTop: '8px', fontFamily: 'monospace' }}>
                      {JSON.stringify(recentReviews, null, 2)}
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

      {/* Custom Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '32px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
            border: '2px solid #E6D7C3'
          }}>
            <h3 style={{
              fontFamily: 'Playfair Display, serif',
              color: '#4B3F30',
              margin: '0 0 16px 0',
              fontSize: '22px'
            }}>
              Delete Review
            </h3>
            <p style={{
              color: '#6A5E4D',
              margin: '0 0 24px 0',
              lineHeight: 1.5
            }}>
              Are you sure you want to delete your review for "{reviewToDelete?.bookTitle}"? This action cannot be undone.
            </p>
            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={cancelDeleteReview}
                style={{
                  padding: '10px 20px',
                  backgroundColor: 'transparent',
                  border: '2px solid #6A5E4D',
                  borderRadius: '6px',
                  color: '#6A5E4D',
                  cursor: 'pointer',
                  fontWeight: 600,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#6A5E4D';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#6A5E4D';
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteReview}
                disabled={deletingReview === reviewToDelete?.id}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#dc3545',
                  border: 'none',
                  borderRadius: '6px',
                  color: 'white',
                  cursor: deletingReview === reviewToDelete?.id ? 'not-allowed' : 'pointer',
                  fontWeight: 600,
                  opacity: deletingReview === reviewToDelete?.id ? 0.7 : 1,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (deletingReview !== reviewToDelete?.id) {
                    e.currentTarget.style.backgroundColor = '#c82333';
                  }
                }}
                onMouseLeave={(e) => {
                  if (deletingReview !== reviewToDelete?.id) {
                    e.currentTarget.style.backgroundColor = '#dc3545';
                  }
                }}
              >
                {deletingReview === reviewToDelete?.id ? 'Deleting...' : 'Delete Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
