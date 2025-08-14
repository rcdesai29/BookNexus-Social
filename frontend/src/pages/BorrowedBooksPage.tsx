import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { MenuBook, BookmarkBorder } from '@mui/icons-material';
import React, { useState } from 'react';
import type { BorrowedBookResponse } from '../app/services/models/BorrowedBookResponse';
import { BookService } from '../app/services/services/BookService';
import PaginationControls from '../components/PaginationControls';
import { useBorrowedBooks } from '../hooks/useBorrowedBooks';

// Note: This page shows books currently borrowed by the user
// UI shows as "Currently Reading" tab but internally still called "BorrowedBooksPage"

const BorrowedBooksPage: React.FC = () => {
  const { data, loading, error, page, setPage, size, setSize } = useBorrowedBooks();
  const [readBooks, setReadBooks] = useState<Set<number>>(new Set());
  const books = data?.content || [];

  const handleMarkAsRead = async (bookId: number) => {
    try {
      console.log('Marking book as read:', bookId);
      await BookService.markBookAsRead(bookId);
      console.log('Book marked as read successfully');
      // Add to read books set instead of removing from borrowed books
      setReadBooks(prev => new Set(prev).add(bookId));
      // Reload books to get updated read status from backend
      setPage(page); // This will trigger a reload
    } catch (error) {
      console.error('Error marking book as read:', error);
    }
  };

  const handleUnmarkAsRead = async (bookId: number) => {
    try {
      console.log('Unmarking book as read:', bookId);
      await BookService.unmarkBookAsRead(bookId);
      console.log('Book unmarked as read successfully');
      // Remove from read books set
      setReadBooks(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookId);
        return newSet;
      });
      // Reload books to get updated read status from backend
      setPage(page); // This will trigger a reload
    } catch (error) {
      console.error('Error unmarking book as read:', error);
    }
  };

  const handleReturnBook = async (bookId: number) => {
    try {
      console.log('Returning book:', bookId);
      console.log('Calling BookService.returnBorrowBook...');
      const result = await BookService.returnBorrowBook(bookId);
      console.log('Book returned successfully, result:', result);
      console.log('Reloading borrowed books...');
      // Reload books to get updated data from backend
      setPage(page); // This will trigger a reload
      console.log('Borrowed books reloaded');
    } catch (error) {
      console.error('Error returning book:', error);
    }
  };

  const isBookRead = (book: BorrowedBookResponse) => book.read || readBooks.has(book.id!);

  const renderBookCover = (book: BorrowedBookResponse) => {
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
    border: isBookRead(books[0]) ? '2px solid #4CAF50' : '1px solid #E6D7C3',
    boxShadow: '0 4px 12px rgba(75, 63, 48, 0.1)',
    transition: 'all 0.3s ease',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative'
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
    marginTop: '8px'
  };

  const secondaryButtonStyle: React.CSSProperties = {
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

  const readBadgeStyle: React.CSSProperties = {
    position: 'absolute',
    top: '12px',
    right: '12px',
    backgroundColor: '#4CAF50',
    color: 'white',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)'
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
            Error Loading Borrowed Books
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
            Currently Reading
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Track your reading progress and manage borrowed books
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
            <BookmarkBorder style={{ 
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
              No Books Borrowed
            </h3>
            <p style={{
              color: '#6A5E4D',
              fontSize: '16px',
              marginBottom: '24px'
            }}>
              You haven't borrowed any books yet. Browse the library to find your next read!
            </p>
            <button
              style={{
                ...buttonStyle,
                padding: '12px 24px',
                fontSize: '16px'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#B85A1A'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#D2691E'}
              onClick={() => window.location.href = '/books'}
            >
              Browse Books
            </button>
          </div>
        )}

        {books.length > 0 && (
          <>
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
                  {isBookRead(book) && (
                    <div style={readBadgeStyle}>
                      <CheckCircleIcon style={{ fontSize: '20px' }} />
                    </div>
                  )}
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
                    {isBookRead(book) ? (
                      <button
                        style={secondaryButtonStyle}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#D2691E';
                          e.currentTarget.style.color = 'white';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = '#D2691E';
                        }}
                        onClick={() => book.id && handleUnmarkAsRead(book.id)}
                      >
                        Mark as Unread
                      </button>
                    ) : (
                      <button
                        style={buttonStyle}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#B85A1A'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#D2691E'}
                        onClick={() => book.id && handleMarkAsRead(book.id)}
                      >
                        Mark as Read
                      </button>
                    )}
                    <button
                      style={secondaryButtonStyle}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#D2691E';
                        e.currentTarget.style.color = 'white';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = '#D2691E';
                      }}
                      onClick={() => book.id && handleReturnBook(book.id)}
                    >
                      Return Book
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            {data && (
              <PaginationControls
                currentPage={page}
                totalPages={data.totalPages || 0}
                pageSize={size}
                totalElements={data.totalElements || 0}
                onPageChange={setPage}
                onPageSizeChange={setSize}
                loading={loading}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BorrowedBooksPage; 