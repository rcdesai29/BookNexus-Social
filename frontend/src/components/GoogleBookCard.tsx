import React, { useState } from 'react';
import {
  MenuBook as MenuBookIcon,
  RateReview as ReviewIcon
} from '@mui/icons-material';
import { GoogleBook } from '../hooks/useGoogleBooksSimple';
import StarRating from './StarRating';
import { tokenService } from '../services/tokenService';

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

        {showRating && (
          <div style={{ marginBottom: isSmall ? '8px' : '12px' }}>
            <StarRating 
              rating={book.averageRating} 
              showCount={true}
              count={book.ratingsCount}
              size={isSmall ? "small" : "medium"}
            />
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
{tokenService.isLoggedIn() 
              ? (book.averageRating > 0 && book.ratingsCount >= 10 ? 'Add Review' : 'Rate & Review')
              : 'Sign in to Review'}
          </button>
        )}
      </div>
    </div>
  );
};

export default GoogleBookCard;
