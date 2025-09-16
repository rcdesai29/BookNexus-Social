import React, { useState, useEffect } from 'react';
import { 
  MenuBook, 
  CheckCircle as ReadIcon
} from '@mui/icons-material';
import LibraryBookCard from '../components/LibraryBookCard';
import UnifiedBookDetailsModal from '../components/UnifiedBookDetailsModal';
import { useUserBookList } from '../hooks/useUserBookList';
import { GoogleBook } from '../hooks/useGoogleBooksSimple';

const ReadPage: React.FC = () => {
  const { data: readBooks, loading, error, refetch, moveToShelf, removeFromLibrary } = useUserBookList('READ');
  const [selectedBook, setSelectedBook] = useState<GoogleBook | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
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
            Read Books
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Books you've completed reading
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        {readBooks.length === 0 && !loading ? (
          <div style={{
            textAlign: 'center',
            padding: '64px 24px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '16px',
            border: '1px solid #E6D7C3'
          }}>
            <ReadIcon style={{ 
              color: '#4CAF50', 
              fontSize: '64px',
              marginBottom: '24px'
            }} />
            <h3 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '24px',
              color: '#4B3F30',
              marginBottom: '16px'
            }}>
              No Books Read Yet
            </h3>
            <p style={{
              color: '#6A5E4D',
              fontSize: '16px'
            }}>
              Books you mark as finished will appear here.
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
            {readBooks.map(bookItem => (
              <LibraryBookCard
                key={`${bookItem.id}-${bookItem.listType}`}
                bookListItem={bookItem}
                onViewDetails={handleViewDetails}
                onMoveToShelf={handleMoveToShelf}
                onRemoveFromLibrary={handleRemoveFromLibrary}
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

export default ReadPage;