import React from 'react';
import {
  Close as CloseIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  StarHalf as StarHalfIcon
} from '@mui/icons-material';
import { GoogleBook } from '../hooks/useGoogleBooksSimple';

interface GoogleBookDetailsModalProps {
  book: GoogleBook | null;
  isOpen: boolean;
  onClose: () => void;
}

const GoogleBookDetailsModal: React.FC<GoogleBookDetailsModalProps> = ({
  book,
  isOpen,
  onClose
}) => {
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      let starIcon;
      if (i <= rating) {
        starIcon = <StarIcon style={{ color: '#FFD700', fontSize: '18px' }} />;
      } else if (i - 0.5 <= rating) {
        starIcon = <StarHalfIcon style={{ color: '#FFD700', fontSize: '18px' }} />;
      } else {
        starIcon = <StarBorderIcon style={{ color: '#D3D3D3', fontSize: '18px' }} />;
      }
      stars.push(<span key={i}>{starIcon}</span>);
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
    maxWidth: '600px',
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

  const truncateDescription = (text: string, maxLength: number = 500) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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
                  <span style={{ color: '#8B7355', fontSize: '12px', textAlign: 'center' }}>
                    No Cover<br />Available
                  </span>
                </div>
              )}
            </div>
            
            {/* Book Info */}
            <div style={{ flex: 1 }}>
              {book.averageRating > 0 && (
                <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ display: 'flex' }}>
                    {renderStars(book.averageRating)}
                  </div>
                  <span style={{ fontSize: '14px', color: '#666' }}>
                    {book.averageRating.toFixed(1)} ({book.ratingsCount || 0} ratings)
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
              
              {book.categories && book.categories.length > 0 && (
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
          
          {/* Description */}
          {book.synopsis && book.synopsis !== 'No description available.' && (
            <div>
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
        </div>
      </div>
    </div>
  );
};

export default GoogleBookDetailsModal;