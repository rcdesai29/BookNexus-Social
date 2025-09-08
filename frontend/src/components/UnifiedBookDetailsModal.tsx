import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Close as CloseIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  StarHalf as StarHalfIcon,
  Send as SendIcon,
  MenuBook as MenuBookIcon,
  OpenInNew as OpenInNewIcon
} from '@mui/icons-material';
import { GoogleBook } from '../hooks/useGoogleBooksSimple';
import { GoogleBookFeedbackService } from '../app/services/services/GoogleBookFeedbackService';
import { UserBookListService } from '../app/services/services/UserBookListService';
import { useAuth } from '../hooks/useAuth';
import ReviewThread from './ReviewThread';

interface UnifiedBookDetailsModalProps {
  book: GoogleBook | null;
  isOpen: boolean;
  onClose: () => void;
  context?: 'discovery' | 'library'; // To show different action buttons
  existingUserRating?: number;
  existingUserReview?: string;
  userBookListData?: any; // Full UserBookList object for progress and other data
  onBookMoved?: () => void; // Callback when book is moved to different shelf
  onRatingUpdated?: (newRating: number, newCount: number) => void; // Callback when rating is updated
}

const UnifiedBookDetailsModal: React.FC<UnifiedBookDetailsModalProps> = ({
  book,
  isOpen,
  onClose,
  context = 'discovery',
  existingUserRating,
  existingUserReview,
  userBookListData,
  onBookMoved,
  onRatingUpdated
}) => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState<any>(null);
  const [progress, setProgress] = useState<number>(0);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [progressError, setProgressError] = useState<string | null>(null);
  const [progressSuccess, setProgressSuccess] = useState(false);
  const [bookMoved, setBookMoved] = useState(false);
  const [updatedRating, setUpdatedRating] = useState<number | null>(null);
  const [updatedRatingCount, setUpdatedRatingCount] = useState<number | null>(null);
  const [allUserReviews, setAllUserReviews] = useState<any[]>([]);

  useEffect(() => {
    if (book && isOpen) {
      // Load existing user feedback if provided
      setRating(existingUserRating || 0);
      setReview(existingUserReview || '');
      
      // Load reading progress if available
      setProgress(userBookListData?.readingProgress || 0);
      
      if (isLoggedIn) {
        loadExistingFeedback();
      }
    }
  }, [book, isOpen, isLoggedIn, existingUserRating, existingUserReview, userBookListData]);

  const loadExistingFeedback = async () => {
    if (!book?.googleBookId) return;
    
    try {
      // Get all feedback for this book to find user's review
      const allFeedback = await GoogleBookFeedbackService.getFeedbackByGoogleBookId(book.googleBookId);
      
      // Also get updated rating data
      const [averageRating, ratingCount] = await Promise.all([
        GoogleBookFeedbackService.getAverageRating(book.googleBookId),
        GoogleBookFeedbackService.getRatingCount(book.googleBookId)
      ]);
      
      setUpdatedRating(averageRating);
      setUpdatedRatingCount(ratingCount);
      setAllUserReviews(allFeedback || []);
      
      // Find the current user's feedback (this would need user ID matching)
      // For now, use the provided existing feedback or the most recent one
      setExistingFeedback({
        rating: existingUserRating,
        review: existingUserReview
      });
    } catch (error) {
      console.error('Failed to load existing feedback:', error);
      // Fallback to provided props
      setExistingFeedback({
        rating: existingUserRating,
        review: existingUserReview
      });
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book || rating === 0 || !review.trim()) return;

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await GoogleBookFeedbackService.saveFeedback({
        googleBookId: book.googleBookId,
        bookTitle: book.title,
        authorName: book.authorName,
        rating: rating,
        review: review,
        isAnonymous: isAnonymous
      });
      
      setSuccess(true);
      setShowReviewForm(false);
      
      // Update local feedback state immediately
      setExistingFeedback({
        rating: rating,
        review: review
      });
      
      // Reset form
      setRating(0);
      setReview('');
      setIsAnonymous(false);
      
      // Reload feedback and rating data from server
      setTimeout(async () => {
        await loadExistingFeedback();
        setSuccess(false);
        
        // Notify parent component of updated rating if callback provided
        if (onRatingUpdated && updatedRating !== null && updatedRatingCount !== null) {
          onRatingUpdated(updatedRating, updatedRatingCount);
        }
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProgress = async (newProgress: number) => {
    if (!book?.googleBookId || !isLoggedIn || newProgress < 0 || newProgress > 100) return;
    
    setIsUpdatingProgress(true);
    setProgressError(null);
    setProgressSuccess(false);
    
    try {
      await UserBookListService.updateReadingProgress(book.googleBookId, newProgress);
      setProgress(newProgress);
      
      // If progress reached 100%, the book was automatically moved to Read
      if (newProgress === 100) {
        setBookMoved(true);
        setProgressSuccess(true);
        // Notify parent component that the book was moved
        if (onBookMoved) {
          onBookMoved();
        }
        // Auto-close modal after a short delay
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setProgressSuccess(true);
        setTimeout(() => setProgressSuccess(false), 2000);
      }
    } catch (err: any) {
      setProgressError(err?.message || 'Failed to update progress');
      setTimeout(() => setProgressError(null), 3000);
    } finally {
      setIsUpdatingProgress(false);
    }
  };

  const handleSeeFullPage = () => {
    if (book?.googleBookId || book?.id) {
      const bookId = book.googleBookId || book.id;
      navigate(`/book/${bookId}`);
      onClose(); // Close the modal when navigating to full page
    }
  };

  const renderStars = (rating: number, interactive: boolean = false, size: string = '18px') => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      let starIcon;
      if (i <= rating) {
        starIcon = <StarIcon style={{ color: '#FFD700', fontSize: size }} />;
      } else if (i - 0.5 <= rating) {
        starIcon = <StarHalfIcon style={{ color: '#FFD700', fontSize: size }} />;
      } else {
        starIcon = <StarBorderIcon style={{ color: '#D3D3D3', fontSize: size }} />;
      }

      stars.push(
        <span
          key={i}
          style={{
            cursor: interactive ? 'pointer' : 'default',
            transition: 'transform 0.1s'
          }}
          onMouseOver={(e) => {
            if (interactive) {
              e.currentTarget.style.transform = 'scale(1.1)';
            }
          }}
          onMouseOut={(e) => {
            if (interactive) {
              e.currentTarget.style.transform = 'scale(1)';
            }
          }}
          onClick={(e) => {
            if (interactive) {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const starWidth = rect.width;
              
              if (clickX < starWidth / 2) {
                setRating(i - 0.5);
              } else {
                setRating(i);
              }
            }
          }}
        >
          {starIcon}
        </span>
      );
    }
    return stars;
  };

  const truncateDescription = (text: string, maxLength: number = 500) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (!isOpen || !book) return null;

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
    maxWidth: '700px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
    border: '1px solid rgba(230, 215, 195, 0.3)',
    position: 'relative'
  };

  const headerStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #8B4513, #A0522D)',
    color: '#FFF8DC',
    padding: '24px',
    borderRadius: '16px 16px 0 0',
    position: 'relative'
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

  const bodyStyle: React.CSSProperties = {
    padding: '24px',
    color: '#4B3F3A'
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: '#D2691E',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginRight: '12px',
    marginBottom: '12px'
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <button 
            style={closeButtonStyle}
            onClick={onClose}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
          >
            <CloseIcon style={{ fontSize: '18px' }} />
          </button>
          <h2 style={{ margin: '0 40px 8px 0', fontSize: '24px', lineHeight: '1.3' }}>
            {book.title}
          </h2>
          <p style={{ margin: '0', fontSize: '16px', opacity: 0.9 }}>
            by {book.authorName}
          </p>
        </div>
        
        <div style={bodyStyle}>
          <div style={{ display: 'flex', gap: '24px', marginBottom: '24px' }}>
            {/* Book Cover */}
            <div style={{ flexShrink: 0 }}>
              {book.cover ? (
                <img
                  src={book.cover}
                  alt={book.title}
                  style={{
                    width: '120px',
                    height: '180px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                  }}
                />
              ) : (
                <div style={{
                  width: '120px',
                  height: '180px',
                  background: 'linear-gradient(135deg, #F4E3C1, #E6D7C3)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
                }}>
                  <MenuBookIcon style={{ color: '#8B7355', fontSize: '48px' }} />
                </div>
              )}
            </div>
            
            {/* Book Info */}
            <div style={{ flex: 1 }}>
              {(updatedRating ?? book.averageRating) > 0 && (
                <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex' }}>
                    {renderStars(updatedRating ?? book.averageRating)}
                  </div>
                  <span style={{ fontSize: '14px', color: '#666' }}>
                    {(updatedRating ?? book.averageRating).toFixed(1)} ({(updatedRatingCount ?? book.ratingsCount) || 0} ratings)
                  </span>
                </div>
              )}
              
              {book.publishedDate && (
                <p style={{ margin: '8px 0', fontSize: '14px' }}>
                  <strong>Published:</strong> {book.publishedDate}
                </p>
              )}
              
              {book.pageCount && (
                <p style={{ margin: '8px 0', fontSize: '14px' }}>
                  <strong>Pages:</strong> {book.pageCount.toLocaleString()}
                </p>
              )}
              
              {book.categories && Array.isArray(book.categories) && book.categories.length > 0 && (
                <p style={{ margin: '8px 0', fontSize: '14px' }}>
                  <strong>Categories:</strong> {book.categories.join(', ')}
                </p>
              )}
              
              {book.isbn && (
                <p style={{ margin: '8px 0', fontSize: '14px' }}>
                  <strong>ISBN:</strong> {book.isbn}
                </p>
              )}
            </div>
          </div>
          
          {/* See Full Page Button */}
          <div style={{ marginBottom: '24px', textAlign: 'center' }}>
            <button
              style={{
                backgroundColor: 'transparent',
                color: '#8B4513',
                border: '2px solid #8B4513',
                borderRadius: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#8B4513';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 69, 19, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#8B4513';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              onClick={handleSeeFullPage}
            >
              <OpenInNewIcon style={{ fontSize: '16px' }} />
              See Full Page
            </button>
          </div>
          
          {/* Reading Progress Section - Only for Currently Reading books */}
          {isLoggedIn && userBookListData && userBookListData.listType === 'CURRENTLY_READING' && (
            <div style={{ marginBottom: '24px', borderTop: '1px solid #E6D7C3', paddingTop: '24px' }}>
              <h3 style={{ marginBottom: '16px', color: '#8B4513', fontSize: '18px' }}>
                Reading Progress
              </h3>
              
              <div style={{ marginBottom: '16px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{ color: '#6A5E4D', fontSize: '14px' }}>Progress</span>
                  <span style={{ color: '#4B3F30', fontSize: '14px', fontWeight: 500 }}>
                    {progress}%
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div style={{
                  width: '100%',
                  backgroundColor: '#F4E3C1',
                  borderRadius: '8px',
                  height: '12px',
                  position: 'relative',
                  cursor: 'pointer'
                }} onClick={(e) => {
                  if (isUpdatingProgress) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clickX = e.clientX - rect.left;
                  const newProgress = Math.round((clickX / rect.width) * 100);
                  handleUpdateProgress(Math.max(0, Math.min(100, newProgress)));
                }}>
                  <div style={{
                    backgroundColor: '#FF9800',
                    height: '12px',
                    borderRadius: '8px',
                    width: `${progress}%`,
                    transition: 'width 0.3s ease',
                    position: 'relative'
                  }}>
                    {/* Progress Handle */}
                    <div style={{
                      position: 'absolute',
                      right: '-6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '12px',
                      height: '12px',
                      backgroundColor: '#FF9800',
                      border: '2px solid white',
                      borderRadius: '50%',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }} />
                  </div>
                </div>
                
                <p style={{
                  color: '#8B7355',
                  fontSize: '12px',
                  marginTop: '8px',
                  fontStyle: 'italic'
                }}>
                  Click on the progress bar to update your reading progress
                </p>
              </div>

              {/* Quick Progress Buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {[25, 50, 75, 100].map(percent => (
                  <button
                    key={percent}
                    onClick={() => handleUpdateProgress(percent)}
                    disabled={isUpdatingProgress || progress === percent}
                    style={{
                      backgroundColor: progress === percent ? '#D2691E' : 'transparent',
                      color: progress === percent ? 'white' : '#D2691E',
                      border: '1px solid #D2691E',
                      borderRadius: '6px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: isUpdatingProgress || progress === percent ? 'default' : 'pointer',
                      transition: 'all 0.2s',
                      opacity: isUpdatingProgress ? 0.5 : 1
                    }}
                    onMouseOver={(e) => {
                      if (!isUpdatingProgress && progress !== percent) {
                        e.currentTarget.style.backgroundColor = '#D2691E';
                        e.currentTarget.style.color = 'white';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (progress !== percent) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#D2691E';
                      }
                    }}
                  >
                    {percent}%
                  </button>
                ))}
              </div>

              {/* Progress Messages */}
              {progressError && (
                <div style={{
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  marginBottom: '8px'
                }}>
                  {progressError}
                </div>
              )}

              {progressSuccess && (
                <div style={{
                  backgroundColor: '#D1FAE5',
                  color: '#065F46',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  marginBottom: '8px'
                }}>
                  {bookMoved ? 
                    '🎉 Congratulations! Book completed and moved to Read shelf!' : 
                    'Progress updated successfully!'
                  }
                </div>
              )}
            </div>
          )}
          
          {/* Description */}
          {book.synopsis && book.synopsis !== 'No description available.' && (
            <div style={{ marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '12px', color: '#8B4513', fontSize: '18px' }}>
                Description
              </h3>
              <p style={{ 
                lineHeight: '1.6', 
                margin: '0',
                fontSize: '14px',
                color: '#555'
              }}>
                {truncateDescription(book.synopsis)}
              </p>
            </div>
          )}

          {/* Existing User Review */}
          {isLoggedIn && existingFeedback && (existingFeedback.rating || existingFeedback.review) && (
            <div style={{ borderTop: '1px solid #E6D7C3', paddingTop: '24px', marginBottom: '24px' }}>
              <h3 style={{ marginBottom: '16px', color: '#8B4513', fontSize: '18px' }}>
                Your Review
              </h3>
              
              {existingFeedback.rating && (
                <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#666', marginRight: '8px' }}>Your Rating:</span>
                  <div style={{ display: 'flex' }}>
                    {renderStars(existingFeedback.rating)}
                  </div>
                  <span style={{ fontSize: '14px', color: '#666' }}>
                    {existingFeedback.rating}/5
                  </span>
                </div>
              )}
              
              {existingFeedback.review && (
                <div style={{
                  backgroundColor: '#F9F7F4',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #E6D7C3',
                  marginBottom: '16px'
                }}>
                  <p style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#4B3F30',
                    margin: 0
                  }}>
                    "{existingFeedback.review}"
                  </p>
                </div>
              )}
              
              <button
                style={{
                  backgroundColor: 'transparent',
                  color: '#D2691E',
                  border: '1px solid #D2691E',
                  borderRadius: '8px',
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
                onClick={() => {
                  setShowReviewForm(true);
                  setRating(existingFeedback.rating || 0);
                  setReview(existingFeedback.review || '');
                }}
              >
                Edit Review
              </button>
            </div>
          )}

          {/* Review Section */}
          {isLoggedIn && (
            <div style={{ borderTop: '1px solid #E6D7C3', paddingTop: '24px' }}>
              <h3 style={{ marginBottom: '16px', color: '#8B4513', fontSize: '18px' }}>
                {existingFeedback && (existingFeedback.rating || existingFeedback.review) ? 'Update Review' : 'Rate & Review'}
              </h3>
              
              {!showReviewForm ? (
                <div>
                  <button
                    style={buttonStyle}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#B85A1A'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#D2691E'}
                    onClick={() => {
                      setShowReviewForm(true);
                      // Pre-populate form with existing review if it exists
                      if (existingFeedback) {
                        setRating(existingFeedback.rating || 0);
                        setReview(existingFeedback.review || '');
                      }
                    }}
                  >
                    {existingFeedback && (existingFeedback.rating || existingFeedback.review) ? 'Edit Review' : 'Write a Review'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview}>
                  {/* Rating */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'block',
                      color: '#4B3F30',
                      fontSize: '16px',
                      fontWeight: 500,
                      marginBottom: '12px'
                    }}>
                      Your Rating *
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {renderStars(rating, true, '24px')}
                      <span style={{ color: '#6A5E4D', fontSize: '14px', marginLeft: '8px' }}>
                        {rating > 0 ? `${rating} out of 5` : 'Select rating'}
                      </span>
                    </div>
                  </div>

                  {/* Review Text */}
                  <div style={{ marginBottom: '24px' }}>
                    <label style={{
                      display: 'block',
                      color: '#4B3F30',
                      fontSize: '16px',
                      fontWeight: 500,
                      marginBottom: '12px'
                    }}>
                      Your Review *
                    </label>
                    <textarea
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder="Share your thoughts about this book..."
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: '1px solid #E6D7C3',
                        borderRadius: '8px',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        backgroundColor: 'rgba(255, 255, 255, 0.8)',
                        resize: 'vertical',
                        minHeight: '100px'
                      }}
                      required
                    />
                  </div>

                  {/* Anonymous checkbox */}
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      cursor: 'pointer',
                      color: '#4B3F30',
                      fontSize: '14px'
                    }}>
                      <input
                        type="checkbox"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        style={{
                          accentColor: '#D2691E',
                          cursor: 'pointer'
                        }}
                      />
                      Post anonymously
                    </label>
                  </div>

                  {/* Error/Success Messages */}
                  {error && (
                    <div style={{
                      backgroundColor: '#FEE2E2',
                      color: '#DC2626',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      fontSize: '14px'
                    }}>
                      {error}
                    </div>
                  )}

                  {success && (
                    <div style={{
                      backgroundColor: '#D1FAE5',
                      color: '#065F46',
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      fontSize: '14px'
                    }}>
                      Review submitted successfully!
                    </div>
                  )}

                  {/* Form Buttons */}
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                      type="submit"
                      style={{
                        ...buttonStyle,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                      disabled={submitting || rating === 0 || !review.trim()}
                      onMouseOver={(e) => {
                        if (!submitting && rating > 0 && review.trim()) {
                          e.currentTarget.style.backgroundColor = '#B85A1A';
                        }
                      }}
                      onMouseOut={(e) => {
                        if (!submitting && rating > 0 && review.trim()) {
                          e.currentTarget.style.backgroundColor = '#D2691E';
                        }
                      }}
                    >
                      {submitting ? (
                        <>
                          <div style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid transparent',
                            borderTop: '2px solid white',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }} />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <SendIcon style={{ fontSize: '16px' }} />
                          {existingFeedback && (existingFeedback.rating || existingFeedback.review) ? 'Update Review' : 'Submit Review'}
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => {
                        setShowReviewForm(false);
                        setRating(0);
                        setReview('');
                        setIsAnonymous(false);
                        setError(null);
                      }}
                      style={{
                        backgroundColor: 'transparent',
                        color: '#D2691E',
                        border: '1px solid #D2691E',
                        borderRadius: '8px',
                        padding: '12px 24px',
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
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* All User Reviews Section with Threading */}
          {allUserReviews && allUserReviews.length > 0 && (
            <div style={{ borderTop: '1px solid #E6D7C3', paddingTop: '24px', marginTop: '24px' }}>
              <h3 style={{ marginBottom: '16px', color: '#8B4513', fontSize: '18px' }}>
                User Reviews ({allUserReviews.length})
              </h3>
              
              <div 
                className="reviews-scroll-container"
                style={{ 
                  maxHeight: '400px', 
                  overflowY: 'auto',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#D2691E #F4E3C1'
                }}
              >
                {allUserReviews.map((review, index) => (
                  <ReviewThread
                    key={`${review.id || index}-${review.googleFeedbackId || 'local'}`}
                    feedbackId={review.id}
                    googleFeedbackId={review.googleFeedbackId}
                    reviewTitle={book?.title || 'Book Review'}
                    reviewAuthor={review.displayName || 'Anonymous User'}
                    reviewText={review.review || ''}
                    reviewDate={review.createdDate ? new Date(review.createdDate).toLocaleDateString() : ''}
                    reviewRating={review.rating}
                    isOwnReview={review.ownReview || false}
                    isReviewAnonymous={review.isAnonymous || false}
                  />
                ))}
              </div>
              {allUserReviews.length > 2 && (
                <p style={{
                  color: '#8B7355',
                  fontSize: '12px',
                  marginTop: '8px',
                  fontStyle: 'italic',
                  textAlign: 'center'
                }}>
                  ↑↓ Scroll to see more reviews
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .reviews-scroll-container::-webkit-scrollbar {
          width: 8px;
        }
        .reviews-scroll-container::-webkit-scrollbar-track {
          background: #F4E3C1;
          border-radius: 4px;
        }
        .reviews-scroll-container::-webkit-scrollbar-thumb {
          background: #D2691E;
          border-radius: 4px;
        }
        .reviews-scroll-container::-webkit-scrollbar-thumb:hover {
          background: #B85A1A;
        }
      `}</style>
    </div>
  );
};

export default UnifiedBookDetailsModal;