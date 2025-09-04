import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MenuBook as MenuBookIcon,
  Add as AddIcon,
  BookmarkAdd as BookmarkAddIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { GoogleBook } from '../hooks/useGoogleBooksSimple';
import StarRating from './StarRating';
import { useAuth } from '../hooks/useAuth';
import { UserBookListService } from '../app/services/services/UserBookListService';
import { GoogleBookFeedbackService } from '../app/services/services/GoogleBookFeedbackService';
import { tokenService } from '../services/tokenService';

interface DiscoveryBookCardProps {
  book: GoogleBook;
  showRating?: boolean;
  onViewDetails?: (book: GoogleBook) => void;
  style?: React.CSSProperties;
  source?: 'google' | 'local';
  onBookAdded?: () => void; // Callback to refresh the parent list
}

const DiscoveryBookCard: React.FC<DiscoveryBookCardProps> = ({
  book,
  showRating = true,
  onViewDetails,
  style = {},
  source = 'google',
  onBookAdded
}) => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [addingToList, setAddingToList] = useState<string | null>(null);
  const [addedToLists, setAddedToLists] = useState<Set<string>>(new Set());
  const [appRating, setAppRating] = useState<number | null>(null);
  const [appRatingCount, setAppRatingCount] = useState<number | null>(null);

  // Fetch app ratings when component mounts or book changes
  useEffect(() => {
    const fetchAppRatings = async () => {
      if (book.googleBookId) {
        try {
          const [rating, count] = await Promise.all([
            GoogleBookFeedbackService.getAverageRating(book.googleBookId),
            GoogleBookFeedbackService.getRatingCount(book.googleBookId)
          ]);
          setAppRating(rating);
          setAppRatingCount(count);
        } catch (error) {
          console.error('Failed to fetch app ratings:', error);
          // Fall back to Google ratings if app ratings fail
          setAppRating(book.averageRating);
          setAppRatingCount(book.ratingsCount);
        }
      } else {
        // No Google Book ID, use Google ratings
        setAppRating(book.averageRating);
        setAppRatingCount(book.ratingsCount);
      }
    };

    fetchAppRatings();
  }, [book.googleBookId, book.averageRating, book.ratingsCount]);

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
    console.log('DiscoveryBookCard: Card clicked for book:', book);
    if (onViewDetails) {
      onViewDetails(book);
    }
  };

  const handleAddToUserList = async (e: React.MouseEvent, listType: 'read' | 'TBR') => {
    e.stopPropagation();
    
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (addingToList || !book.googleBookId) return;

    setAddingToList(listType);
    
    try {
      // Convert 'read' to 'READ' for the API call
      const apiListType = listType === 'read' ? 'READ' : listType;
      await UserBookListService.addGoogleBookToList(book.googleBookId, apiListType as 'READ' | 'TBR');
      setAddedToLists(prev => new Set([...prev, listType]));
      
      // Call the callback to refresh parent list if provided
      if (onBookAdded) {
        onBookAdded();
      }
      
      // Show success feedback briefly
      setTimeout(() => {
        setAddedToLists(prev => {
          const newSet = new Set(prev);
          newSet.delete(listType);
          return newSet;
        });
      }, 2000);
      
    } catch (error: any) {
      console.error('Failed to add book to list:', error);
      
      // Check if it's an authentication error (401/403)
      if (error?.status === 401 || error?.status === 403 || 
          (error?.message && (error.message.includes('Forbidden') || error.message.includes('Unauthorized')))) {
        console.log('Authentication error detected, logging out user');
        tokenService.logout();
        return;
      }
    } finally {
      setAddingToList(null);
    }
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('DiscoveryBookCard: View Details button clicked for book:', book);
    if (onViewDetails) {
      onViewDetails(book);
    }
  };

  const getButtonText = (listType: string) => {
    if (addingToList === listType) return 'Adding...';
    if (addedToLists.has(listType)) return '✓ Added';
    
    switch (listType) {
      case 'read': return 'Add to Read';
      case 'TBR': return 'Add to TBR';
      default: return 'Add';
    }
  };

  const getButtonIcon = (listType: string) => {
    if (addedToLists.has(listType)) return <CheckCircleIcon style={{ fontSize: '16px' }} />;
    
    switch (listType) {
      case 'read': return <AddIcon style={{ fontSize: '16px' }} />;
      case 'TBR': return <BookmarkAddIcon style={{ fontSize: '16px' }} />;
      default: return <AddIcon style={{ fontSize: '16px' }} />;
    }
  };

  const getButtonColor = (listType: string) => {
    if (addedToLists.has(listType)) return '#4CAF50';
    
    switch (listType) {
      case 'read': return '#4CAF50';
      case 'TBR': return '#2196F3';
      default: return '#D2691E';
    }
  };

  const getButtonHoverColor = (listType: string) => {
    if (addedToLists.has(listType)) return '#45a049';
    
    switch (listType) {
      case 'read': return '#45a049';
      case 'TBR': return '#1976D2';
      default: return '#B85A1A';
    }
  };

  const createActionButton = (listType: 'read' | 'TBR') => {
    const isDisabled = addingToList !== null;
    const backgroundColor = getButtonColor(listType);
    const hoverColor = getButtonHoverColor(listType);
    
    return (
      <button
        style={{
          backgroundColor,
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '12px',
          padding: '8px',
          fontWeight: 500,
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          transition: 'background-color 0.2s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '4px',
          opacity: isDisabled ? 0.7 : 1
        }}
        onMouseOver={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.backgroundColor = hoverColor;
          }
        }}
        onMouseOut={(e) => {
          if (!isDisabled) {
            e.currentTarget.style.backgroundColor = backgroundColor;
          }
        }}
        onClick={(e) => handleAddToUserList(e, listType)}
        disabled={isDisabled}
      >
        {getButtonIcon(listType)}
        {getButtonText(listType)}
      </button>
    );
  };

  return (
    <div
      style={cardStyle}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(75, 63, 48, 0.15)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(75, 63, 48, 0.1)';
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
        flex: 1,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical'
      }}>
        {book.title}
      </h3>
      
      <p style={{
        color: '#6A5E4D',
        fontSize: '14px',
        marginBottom: '8px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        by {book.authorName}
      </p>

      {/* Rating */}
      {showRating && (appRating !== null && appRatingCount !== null) && (
        <div style={{ marginBottom: '12px' }}>
          <StarRating 
            rating={appRating || 0} 
            showCount={true}
            count={appRatingCount || 0}
            size="small"
          />
        </div>
      )}

      {/* Source Badge */}
      {source === 'local' && (
        <div style={{
          backgroundColor: '#D2691E',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: 500,
          display: 'inline-block',
          marginBottom: '12px',
          alignSelf: 'flex-start'
        }}>
          In Library
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {isLoggedIn ? (
          <>
            {createActionButton('read')}
            {createActionButton('TBR')}
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
            onClick={(e) => {
              e.stopPropagation();
              navigate('/register');
            }}
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

export default DiscoveryBookCard;