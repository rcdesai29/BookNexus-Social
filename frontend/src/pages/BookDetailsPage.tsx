import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  StarHalf as StarHalfIcon,
  Send as SendIcon,
  MenuBook as MenuBookIcon,
  ArrowBack as ArrowBackIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { GoogleBook } from '../hooks/useGoogleBooksSimple';
import { GoogleBookFeedbackService } from '../app/services/services/GoogleBookFeedbackService';
import { UserBookListService } from '../app/services/services/UserBookListService';
import { useAuth } from '../hooks/useAuth';
import ReviewThread from '../components/ReviewThread';
import { useGoogleBooksAPI } from '../hooks/useGoogleBooksAPI';
import { API_CONFIG } from '../config/api';

const BookDetailsPage: React.FC = () => {
  const { googleBookId } = useParams<{ googleBookId: string }>();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const { getBookById, loading: bookLoading } = useGoogleBooksAPI();

  // Responsive hook
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Responsive utilities
  const isMobile = windowSize.width <= 768;
  const isTablet = windowSize.width > 768 && windowSize.width <= 1024;
  const isDesktop = windowSize.width > 1024;

  // State
  const [book, setBook] = useState<GoogleBook | null>(null);
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState<any>(null);
  const [selectedShelf, setSelectedShelf] = useState<string>('want-to-read');
  const [isUpdatingShelf, setIsUpdatingShelf] = useState(false);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [ratingCount, setRatingCount] = useState<number>(0);
  const [allReviews, setAllReviews] = useState<any[]>([]);
  
  // Refs for auto-scroll and auto-focus
  const reviewFormRef = React.useRef<HTMLDivElement>(null);
  const reviewTextareaRef = React.useRef<HTMLTextAreaElement>(null);

  // Load book data on mount
  useEffect(() => {
    if (googleBookId) {
      loadBookData();
      fetchAverageRating();
      fetchAllReviews();
      if (isLoggedIn) {
        checkExistingFeedback();
      }
    }
  }, [googleBookId, isLoggedIn]);

  const loadBookData = async () => {
    try {
      if (!googleBookId) return;
      const bookData = await getBookById(googleBookId);
      setBook(bookData);
    } catch (error) {
      console.error('Failed to load book data:', error);
      setError('Failed to load book details');
    }
  };

  const fetchAverageRating = async () => {
    try {
      if (!googleBookId) return;
      const avgRating = await GoogleBookFeedbackService.getAverageRating(googleBookId);
      const count = await GoogleBookFeedbackService.getRatingCount(googleBookId);
      setAverageRating(avgRating);
      setRatingCount(count);
    } catch (error) {
      console.error('Failed to fetch rating data:', error);
    }
  };

  const fetchAllReviews = async () => {
    try {
      if (!googleBookId) return;
      const response = await fetch(`${API_CONFIG.BASE_URL}/google-books/feedback/${googleBookId}`);
      const reviews = await response.json();
      setAllReviews(reviews);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    }
  };

  const checkExistingFeedback = async () => {
    try {
      if (!googleBookId) return;
      const allFeedback = await GoogleBookFeedbackService.getFeedbackByGoogleBookId(googleBookId);
      const userFeedback = allFeedback.find(f => f.userId === 'current-user');
      if (userFeedback) {
        setExistingFeedback(userFeedback);
        setRating(userFeedback.rating || 0);
        setReview(userFeedback.review || '');
        setIsAnonymous(userFeedback.anonymous || false);
      }
    } catch (error) {
      console.error('No existing feedback found:', error);
    }
  };

  const handleSubmitReview = async () => {
    if (!book || !isLoggedIn || (!rating && !review.trim())) return;

    setSubmitting(true);
    setError(null);

    try {
      const feedbackRequest = {
        googleBookId: book.id,
        bookTitle: book.title,
        authorName: book.authorName,
        rating: rating || 0,
        review: review.trim() || '',
        isAnonymous
      };

      if (existingFeedback) {
        await GoogleBookFeedbackService.updateFeedback(existingFeedback.id, feedbackRequest);
      } else {
        await GoogleBookFeedbackService.saveFeedback(feedbackRequest);
      }

      setSuccess(true);
      setShowReviewForm(false);
      await fetchAverageRating();
      await fetchAllReviews();
      setTimeout(() => setSuccess(false), 3000);

    } catch (error: any) {
      setError(error.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShelfUpdate = async (newShelf: string) => {
    if (!book || !isLoggedIn) return;

    setIsUpdatingShelf(true);
    try {
      const listType = newShelf.toUpperCase().replace('-', '_') as 'CURRENTLY_READING' | 'TBR' | 'READ';
      await UserBookListService.addGoogleBookToList(book.id, listType);
      setSelectedShelf(newShelf);
    } catch (error) {
      console.error('Failed to update shelf:', error);
    } finally {
      setIsUpdatingShelf(false);
    }
  };

  const renderStars = (rating: number, size: 'small' | 'medium' = 'medium', interactive: boolean = false) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(
          <StarIcon 
            key={i} 
            sx={{ color: '#f39c12', fontSize: size === 'small' ? 16 : 20 }}
            onClick={interactive ? () => setRating(i) : undefined}
            style={interactive ? { cursor: 'pointer' } : {}}
          />
        );
      } else if (i === fullStars + 1 && hasHalfStar) {
        stars.push(
          <StarHalfIcon 
            key={i} 
            sx={{ color: '#f39c12', fontSize: size === 'small' ? 16 : 20 }}
            onClick={interactive ? () => setRating(i) : undefined}
            style={interactive ? { cursor: 'pointer' } : {}}
          />
        );
      } else {
        stars.push(
          <StarBorderIcon 
            key={i} 
            sx={{ color: '#ddd', fontSize: size === 'small' ? 16 : 20 }}
            onClick={interactive ? () => setRating(i) : undefined}
            style={interactive ? { cursor: 'pointer' } : {}}
          />
        );
      }
    }
    return stars;
  };

  if (bookLoading || !book) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #F4E3C1, #E6D7C3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <MenuBookIcon sx={{ fontSize: 48, color: '#8B7355', mb: 2 }} />
          <p style={{ color: '#4B3F30' }}>Loading book details...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #F4E3C1, #E6D7C3)',
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #E6D7C3',
        boxShadow: '0 2px 8px rgba(75, 63, 48, 0.1)'
      }}>
        <div className="max-w-7xl mx-auto" style={{ padding: isMobile ? '12px 16px' : '16px 24px' }}>
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate(-1)}
              style={{
                display: 'flex',
                alignItems: 'center',
                color: '#D2691E',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 500,
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(210, 105, 30, 0.1)';
                e.currentTarget.style.color = '#B85A1A';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#D2691E';
              }}
            >
              <ArrowBackIcon style={{ marginRight: '8px' }} />
              Back
            </button>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              color: '#8B7355',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(139, 115, 85, 0.1)';
              e.currentTarget.style.color = '#6A5E4D';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#8B7355';
            }}>
              <ShareIcon style={{ marginRight: '8px' }} />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto" style={{ padding: isMobile ? '16px' : isTablet ? '24px 20px' : '32px 24px' }}>
        <div style={{
          display: isMobile ? 'flex' : 'grid',
          flexDirection: isMobile ? 'column' : undefined,
          gridTemplateColumns: isMobile ? undefined : 'minmax(300px, 1fr) 2fr',
          gap: isMobile ? '16px' : '32px'
        }}>
          
          {/* Left Column - Book Cover and Actions */}
          <div>
            <div style={{ position: isMobile ? 'static' : 'sticky', top: isMobile ? 'auto' : '8px' }}>
              {/* Book Cover */}
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                padding: isMobile ? '16px' : '24px',
                borderRadius: '12px',
                border: '1px solid #E6D7C3',
                boxShadow: '0 4px 12px rgba(75, 63, 48, 0.1)',
                marginBottom: '24px'
              }}>
                <img
                  src={book.cover || '/api/placeholder/400/600'}
                  alt={book.title}
                  style={{
                    width: isMobile ? '60%' : '100%',
                    maxWidth: isMobile ? '200px' : '300px',
                    margin: '0 auto',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(75, 63, 48, 0.2)',
                    display: 'block'
                  }}
                />
              </div>

              {/* Action Buttons */}
              {isLoggedIn && (
                <div style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  padding: isMobile ? '16px' : '24px',
                  borderRadius: '12px',
                  border: '1px solid #E6D7C3',
                  boxShadow: '0 4px 12px rgba(75, 63, 48, 0.1)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#4B3F30',
                      marginBottom: '8px'
                    }}>
                      Add to shelf:
                    </label>
                    <select 
                      value={selectedShelf}
                      onChange={(e) => handleShelfUpdate(e.target.value)}
                      disabled={isUpdatingShelf}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '2px solid #E6D7C3',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#4B3F30',
                        backgroundColor: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="want-to-read">Want to Read</option>
                      <option value="currently-reading">Currently Reading</option>
                      <option value="read">Read</option>
                    </select>
                  </div>

                  <button
                    onClick={() => {
                      setShowReviewForm(!showReviewForm);
                      // Auto-scroll and focus after state update
                      setTimeout(() => {
                        if (!showReviewForm && reviewFormRef.current) {
                          reviewFormRef.current.scrollIntoView({ 
                            behavior: 'smooth', 
                            block: 'start' 
                          });
                          // Focus the textarea after scroll
                          setTimeout(() => {
                            if (reviewTextareaRef.current) {
                              reviewTextareaRef.current.focus();
                            }
                          }, 500);
                        }
                      }, 100);
                    }}
                    style={{
                      width: '100%',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      padding: '12px 16px',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1976D2'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2196F3'}
                  >
                    {existingFeedback ? 'Edit Review' : 'Write Review'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Book Info and Reviews */}
          <div>
            {/* Book Header */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              padding: isMobile ? '16px' : '32px',
              borderRadius: '12px',
              border: '1px solid #E6D7C3',
              boxShadow: '0 4px 12px rgba(75, 63, 48, 0.1)',
              marginBottom: '24px'
            }}>
              <div style={{ marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: '#8B7355' }}>Book #{book.id}</span>
              </div>
              <h1 style={{ 
                fontSize: isMobile ? '24px' : '32px', 
                fontWeight: 'bold', 
                color: '#4B3F30', 
                marginBottom: '8px',
                fontFamily: 'Playfair Display, serif'
              }}>
                {book.title}
              </h1>
              <p style={{ 
                fontSize: isMobile ? '16px' : '20px', 
                color: '#6A5E4D', 
                marginBottom: '16px'
              }}>
                by {book.authorName}
              </p>
              
              {/* Rating Display */}
              <div style={{ 
                display: 'flex', 
                alignItems: isMobile ? 'flex-start' : 'center',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '8px' : '16px', 
                marginBottom: '16px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  {renderStars(averageRating || 0)}
                  <span style={{ 
                    marginLeft: '8px', 
                    fontSize: isMobile ? '18px' : '24px', 
                    fontWeight: 'bold',
                    color: '#4B3F30'
                  }}>
                    {(averageRating || 0).toFixed(2)}
                  </span>
                </div>
                <div style={{ color: '#6A5E4D', fontSize: isMobile ? '14px' : '16px' }}>
                  {(ratingCount || 0).toLocaleString()} ratings · {allReviews.length} reviews
                </div>
              </div>

              {/* Book Description */}
              <div style={{ 
                maxWidth: 'none',
                marginBottom: '24px'
              }}>
                <p style={{ 
                  color: '#4B3F30', 
                  lineHeight: 1.6,
                  fontSize: '16px'
                }}>
                  {book.synopsis || 'No description available.'}
                </p>
              </div>

              {/* Book Details */}
              <div style={{
                paddingTop: '24px',
                borderTop: '1px solid #E6D7C3'
              }}>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: '16px',
                  fontSize: isMobile ? '12px' : '14px' 
                }}>
                  {book.isbn && (
                    <div>
                      <span style={{ fontWeight: 500, color: '#4B3F30' }}>ISBN:</span>{' '}
                      <span style={{ color: '#6A5E4D' }}>{book.isbn}</span>
                    </div>
                  )}
                  <div>
                    <span style={{ fontWeight: 500, color: '#4B3F30' }}>Google Books ID:</span>{' '}
                    <span style={{ color: '#6A5E4D' }}>{book.id}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Form */}
            {showReviewForm && isLoggedIn && (
              <div 
                ref={reviewFormRef}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(10px)',
                  padding: isMobile ? '16px' : '24px',
                  borderRadius: '12px',
                  border: '1px solid #E6D7C3',
                  boxShadow: '0 4px 12px rgba(75, 63, 48, 0.1)',
                  marginBottom: '24px'
                }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  marginBottom: '16px',
                  color: '#4B3F30'
                }}>
                  {existingFeedback ? 'Edit Your Review' : 'Write a Review'}
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#4B3F30',
                      marginBottom: '8px'
                    }}>
                      Your Rating:
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {renderStars(rating, 'medium', true)}
                      <span style={{ 
                        marginLeft: '8px', 
                        fontSize: '14px', 
                        color: '#6A5E4D' 
                      }}>
                        {rating > 0 ? `${rating} star${rating !== 1 ? 's' : ''}` : 'No rating'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#4B3F30',
                      marginBottom: '8px'
                    }}>
                      Your Review:
                    </label>
                    <textarea
                      ref={reviewTextareaRef}
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      rows={4}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '2px solid #E6D7C3',
                        borderRadius: '8px',
                        fontSize: '14px',
                        color: '#4B3F30',
                        resize: 'vertical'
                      }}
                      placeholder="Share your thoughts about this book..."
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox"
                      id="anonymous"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      style={{ marginRight: '8px' }}
                    />
                    <label htmlFor="anonymous" style={{ 
                      fontSize: '14px', 
                      color: '#4B3F30' 
                    }}>
                      Post anonymously
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      onClick={handleSubmitReview}
                      disabled={submitting || (!rating && !review.trim())}
                      style={{
                        backgroundColor: '#2196F3',
                        color: 'white',
                        padding: isMobile ? '6px 16px' : '8px 24px',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        opacity: (submitting || (!rating && !review.trim())) ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <SendIcon sx={{ fontSize: 16 }} />
                      {submitting ? 'Submitting...' : (existingFeedback ? 'Update' : 'Submit')}
                    </button>
                    <button
                      onClick={() => setShowReviewForm(false)}
                      style={{
                        backgroundColor: '#8B7355',
                        color: 'white',
                        padding: isMobile ? '6px 16px' : '8px 24px',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>

                {error && (
                  <div style={{
                    marginTop: '16px',
                    backgroundColor: 'rgba(244, 67, 54, 0.1)',
                    border: '1px solid rgba(244, 67, 54, 0.3)',
                    borderRadius: '8px',
                    padding: '12px'
                  }}>
                    <p style={{ color: '#d32f2f', fontSize: '14px', margin: 0 }}>{error}</p>
                  </div>
                )}

                {success && (
                  <div style={{
                    marginTop: '16px',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    border: '1px solid rgba(76, 175, 80, 0.3)',
                    borderRadius: '8px',
                    padding: '12px'
                  }}>
                    <p style={{ color: '#388e3c', fontSize: '14px', margin: 0 }}>Review submitted successfully!</p>
                  </div>
                )}
              </div>
            )}

            {/* Reviews Section */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #E6D7C3',
              boxShadow: '0 4px 12px rgba(75, 63, 48, 0.1)'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: 600,
                marginBottom: '24px',
                color: '#4B3F30'
              }}>
                Community Reviews
              </h3>
              
              {allReviews.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {allReviews.map((reviewData) => (
                    <ReviewThread
                      key={reviewData.id}
                      googleFeedbackId={reviewData.id}
                      reviewTitle={reviewData.bookTitle || book.title}
                      reviewAuthor={reviewData.displayName || 'Anonymous'}
                      reviewText={reviewData.review || ''}
                      reviewDate={reviewData.createdDate ? new Date(reviewData.createdDate).toLocaleDateString() : 'Unknown'}
                      reviewRating={reviewData.rating}
                      isOwnReview={false}
                      isReviewAnonymous={reviewData.anonymous || false}
                    />
                  ))}
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '32px 16px',
                  color: '#8B7355'
                }}>
                  <MenuBookIcon sx={{ fontSize: 48, color: '#E6D7C3', mb: 2 }} />
                  <p style={{ marginBottom: '16px', color: '#8B7355' }}>
                    No reviews yet. Be the first to share your thoughts!
                  </p>
                  {isLoggedIn && (
                    <button
                      onClick={() => {
                        setShowReviewForm(true);
                        // Auto-scroll and focus after state update
                        setTimeout(() => {
                          if (reviewFormRef.current) {
                            reviewFormRef.current.scrollIntoView({ 
                              behavior: 'smooth', 
                              block: 'start' 
                            });
                            // Focus the textarea after scroll
                            setTimeout(() => {
                              if (reviewTextareaRef.current) {
                                reviewTextareaRef.current.focus();
                              }
                            }, 500);
                          }
                        }, 100);
                      }}
                      style={{
                        backgroundColor: '#2196F3',
                        color: 'white',
                        padding: isMobile ? '6px 16px' : '8px 24px',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer'
                      }}
                    >
                      Write the first review
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailsPage;