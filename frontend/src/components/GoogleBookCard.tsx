import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  StarHalf as StarHalfIcon,
  MenuBook as MenuBookIcon,
  RateReview as ReviewIcon
} from '@mui/icons-material';
import { GoogleBook } from '../hooks/useGoogleBooks';

interface GoogleBookCardProps {
  book: GoogleBook;
  showRating?: boolean;
  showReviewButton?: boolean;
  onReviewClick?: (book: GoogleBook) => void;
  style?: React.CSSProperties;
}

const GoogleBookCard: React.FC<GoogleBookCardProps> = ({
  book,
  showRating = true,
  showReviewButton = true,
  onReviewClick,
  style = {}
}) => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const isSmall = style.padding === '12px';

  const renderBookCover = () => {
    const coverHeight = isSmall ? '140px' : '192px';
    const iconSize = isSmall ? '32px' : '48px';
    
    if (book.cover) {
      return (
        <img
          src={book.cover}
          alt={book.title}
          style={{
            width: '100%',
            height: coverHeight,
            objectFit: 'cover',
            borderRadius: '8px',
            marginBottom: isSmall ? '8px' : '16px'
          }}
        />
      );
    }
    return (
      <div style={{
        width: '100%',
        height: coverHeight,
        background: 'linear-gradient(135deg, #F4E3C1, #E6D7C3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        marginBottom: isSmall ? '8px' : '16px'
      }}>
        <MenuBookIcon style={{ color: '#8B7355', fontSize: iconSize }} />
      </div>
    );
  };

  const renderStars = (rating: number) => {
    const starSize = isSmall ? '12px' : '16px';
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarIcon
          key={`full-${i}`}
          style={{ color: '#FFD700', fontSize: starSize }}
        />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <StarHalfIcon
          key="half"
          style={{ color: '#FFD700', fontSize: starSize }}
        />
      );
    }

    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <StarBorderIcon
          key={`empty-${i}`}
          style={{ color: '#D3D3D3', fontSize: starSize }}
        />
      );
    }

    return stars;
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #E6D7C3',
    boxShadow: isHovered 
      ? '0 8px 25px rgba(75, 63, 48, 0.15)' 
      : '0 4px 12px rgba(75, 63, 48, 0.1)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    height: '100%',
    ...style
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: '#D2691E',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    width: '100%',
    justifyContent: 'center'
  };

  const handleCardClick = () => {
    // Navigate to a special Google Book detail page or show modal
    if (onReviewClick) {
      onReviewClick(book);
    } else {
      // For now, we'll show the book in a modal or navigate to a special page
      console.log('Google Book clicked:', book);
    }
  };

  const handleReviewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReviewClick) {
      onReviewClick(book);
    }
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {renderBookCover()}
      
      <div>
        <h4 style={{
          fontFamily: 'Playfair Display, serif',
          fontSize: isSmall ? '11px' : '14px',
          fontWeight: 600,
          color: '#4B3F30',
          marginBottom: isSmall ? '4px' : '8px',
          lineHeight: 1.3,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          minHeight: isSmall ? '28px' : '36px'
        }}>
          {book.title}
        </h4>
        
        <p style={{
          color: '#6A5E4D',
          marginBottom: isSmall ? '4px' : '8px',
          fontSize: isSmall ? '10px' : '12px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          by {book.authorName}
        </p>

        {showRating && book.averageRating > 0 && book.ratingsCount >= 10 && (
          <div style={{ marginBottom: isSmall ? '8px' : '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px', marginBottom: '2px' }}>
              {renderStars(book.averageRating)}
              <span style={{ 
                color: '#6A5E4D', 
                fontSize: isSmall ? '9px' : '12px', 
                marginLeft: '2px' 
              }}>
                ({book.ratingsCount})
              </span>
            </div>
            <div style={{ 
              color: '#4B3F30', 
              fontSize: isSmall ? '9px' : '12px', 
              fontWeight: 500 
            }}>
              {book.averageRating.toFixed(1)} out of 5
            </div>
          </div>
        )}
        
        {/* Debug info - remove this after testing */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{ 
            fontSize: '8px', 
            color: '#999', 
            marginTop: '4px',
            fontFamily: 'monospace'
          }}>
            Rating: {book.averageRating}, Count: {book.ratingsCount}
          </div>
        )}

        {showReviewButton && (
          <button
            style={buttonStyle}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#B85A1A'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#D2691E'}
            onClick={handleReviewClick}
          >
            <ReviewIcon style={{ fontSize: '14px' }} />
            {book.averageRating > 0 && book.ratingsCount >= 10 ? 'Add Review' : 'Rate & Review'}
          </button>
        )}
      </div>
    </div>
  );
};

export default GoogleBookCard;
