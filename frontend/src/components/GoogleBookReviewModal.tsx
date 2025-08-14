import React, { useState } from 'react';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  StarHalf as StarHalfIcon,
  Close as CloseIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { GoogleBook } from '../hooks/useGoogleBooks';

interface GoogleBookReviewModalProps {
  book: GoogleBook | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (bookId: string, rating: number, review: string) => Promise<void>;
}

const GoogleBookReviewModal: React.FC<GoogleBookReviewModalProps> = ({
  book,
  isOpen,
  onClose,
  onSubmitReview
}) => {
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book || rating === 0 || !review.trim()) return;

    setSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await onSubmitReview(book.googleBookId, rating, review);
      setSuccess(true);
      setRating(0);
      setReview('');
      // Close modal after a short delay to show success message
      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1500);
    } catch (err: any) {
      setError(err?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (rating: number, interactive: boolean = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      let starIcon;
      if (i <= rating) {
        starIcon = <StarIcon style={{ color: '#FFD700', fontSize: '24px' }} />;
      } else if (i - 0.5 <= rating) {
        starIcon = <StarHalfIcon style={{ color: '#FFD700', fontSize: '24px' }} />;
      } else {
        starIcon = <StarBorderIcon style={{ color: '#D3D3D3', fontSize: '24px' }} />;
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
          onClick={() => {
            if (interactive) {
              setRating(i);
            }
          }}
        >
          {starIcon}
        </span>
      );
    }
    return stars;
  };

  if (!isOpen || !book) return null;

  const modalOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px'
  };

  const modalContentStyle: React.CSSProperties = {
    backgroundColor: '#FAF3E3',
    borderRadius: '16px',
    border: '1px solid #E6D7C3',
    boxShadow: '0 8px 32px rgba(75, 63, 48, 0.2)',
    maxWidth: '500px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    position: 'relative'
  };

  const headerStyle: React.CSSProperties = {
    background: 'linear-gradient(90deg, #4B3F30, #5D4A33, #4B3F30)',
    color: 'white',
    padding: '24px',
    borderRadius: '16px 16px 0 0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  };

  const closeButtonStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    transition: 'background-color 0.2s'
  };

  const contentStyle: React.CSSProperties = {
    padding: '24px'
  };

  const bookInfoStyle: React.CSSProperties = {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: '8px',
    border: '1px solid #E6D7C3'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px',
    border: '1px solid #E6D7C3',
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: 'inherit',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    resize: 'vertical',
    minHeight: '100px'
  };

  const submitButtonStyle: React.CSSProperties = {
    backgroundColor: '#D2691E',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    padding: '12px 24px',
    fontSize: '16px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    width: '100%',
    justifyContent: 'center'
  };

  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <div>
            <h2 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '24px',
              fontWeight: 600,
              margin: 0,
              marginBottom: '4px'
            }}>
              Rate & Review
            </h2>
            <p style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.9)',
              margin: 0
            }}>
              Share your thoughts about this book
            </p>
          </div>
          <button
            style={closeButtonStyle}
            onClick={onClose}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <CloseIcon />
          </button>
        </div>

        {/* Content */}
        <div style={contentStyle}>
          {/* Book Info */}
          <div style={bookInfoStyle}>
            {book.cover ? (
              <img
                src={book.cover}
                alt={book.title}
                style={{
                  width: '80px',
                  height: '120px',
                  objectFit: 'cover',
                  borderRadius: '6px'
                }}
              />
            ) : (
              <div style={{
                width: '80px',
                height: '120px',
                background: 'linear-gradient(135deg, #F4E3C1, #E6D7C3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px'
              }}>
                <span style={{ color: '#8B7355', fontSize: '24px' }}>📚</span>
              </div>
            )}
            <div style={{ flex: 1 }}>
              <h3 style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '18px',
                fontWeight: 600,
                color: '#4B3F30',
                margin: '0 0 8px 0',
                lineHeight: 1.3
              }}>
                {book.title}
              </h3>
              <p style={{
                color: '#6A5E4D',
                fontSize: '14px',
                margin: '0 0 8px 0'
              }}>
                by {book.authorName}
              </p>
              {book.averageRating > 0 && book.ratingsCount >= 10 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {renderStars(book.averageRating)}
                  <span style={{ color: '#6A5E4D', fontSize: '12px' }}>
                    ({book.ratingsCount} ratings)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Review Form */}
          <form onSubmit={handleSubmit}>
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
                {renderStars(rating, true)}
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
                style={inputStyle}
                required
              />
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

            {/* Submit Button */}
            <button
              type="submit"
              style={submitButtonStyle}
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
                  Submit Review
                </>
              )}
            </button>
          </form>
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

export default GoogleBookReviewModal;
