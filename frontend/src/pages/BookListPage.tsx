import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CircularProgress,
  Alert
} from '@mui/material';
import {
  TrendingUp,
  Coffee,
  AutoStories,
  Favorite,
  Star,
  MenuBook
} from '@mui/icons-material';
import PaginationControls from '../components/PaginationControls';
import GoogleBookCard from '../components/GoogleBookCard';
import GoogleBookReviewModal from '../components/GoogleBookReviewModal';
import { useBooks } from '../hooks/useBooks';
import { useBorrowedBooks } from '../hooks/useBorrowedBooks';
import { useMyBooks } from '../hooks/useMyBooks';
import { useReadBooks } from '../hooks/useReadBooks';
import { useTrendingBooks, usePopularBooks, useBestsellers, GoogleBook } from '../hooks/useGoogleBooks';
import { GoogleBookFeedbackService } from '../app/services/services/GoogleBookFeedbackService';

const BookListPage: React.FC = () => {
  const { data: allBooks, loading: allBooksLoading, error: allBooksError, page, setPage, size, setSize } = useBooks();
  const { data: borrowedBooks, loading: borrowedLoading } = useBorrowedBooks();
  const { data: myBooks, loading: myBooksLoading } = useMyBooks();
  const { data: readBooks, loading: readBooksLoading } = useReadBooks();
  
  // Google Books API hooks
  const { data: trendingBooks, loading: trendingLoading } = useTrendingBooks(3);
  const { data: popularBooks, loading: popularLoading } = usePopularBooks(4);
  const { data: bestsellers, loading: bestsellersLoading } = useBestsellers(20);
  
  const navigate = useNavigate();
  
  // Modal state
  const [selectedBook, setSelectedBook] = useState<GoogleBook | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Get currently reading book (first borrowed book)
  const currentlyReading = borrowedBooks?.content?.[0];

  // Get trending books from Google Books API
  const trendingBooksData = trendingBooks || [];

  // Get to-read books (my books that aren't borrowed or read)
  const toReadBooks = myBooks?.content?.filter(book => 
    !borrowedBooks?.content?.some(borrowed => borrowed.id === book.id) &&
    !readBooks?.content?.some(read => read.id === book.id)
  ).slice(0, 4) || [];

  // Get favorite books (read books, first 4)
  const favoriteBooks = readBooks?.content?.slice(0, 4) || [];

  // Review modal handlers
  const handleReviewClick = (book: GoogleBook) => {
    setSelectedBook(book);
    setIsReviewModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedBook(null);
  };

  const handleSubmitReview = async (bookId: string, rating: number, review: string) => {
    if (!selectedBook) return;
    
    try {
      await GoogleBookFeedbackService.saveFeedback({
        googleBookId: bookId,
        bookTitle: selectedBook.title,
        authorName: selectedBook.authorName,
        rating: rating,
        review: review
      });
    } catch (error) {
      console.error('Failed to save review:', error);
      throw error;
    }
  };

  const renderBookCover = (book: any, style: React.CSSProperties = {}) => {
    if (book.cover) {
      return (
        <img
          src={typeof book.cover === 'string' && book.cover.startsWith('http') ? 
               `http://localhost:8088/api/v1/books/cover/${book.id}` : 
               `data:image/jpeg;base64,${book.cover}`}
          alt={book.title}
          style={{
            objectFit: 'cover',
            borderRadius: '8px',
            ...style
          }}
        />
      );
    }
    return (
      <div style={{
        background: 'linear-gradient(135deg, #F4E3C1, #E6D7C3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        ...style
      }}>
        <MenuBook style={{ color: '#8B7355', fontSize: '24px' }} />
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
    marginBottom: '24px'
  };

  const headingStyle: React.CSSProperties = {
    fontFamily: 'Playfair Display, serif',
    fontSize: '20px',
    fontWeight: 600,
    color: '#4B3F30',
    marginBottom: '24px'
  };

  const buttonStyle: React.CSSProperties = {
    backgroundColor: '#D2691E',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '8px 12px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF3E3' }}>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(90deg, #4B3F30, #5D4A33, #4B3F30)',
        color: 'white',
        padding: '64px 0',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: '48px',
            fontWeight: 700,
            marginBottom: '16px'
          }}>
            Welcome to Your Literary Haven
          </h1>
          <p style={{
            fontSize: '20px',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Discover, track, and share your reading journey in our cozy digital bookstore
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        {/* 3-Column Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '48px'
        }}>
          
          {/* LEFT COLUMN — Currently Reading */}
          <div>
            <h2 style={headingStyle}>Currently Reading</h2>
            
            {currentlyReading ? (
              <div style={cardStyle}>
                <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                  {renderBookCover(currentlyReading, { width: '100px', height: '150px' })}
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      fontFamily: 'Playfair Display, serif',
                      fontSize: '18px',
                      fontWeight: 600,
                      color: '#4B3F30',
                      marginBottom: '8px',
                      lineHeight: 1.3
                    }}>
                      {currentlyReading.title}
                    </h3>
                    <p style={{
                      color: '#6A5E4D',
                      marginBottom: '16px',
                      fontSize: '14px'
                    }}>
                      by {currentlyReading.authorName}
                    </p>
                    
                    {/* Progress Bar */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '8px'
                      }}>
                        <span style={{ color: '#6A5E4D', fontSize: '14px' }}>Progress</span>
                        <span style={{ color: '#4B3F30', fontSize: '14px', fontWeight: 500 }}>0%</span>
                      </div>
                      <div style={{
                        width: '100%',
                        backgroundColor: '#F4E3C1',
                        borderRadius: '9999px',
                        height: '8px'
                      }}>
                        <div style={{
                          backgroundColor: '#D2691E',
                          height: '8px',
                          borderRadius: '9999px',
                          width: '0%',
                          transition: 'width 0.3s'
                        }}></div>
                      </div>
                    </div>
                    
                    <button
                      style={buttonStyle}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#B85A1A'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#D2691E'}
                      onClick={() => {/* Add progress update logic */}}
                    >
                      Update Progress
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ ...cardStyle, textAlign: 'center' }}>
                <Coffee style={{ color: '#D2691E', fontSize: '48px', marginBottom: '12px' }} />
                <p style={{ color: '#6A5E4D' }}>
                  {borrowedLoading ? 'Loading...' : 'Add your first book!'}
                </p>
              </div>
            )}
          </div>

          {/* CENTER COLUMN — Trending Today + From Friends */}
          <div>
            {/* Trending Today Section */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={headingStyle}>Trending Today</h2>
              
              {trendingLoading ? (
                <div style={{ ...cardStyle, display: 'flex', justifyContent: 'center', padding: '32px' }}>
                  <CircularProgress sx={{ color: '#D2691E' }} />
                </div>
              ) : trendingBooksData.length > 0 ? (
                <div style={cardStyle}>
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    overflowX: 'auto',
                    paddingBottom: '8px'
                  }}>
                    {trendingBooksData.map((book) => (
                      <div key={book.googleBookId} style={{ minWidth: '120px', width: '120px' }}>
                        <GoogleBookCard
                          book={book}
                          showRating={true}
                          showReviewButton={false}
                          onReviewClick={handleReviewClick}
                          style={{ padding: '12px' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ ...cardStyle, textAlign: 'center' }}>
                  <TrendingUp style={{ color: '#D2691E', fontSize: '48px', marginBottom: '12px' }} />
                  <p style={{ color: '#6A5E4D' }}>No trending books available</p>
                </div>
              )}
            </div>

            {/* Popular Books Section */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={headingStyle}>Popular Books</h2>
              
              {popularLoading ? (
                <div style={{ ...cardStyle, display: 'flex', justifyContent: 'center', padding: '32px' }}>
                  <CircularProgress sx={{ color: '#D2691E' }} />
                </div>
              ) : popularBooks.length > 0 ? (
                <div style={cardStyle}>
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    overflowX: 'auto',
                    paddingBottom: '8px'
                  }}>
                    {popularBooks.map((book) => (
                      <div key={book.googleBookId} style={{ minWidth: '120px', width: '120px' }}>
                        <GoogleBookCard
                          book={book}
                          showRating={true}
                          showReviewButton={false}
                          onReviewClick={handleReviewClick}
                          style={{ padding: '12px' }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ ...cardStyle, textAlign: 'center' }}>
                  <Favorite style={{ color: '#D2691E', fontSize: '48px', marginBottom: '12px' }} />
                  <p style={{ color: '#6A5E4D' }}>No popular books available</p>
                </div>
              )}
            </div>

            {/* From Friends Section */}
            <div>
              <h2 style={headingStyle}>From Friends</h2>
              <div style={{ ...cardStyle, textAlign: 'center' }}>
                <Favorite style={{ color: '#D2691E', fontSize: '48px', marginBottom: '12px' }} />
                <p style={{ color: '#6A5E4D', marginBottom: '8px' }}>
                  Join a book club to connect with others
                </p>
                <p style={{ color: '#8B7355', fontSize: '14px' }}>
                  Social features coming soon!
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — To Read & Favorites */}
          <div>
            {/* To Read Section */}
            <div style={{ marginBottom: '24px' }}>
              <h2 style={headingStyle}>To Read</h2>
              {myBooksLoading ? (
                <div style={{ ...cardStyle, display: 'flex', justifyContent: 'center', padding: '32px' }}>
                  <CircularProgress sx={{ color: '#D2691E' }} size={24} />
                </div>
              ) : toReadBooks.length > 0 ? (
                <div style={cardStyle}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px'
                  }}>
                    {toReadBooks.map((book) => (
                      <div 
                        key={book.id}
                        style={{
                          cursor: 'pointer',
                          transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        onClick={() => navigate(`/books/${book.id}`)}
                      >
                        {renderBookCover(book, { width: '100%', height: '135px' })}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ ...cardStyle, textAlign: 'center' }}>
                  <AutoStories style={{ color: '#D2691E', fontSize: '48px', marginBottom: '12px' }} />
                  <p style={{ color: '#6A5E4D' }}>Build your reading list</p>
                </div>
              )}
            </div>

            {/* Favorites Section */}
            <div>
              <h2 style={headingStyle}>Favorites</h2>
              {readBooksLoading ? (
                <div style={{ ...cardStyle, display: 'flex', justifyContent: 'center', padding: '32px' }}>
                  <CircularProgress sx={{ color: '#D2691E' }} size={24} />
                </div>
              ) : favoriteBooks.length > 0 ? (
                <div style={cardStyle}>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px'
                  }}>
                    {favoriteBooks.map((book) => (
                      <div 
                        key={book.id}
                        style={{
                          cursor: 'pointer',
                          transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        onClick={() => navigate(`/books/${book.id}`)}
                      >
                        {renderBookCover(book, { width: '100%', height: '135px' })}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ ...cardStyle, textAlign: 'center' }}>
                  <Star style={{ color: '#FFD700', fontSize: '48px', marginBottom: '12px' }} />
                  <p style={{ color: '#6A5E4D' }}>No favorites yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* All Books Section */}
        {allBooksLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
            <CircularProgress sx={{ color: '#D2691E' }} size={48} />
          </div>
        )}

        {allBooksError && (
          <Alert severity="error" style={{ marginBottom: '32px' }}>
            {allBooksError.message || String(allBooksError)}
          </Alert>
        )}

        {/* Discover Books Section */}
        <div>
          <h2 style={headingStyle}>Discover Books</h2>
          
          {bestsellersLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
              <CircularProgress sx={{ color: '#D2691E' }} size={48} />
            </div>
          ) : bestsellers.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '24px'
            }}>
              {bestsellers.map(book => (
                <GoogleBookCard
                  key={book.googleBookId}
                  book={book}
                  showRating={true}
                  showReviewButton={true}
                  onReviewClick={handleReviewClick}
                />
              ))}
            </div>
          ) : (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '48px' }}>
              <MenuBook style={{ color: '#D2691E', fontSize: '48px', marginBottom: '12px' }} />
              <p style={{ color: '#6A5E4D' }}>No books available</p>
            </div>
          )}
        </div>
      </div>

      {/* Google Book Review Modal */}
      <GoogleBookReviewModal
        book={selectedBook}
        isOpen={isReviewModalOpen}
        onClose={handleCloseReviewModal}
        onSubmitReview={handleSubmitReview}
      />
    </div>
  );
};

export default BookListPage;