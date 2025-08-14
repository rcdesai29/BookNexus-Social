import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MenuBook, BookmarkAdd, RemoveCircle } from '@mui/icons-material';
import type { BookResponse } from '../app/services/models/BookResponse';
import { BookService } from '../app/services/services/BookService';

// Note: This page shows books the user wants to read (To Be Read)
// UI shows as "TBR" tab but internally still called "TBRPage"

const TBRPage: React.FC = () => {
  const [books, setBooks] = useState<BookResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadTBRBooks();
  }, []);

  const loadTBRBooks = () => {
    // TODO: Implement TBR API call
    // For now, show empty state
    setLoading(false);
  };

  const handleBorrowBook = async (bookId: number) => {
    try {
      await BookService.borrowBook(bookId);
      // Remove from TBR after borrowing
      setBooks(books.filter(book => book.id !== bookId));
      // Optionally navigate to borrowed books
      navigate('/borrowed-books');
    } catch (error) {
      console.error('Error borrowing book:', error);
    }
  };

  const handleRemoveFromTBR = async (bookId: number) => {
    try {
      // TODO: Implement remove from TBR functionality
      setBooks(books.filter(book => book.id !== bookId));
    } catch (error) {
      console.error('Error removing from TBR:', error);
    }
  };

  const renderBookCover = (book: BookResponse) => {
    if (book.cover) {
      return (
        <img
          src={typeof book.cover === 'string' && book.cover.startsWith('http') ? 
               `http://localhost:8088/api/v1/books/cover/${book.id}` : 
               `data:image/jpeg;base64,${book.cover}`}
          alt={book.title}
          style={{
            width: '100%',
            height: '200px',
            objectFit: 'cover',
            borderRadius: '8px',
            marginBottom: '12px'
          }}
        />
      );
    }
    return (
      <div style={{
        width: '100%',
        height: '200px',
        background: 'linear-gradient(135deg, #F4E3C1, #E6D7C3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        marginBottom: '12px'
      }}>
        <MenuBook style={{ color: '#8B7355', fontSize: '48px' }} />
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
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: '#D2691E',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    marginTop: 'auto'
  };

  const removeButtonStyle: React.CSSProperties = {
    backgroundColor: 'transparent',
    color: '#D2691E',
    border: '1px solid #D2691E',
    borderRadius: '6px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.2s',
    marginTop: '8px'
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
            Error Loading TBR
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
            To Be Read
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Your literary wishlist of books to explore
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        {books.length === 0 && !loading && (
          <div style={{
            textAlign: 'center',
            padding: '64px 24px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            borderRadius: '16px',
            border: '1px solid #E6D7C3'
          }}>
            <BookmarkAdd style={{ 
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
              Your TBR List is Empty
            </h3>
            <p style={{
              color: '#6A5E4D',
              fontSize: '16px',
              marginBottom: '24px'
            }}>
              Browse books in the main library and add them to your TBR list.
            </p>
            <button
              style={{
                ...buttonStyle,
                padding: '12px 24px',
                fontSize: '16px'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#B85A1A'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#D2691E'}
              onClick={() => navigate('/books')}
            >
              Browse Books
            </button>
          </div>
        )}

        {books.length > 0 && (
          <div className="book-list-grid">
            {books.map(book => (
              <div 
                key={book.id}
                style={cardStyle}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(75, 63, 48, 0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(75, 63, 48, 0.1)';
                }}
              >
                {renderBookCover(book)}
                <h3 style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#4B3F30',
                  marginBottom: '8px',
                  lineHeight: 1.3
                }}>
                  {book.title}
                </h3>
                <p style={{
                  color: '#6A5E4D',
                  fontSize: '14px',
                  marginBottom: '16px'
                }}>
                  by {book.authorName}
                </p>
                
                <div style={{ marginTop: 'auto' }}>
                  <button
                    style={buttonStyle}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#B85A1A'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#D2691E'}
                    onClick={() => book.id && handleBorrowBook(book.id)}
                  >
                    Borrow Now
                  </button>
                  <button
                    style={removeButtonStyle}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#D2691E';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#D2691E';
                    }}
                    onClick={() => book.id && handleRemoveFromTBR(book.id)}
                  >
                    <RemoveCircle style={{ fontSize: '16px', marginRight: '4px' }} />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TBRPage; 