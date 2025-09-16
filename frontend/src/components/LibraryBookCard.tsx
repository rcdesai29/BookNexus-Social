import React, { useState } from 'react';
import {
  MenuBook as MenuBookIcon,
  AutoStories as CurrentlyReadingIcon,
  BookmarkAdd as TBRIcon,
  CheckCircle as ReadIcon,
  Star as FavoriteIcon,
  MoreVert as MoreIcon,
  Delete as RemoveIcon,
  SwapHoriz as MoveIcon,
  Flag as FinishIcon
} from '@mui/icons-material';
import { UserBookList } from '../app/services/services/UserBookListService';
import StarRating from './StarRating';

interface LibraryBookCardProps {
  bookListItem: UserBookList;
  onViewDetails?: (book: any) => void;
  onMoveToShelf?: (bookId: string, fromShelf: string, toShelf: string) => void;
  onRemoveFromLibrary?: (bookId: string) => void;
  onMarkAsFinished?: (bookId: string) => void;
  onToggleFavorite?: (bookId: string, isFavorite: boolean) => void;
  style?: React.CSSProperties;
  showShelfActions?: boolean;
}

const LibraryBookCard: React.FC<LibraryBookCardProps> = ({
  bookListItem,
  onViewDetails,
  onMoveToShelf,
  onRemoveFromLibrary,
  onMarkAsFinished,
  onToggleFavorite,
  style = {},
  showShelfActions = true
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isMoving, setIsMoving] = useState(false);
  
  // Responsive hook
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  
  React.useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Responsive utilities
  const isMobile = windowSize.width <= 768;

  // Determine which book data to use and normalize the structure
  const book = (() => {
    if (bookListItem.book) {
      // Local book data
      return bookListItem.book;
    } else if (bookListItem.googleBook) {
      // Google book data - normalize field names to match GoogleBook interface
      return {
        ...bookListItem.googleBook,
        cover: bookListItem.googleBook.coverUrl || null,
        synopsis: bookListItem.googleBook.description || 'No description available.',
        // Ensure googleBookId is available
        googleBookId: bookListItem.googleBook.googleBookId,
        // Add missing fields with defaults
        isbn: '',
        publishedDate: '',
        pageCount: 0,
        categories: [],
        averageRating: bookListItem.googleBook.averageRating || 0,
        ratingsCount: bookListItem.googleBook.ratingsCount || 0,
        isGoogleBook: true
      };
    }
    return null;
  })();
  const isGoogleBook = !!bookListItem.googleBook;
  
  if (!book) return null;

  const renderBookCover = () => {
    let coverUrl: string | undefined;
    
    if (isGoogleBook) {
      coverUrl = bookListItem.googleBook?.coverUrl;
    } else if (bookListItem.book?.cover) {
      const cover = bookListItem.book.cover;
      coverUrl = typeof cover === 'string' && cover.startsWith('http') 
        ? `http://localhost:8088/api/v1/books/cover/${bookListItem.book.id}` 
        : `data:image/jpeg;base64,${cover}`;
    }

    return (
      <div style={{ marginBottom: '12px', position: 'relative' }}>
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={book.title}
            style={{
              width: '100%',
              height: isMobile ? '140px' : '200px',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: isMobile ? '140px' : '200px',
            background: 'linear-gradient(135deg, #F4E3C1, #E6D7C3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '8px'
          }}>
            <MenuBookIcon style={{ color: '#8B7355', fontSize: isMobile ? '32px' : '48px' }} />
          </div>
        )}
        
        {/* Read Count Badge */}
        {getReadCount() > 1 && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            backgroundColor: '#4CAF50',
            color: 'white',
            borderRadius: '12px',
            padding: '4px 8px',
            fontSize: '10px',
            fontWeight: 'bold'
          }}>
            ✓ {getReadCount()}
          </div>
        )}

        {/* Favorite Star Badge */}
        {bookListItem.isFavorite && (
          <div style={{
            position: 'absolute',
            top: '8px',
            left: '8px',
            backgroundColor: '#FFD700',
            borderRadius: '50%',
            width: '28px',
            height: '28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(255, 215, 0, 0.4)'
          }}>
            <FavoriteIcon style={{ fontSize: '16px', color: '#B8860B' }} />
          </div>
        )}
      </div>
    );
  };

  const getReadCount = () => {
    // This would come from the backend - for now return 1
    // In real implementation, this would be calculated from read completion dates
    return bookListItem.listType === 'READ' ? 1 : 0;
  };

  const getStatusInfo = () => {
    switch (bookListItem.listType) {
      case 'CURRENTLY_READING':
        const isReread = getReadCount() > 0;
        return {
          icon: <CurrentlyReadingIcon style={{ fontSize: '16px', color: '#FF9800' }} />,
          text: isReread ? 'Currently Reading (Reread)' : 'Currently Reading',
          color: '#FF9800',
          progress: bookListItem.readingProgress || 0
        };
      case 'TBR':
        return {
          icon: <TBRIcon style={{ fontSize: '16px', color: '#2196F3' }} />,
          text: 'TBR',
          color: '#2196F3',
          dateAdded: bookListItem.createdDate
        };
      case 'READ':
        return {
          icon: <ReadIcon style={{ fontSize: '16px', color: '#4CAF50' }} />,
          text: `Read ${getReadCount() > 1 ? `✓ ${getReadCount()}` : ''}`,
          color: '#4CAF50',
          lastCompleted: bookListItem.lastModifiedDate
        };
      default:
        return {
          icon: <MenuBookIcon style={{ fontSize: '16px', color: '#666' }} />,
          text: 'Unknown',
          color: '#666'
        };
    }
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    padding: isMobile ? '12px' : '16px',
    borderRadius: '12px',
    border: '1px solid #E6D7C3',
    boxShadow: '0 4px 12px rgba(75, 63, 48, 0.1)',
    transition: 'all 0.3s ease',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    position: 'relative',
    ...style
  };

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(book);
    }
  };

  const handleMoveToShelf = async (e: React.MouseEvent, targetShelf: string) => {
    e.stopPropagation();
    if (!onMoveToShelf || !bookListItem.listType) return;
    
    setIsMoving(true);
    try {
      const bookId = isGoogleBook ? bookListItem.googleBook?.googleBookId : bookListItem.book?.id?.toString();
      if (bookId) {
        await onMoveToShelf(bookId, bookListItem.listType, targetShelf);
      }
    } finally {
      setIsMoving(false);
      setShowActions(false);
    }
  };

  const handleRemove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onRemoveFromLibrary) return;
    
    const bookId = isGoogleBook ? bookListItem.googleBook?.googleBookId : bookListItem.book?.id?.toString();
    if (bookId) {
      await onRemoveFromLibrary(bookId);
    }
    setShowActions(false);
  };

  const handleMarkAsFinished = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onMarkAsFinished) return;
    
    const bookId = isGoogleBook ? bookListItem.googleBook?.googleBookId : bookListItem.book?.id?.toString();
    if (bookId) {
      await onMarkAsFinished(bookId);
    }
    setShowActions(false);
  };

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onToggleFavorite) return;
    
    const bookId = isGoogleBook ? bookListItem.googleBook?.googleBookId : bookListItem.book?.id?.toString();
    if (bookId) {
      const isFavorite = bookListItem.isFavorite ?? false;
      await onToggleFavorite(bookId, isFavorite);
    }
    setShowActions(false);
  };

  const statusInfo = getStatusInfo();

  const getAvailableShelfMoves = () => {
    const currentShelf = bookListItem.listType;
    const allShelves = ['CURRENTLY_READING', 'TBR', 'READ'];
    return allShelves.filter(shelf => shelf !== currentShelf);
  };

  const getShelfDisplayName = (shelf: string) => {
    switch (shelf) {
      case 'CURRENTLY_READING': return 'Currently Reading';
      case 'TBR': return 'TBR';
      case 'READ': return 'Read';
      default: return shelf;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
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
      {/* Actions Menu Button */}
      {showShelfActions && (
        <button
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'rgba(255, 255, 255, 0.8)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
          onClick={(e) => {
            e.stopPropagation();
            setShowActions(!showActions);
          }}
        >
          <MoreIcon style={{ fontSize: '18px', color: '#666' }} />
        </button>
      )}

      {/* Actions Dropdown */}
      {showActions && (
        <div style={{
          position: 'absolute',
          top: '48px',
          right: '12px',
          backgroundColor: 'white',
          border: '1px solid #E6D7C3',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
          zIndex: 20,
          minWidth: '180px'
        }}>
          {/* Move to shelf options */}
          {getAvailableShelfMoves().map(shelf => (
            <button
              key={shelf}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                background: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}
              onClick={(e) => handleMoveToShelf(e, shelf)}
              disabled={isMoving}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F5F5F5'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <MoveIcon style={{ fontSize: '16px' }} />
              Move to {getShelfDisplayName(shelf)}
            </button>
          ))}
          
          {/* Mark as finished for currently reading */}
          {bookListItem.listType === 'CURRENTLY_READING' && (
            <button
              style={{
                width: '100%',
                padding: '12px 16px',
                border: 'none',
                background: 'none',
                textAlign: 'left',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px'
              }}
              onClick={handleMarkAsFinished}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F5F5F5'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <FinishIcon style={{ fontSize: '16px' }} />
              Mark as Finished
            </button>
          )}
          
          {/* Toggle Favorite */}
          <button
            style={{
              width: '100%',
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: bookListItem.isFavorite ? '#E91E63' : '#FFD700'
            }}
            onClick={handleToggleFavorite}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F5F5F5'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <FavoriteIcon style={{ fontSize: '16px' }} />
            {bookListItem.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
          </button>

          {/* Remove from library */}
          <button
            style={{
              width: '100%',
              padding: '12px 16px',
              border: 'none',
              background: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              color: '#DC2626'
            }}
            onClick={handleRemove}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#FEE2E2'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <RemoveIcon style={{ fontSize: '16px' }} />
            Remove from My Books
          </button>
        </div>
      )}

      {renderBookCover()}
      
      {/* Book Info */}
      <h3 style={{
        fontFamily: 'Playfair Display, serif',
        fontSize: isMobile ? '14px' : '16px',
        fontWeight: 600,
        color: '#4B3F30',
        marginBottom: '8px',
        lineHeight: 1.3,
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
        fontSize: isMobile ? '12px' : '14px',
        marginBottom: '8px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      }}>
        by {book.authorName}
      </p>

      {/* Status Badge */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
        padding: '6px 10px',
        backgroundColor: `${statusInfo.color}15`,
        borderRadius: '6px',
        border: `1px solid ${statusInfo.color}30`
      }}>
        {statusInfo.icon}
        <span style={{
          color: statusInfo.color,
          fontSize: '12px',
          fontWeight: 500
        }}>
          {statusInfo.text}
        </span>
      </div>

      {/* Progress Bar for Currently Reading */}
      {bookListItem.listType === 'CURRENTLY_READING' && statusInfo.progress !== undefined && (
        <div style={{ marginBottom: '12px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '4px'
          }}>
            <span style={{ color: '#6A5E4D', fontSize: '12px' }}>Progress</span>
            <span style={{ color: '#4B3F30', fontSize: '12px', fontWeight: 500 }}>
              {statusInfo.progress}%
            </span>
          </div>
          <div style={{
            width: '100%',
            backgroundColor: '#F4E3C1',
            borderRadius: '4px',
            height: '6px'
          }}>
            <div style={{
              backgroundColor: '#FF9800',
              height: '6px',
              borderRadius: '4px',
              width: `${statusInfo.progress}%`,
              transition: 'width 0.3s'
            }}></div>
          </div>
        </div>
      )}

      {/* Additional Info */}
      {statusInfo.dateAdded && (
        <p style={{
          color: '#8B7355',
          fontSize: '11px',
          marginBottom: '8px'
        }}>
          Added: {formatDate(statusInfo.dateAdded)}
        </p>
      )}

      {statusInfo.lastCompleted && (
        <p style={{
          color: '#8B7355',
          fontSize: '11px',
          marginBottom: '8px'
        }}>
          Last completed: {formatDate(statusInfo.lastCompleted)}
        </p>
      )}

      {/* Rating if available */}
      {bookListItem.userRating && (
        <div style={{ marginBottom: '12px' }}>
          <StarRating 
            rating={bookListItem.userRating} 
            showCount={false}
            size="small"
          />
        </div>
      )}

      {/* View Details Button */}
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
          transition: 'background-color 0.2s',
          marginTop: 'auto'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#B85A1A'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#D2691E'}
        onClick={(e) => {
          e.stopPropagation();
          if (onViewDetails) {
            onViewDetails(book);
          }
        }}
      >
        View Details
      </button>
    </div>
  );
};

export default LibraryBookCard;