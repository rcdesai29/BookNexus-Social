import React, { useState } from 'react';
import {
  MenuBook as MenuBookIcon
} from '@mui/icons-material';
import { GoogleBook } from '../hooks/useGoogleBooksSimple';
import StarRating from './StarRating';
import { useAuth } from '../hooks/useAuth';

interface GoogleBookCardProps {
  book: GoogleBook;
  showRating?: boolean;
  showReviewButton?: boolean;
  onReviewClick?: (book: GoogleBook) => void;
  onAddToUserList?: (googleBookId: string, listType: 'FAVORITE' | 'CURRENTLY_READING' | 'TBR' | 'READ') => void;
  onViewDetails?: (book: GoogleBook) => void;
  style?: React.CSSProperties;
}

const GoogleBookCard: React.FC<GoogleBookCardProps> = ({
  book,
  showRating = true,
  showReviewButton = true,
  onReviewClick,
  onAddToUserList,
  onViewDetails,
  style = {}
}) => {
  const { isLoggedIn } = useAuth();
  const [isHovered, setIsHovered] = useState(false);

  const renderBookCover = () => {
    return (
      <div style={{ marginBottom: '12px' }}>
        {book.cover ? (
          <img
            src={book.cover}
            alt={book.title}
            style={{
              width: '100%',
              height: '200px',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '200px',
            background: 'linear-gradient(135deg, #F4E3C1, #E6D7C3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px'
          }}>
            <MenuBookIcon style={{ color: '#8B7355', fontSize: '48px' }} />
          </div>
        )}
      </div>
    );
  };


  const cardStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #E6D7C3',
    boxShadow: '0 4px 12px rgba(75, 63, 48, 0.1)',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    ...style
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

  const handleAddToFavorites = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToUserList) {
      onAddToUserList(book.id, 'FAVORITE');
    }
  };

  const handleAddToTBR = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAddToUserList) {
      onAddToUserList(book.id, 'TBR');
    }
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onViewDetails) {
      onViewDetails(book);
    }
  };

  const handleSignUpClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // This will be handled by parent component
  };

  return (
    <div
      style={cardStyle}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(75, 63, 48, 0.15)';
        setIsHovered(true);
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(75, 63, 48, 0.1)';
        setIsHovered(false);
      }}
      onClick={handleCardClick}
    >
      {renderBookCover()}
      
      {/* Book Info */}
      <h3 style={{
        fontFamily: 'Playfair Display, serif',
        fontSize: '16px',
        fontWeight: 600,
        color: '#4B3F30',
        marginBottom: '8px',
        lineHeight: 1.3,
        flex: 1
      }}>
        {book.title}
      </h3>
      <p style={{
        color: '#6A5E4D',
        fontSize: '14px',
        marginBottom: '8px'
      }}>
        by {book.authorName}
      </p>

      {/* Rating */}
      {showRating && (
        <div style={{ marginBottom: '12px' }}>
          <StarRating 
            rating={book.averageRating} 
            showCount={true}
            count={book.ratingsCount}
            size="small"
          />
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {isLoggedIn ? (
          <>
            <button
              style={{
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                padding: '8px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
              onClick={handleAddToFavorites}
            >
              Add to Favorites
            </button>
            <button
              style={{
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                padding: '8px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1976D2'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2196F3'}
              onClick={handleAddToTBR}
            >
              Add to TBR
            </button>
          </>
        ) : (
          <button
            style={{
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              padding: '8px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1976D2'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2196F3'}
            onClick={handleSignUpClick}
          >
            Sign up to Add
          </button>
        )}
        <button
          style={{
            backgroundColor: '#D2691E',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '12px',
            padding: '8px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#B85A1A'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#D2691E'}
          onClick={handleViewDetails}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default GoogleBookCard;
