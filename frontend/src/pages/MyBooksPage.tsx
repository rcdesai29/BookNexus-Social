import React, { useState, useEffect } from 'react';
import { 
  MenuBook, 
  FilterList as FilterIcon,
  Clear as ClearIcon 
} from '@mui/icons-material';
import LibraryBookCard from '../components/LibraryBookCard';
import UnifiedBookDetailsModal from '../components/UnifiedBookDetailsModal';
import { useUserBookList } from '../hooks/useUserBookList';
import { UserBookListService } from '../app/services/services/UserBookListService';
import { GoogleBook } from '../hooks/useGoogleBooksSimple';

const MyBooksPage: React.FC = () => {
  const { data: allBooks, loading, error, refetch, moveToShelf, removeFromLibrary, markAsFinished } = useUserBookList();
  const [selectedBook, setSelectedBook] = useState<GoogleBook | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [filterShelf, setFilterShelf] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
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

  // Deduplicate books that might appear multiple times due to old FAVORITE entries
  const deduplicatedBooks = allBooks.reduce((acc: any[], bookItem) => {
    const book = bookItem.book || bookItem.googleBook;
    const bookId = book?.id || (book as any)?.googleBookId;
    
    if (!bookId) return acc;
    
    const existingIndex = acc.findIndex(existing => {
      const existingBook = existing.book || existing.googleBook;
      const existingBookId = existingBook?.id || (existingBook as any)?.googleBookId;
      return existingBookId === bookId;
    });
    
    if (existingIndex === -1) {
      // New book, add it
      acc.push(bookItem);
    } else {
      // Book already exists, merge favorite status and keep the one with a proper list type
      const existing = acc[existingIndex];
      const hasProperListType = Boolean(bookItem.listType);
      const existingHasProperListType = Boolean(existing.listType);
      
      if (hasProperListType && !existingHasProperListType) {
        // Replace with the one that has a proper list type
        acc[existingIndex] = {
          ...bookItem,
          isFavorite: bookItem.isFavorite || existing.isFavorite
        };
      } else if (!hasProperListType && existingHasProperListType) {
        // Keep existing but merge favorite status
        acc[existingIndex] = {
          ...existing,
          isFavorite: bookItem.isFavorite || existing.isFavorite
        };
      } else {
        // Both have proper list types or both don't, keep existing and merge favorite status
        acc[existingIndex] = {
          ...existing,
          isFavorite: bookItem.isFavorite || existing.isFavorite
        };
      }
    }
    
    return acc;
  }, []);

  // Filter books based on selected shelf and search term
  const filteredBooks = deduplicatedBooks.filter(bookItem => {
    // Filter by shelf
    const shelfMatch = filterShelf === 'all' || 
      bookItem.listType === filterShelf ||
      (filterShelf === 'FAVORITE' && bookItem.isFavorite);
    
    // Filter by search term
    const book = bookItem.book || bookItem.googleBook;
    const searchMatch = !searchTerm || 
      book?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book?.authorName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return shelfMatch && searchMatch;
  });

  const handleViewDetails = (book: any) => {
    setSelectedBook(book);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedBook(null);
  };

  const handleMoveToShelf = async (bookId: string, fromShelf: string, toShelf: string) => {
    try {
      await moveToShelf(bookId, fromShelf, toShelf);
    } catch (error) {
      console.error('Failed to move book:', error);
    }
  };

  const handleRemoveFromLibrary = async (bookId: string) => {
    try {
      await removeFromLibrary(bookId);
    } catch (error) {
      console.error('Failed to remove book:', error);
    }
  };

  const handleMarkAsFinished = async (bookId: string) => {
    try {
      await markAsFinished(bookId);
    } catch (error) {
      console.error('Failed to mark as finished:', error);
    }
  };

  const handleToggleFavorite = async (bookId: string, isFavorite: boolean) => {
    try {
      // Toggle favorite status
      await UserBookListService.toggleFavorite(bookId);
      // Refetch the data to update the UI
      refetch();
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const getShelfCounts = () => {
    const counts = {
      all: deduplicatedBooks.length,
      FAVORITE: 0,
      CURRENTLY_READING: 0,
      TBR: 0,
      READ: 0
    };

    deduplicatedBooks.forEach(book => {
      // Count by list type (handle case conversion for READ)
      if (book.listType) {
        const listType = book.listType.toUpperCase();
        if (counts.hasOwnProperty(listType)) {
          counts[listType as keyof typeof counts]++;
        }
      }
      
      // Count favorites separately
      if (book.isFavorite) {
        counts.FAVORITE++;
      }
    });

    return counts;
  };

  const shelfCounts = getShelfCounts();

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(10px)',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #E6D7C3',
    boxShadow: '0 4px 12px rgba(75, 63, 48, 0.1)',
    marginBottom: '24px'
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

  // Only show error if it's a real error, not just an empty library
  if (error && !Array.isArray(allBooks)) {
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
            Error Loading Books
          </h3>
          <p style={{ color: '#6A5E4D' }}>
            {error.message || String(error)}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: '#D2691E',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              marginTop: '16px'
            }}
          >
            Try Again
          </button>
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
            My Books
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Your personal library across all shelves
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Controls Section */}
        <div style={cardStyle}>
          <div style={{
            display: 'flex',
            gap: '24px',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            {/* Search Bar */}
            <div style={{ flex: 1, minWidth: '200px' }}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search your books..."
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #E6D7C3',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: '#4B3F30'
                }}
              />
            </div>

            {/* Shelf Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FilterIcon style={{ color: '#8B7355' }} />
              <select
                value={filterShelf}
                onChange={(e) => setFilterShelf(e.target.value)}
                style={{
                  padding: '12px 16px',
                  border: '1px solid #E6D7C3',
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: '#4B3F30',
                  minWidth: '160px'
                }}
              >
                <option value="all">All Books ({shelfCounts.all})</option>
                <option value="CURRENTLY_READING">Currently Reading ({shelfCounts.CURRENTLY_READING})</option>
                <option value="TBR">TBR ({shelfCounts.TBR})</option>
                <option value="READ">Read ({shelfCounts.READ})</option>
                <option value="FAVORITE">Favorites ({shelfCounts.FAVORITE})</option>
              </select>
            </div>

            {/* Clear Filters */}
            {(searchTerm || filterShelf !== 'all') && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterShelf('all');
                }}
                style={{
                  padding: '12px',
                  border: '1px solid #E6D7C3',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  color: '#D2691E',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ClearIcon style={{ fontSize: '16px' }} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Books Grid */}
        {filteredBooks.length === 0 && !loading ? (
          <div style={{
            textAlign: 'center',
            padding: '64px 24px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '16px',
            border: '1px solid #E6D7C3'
          }}>
            <MenuBook style={{ 
              color: '#8B7355', 
              fontSize: '64px',
              marginBottom: '24px'
            }} />
            <h3 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '24px',
              color: '#4B3F30',
              marginBottom: '16px'
            }}>
              {searchTerm || filterShelf !== 'all' ? 'No Books Found' : 'Your Library is Empty'}
            </h3>
            <p style={{
              color: '#6A5E4D',
              fontSize: '16px',
              marginBottom: '24px'
            }}>
              {searchTerm || filterShelf !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Start building your personal library by adding books from the search page.'}
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile 
              ? 'repeat(auto-fill, minmax(140px, 1fr))' 
              : 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: isMobile ? '16px' : '24px'
          }}>
            {filteredBooks.map(bookItem => (
              <LibraryBookCard
                key={`${bookItem.id}-${bookItem.listType}`}
                bookListItem={bookItem}
                onViewDetails={handleViewDetails}
                onMoveToShelf={handleMoveToShelf}
                onRemoveFromLibrary={handleRemoveFromLibrary}
                onMarkAsFinished={handleMarkAsFinished}
                onToggleFavorite={handleToggleFavorite}
                showShelfActions={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Book Details Modal */}
      <UnifiedBookDetailsModal
        book={selectedBook}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        context="library"
      />
    </div>
  );
};

export default MyBooksPage;