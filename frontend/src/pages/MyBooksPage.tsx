import React, { useState } from 'react';
import { 
  MenuBook, 
  FilterList as FilterIcon,
  Clear as ClearIcon 
} from '@mui/icons-material';
import LibraryBookCard from '../components/LibraryBookCard';
import UnifiedBookDetailsModal from '../components/UnifiedBookDetailsModal';
import { useUserBookList } from '../hooks/useUserBookList';
import { GoogleBook } from '../hooks/useGoogleBooksSimple';

const MyBooksPage: React.FC = () => {
  const { data: allBooks, loading, error, refetch, moveToShelf, removeFromLibrary, markAsFinished } = useUserBookList();
  const [selectedBook, setSelectedBook] = useState<GoogleBook | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [filterShelf, setFilterShelf] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter books based on selected shelf and search term
  const filteredBooks = allBooks.filter(bookItem => {
    // Filter by shelf
    const shelfMatch = filterShelf === 'all' || bookItem.listType === filterShelf;
    
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

  const getShelfCounts = () => {
    const counts = {
      all: allBooks.length,
      FAVORITE: 0,
      CURRENTLY_READING: 0,
      TBR: 0,
      READ: 0
    };

    allBooks.forEach(book => {
      if (book.listType) {
        counts[book.listType]++;
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

  if (error) {
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
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '24px'
          }}>
            {filteredBooks.map(bookItem => (
              <LibraryBookCard
                key={`${bookItem.id}-${bookItem.listType}`}
                bookListItem={bookItem}
                onViewDetails={handleViewDetails}
                onMoveToShelf={handleMoveToShelf}
                onRemoveFromLibrary={handleRemoveFromLibrary}
                onMarkAsFinished={handleMarkAsFinished}
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