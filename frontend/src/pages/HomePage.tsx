import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CircularProgress,
  Alert,
  Button,
  Box
} from '@mui/material';
import {
  Coffee,
  AutoStories,
  MenuBook,
  NavigateNext,
  NavigateBefore
} from '@mui/icons-material';
import { useGoogleBooksSimple } from '../hooks/useGoogleBooksSimple';
import { useBorrowedBooks } from '../hooks/useBorrowedBooks';
import { useMyBooks } from '../hooks/useMyBooks';
import { useReadBooks } from '../hooks/useReadBooks';
import { useAuth } from '../hooks/useAuth';
import DiscoveryBookCard from '../components/DiscoveryBookCard';
import UnifiedBookDetailsModal from '../components/UnifiedBookDetailsModal';
import { UserBookListService } from '../app/services/services/UserBookListService';
import FriendsFeed from '../components/FriendsFeed';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  
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
  const isTablet = windowSize.width > 768 && windowSize.width <= 1024;
  const isDesktop = windowSize.width > 1024;
  
  // Only fetch user data if logged in
  const { data: borrowedBooks, loading: borrowedLoading } = useBorrowedBooks();
  const { data: myBooks, loading: myBooksLoading } = useMyBooks(); 
  const { data: readBooks, loading: readBooksLoading } = useReadBooks();
  
  // Favorites state
  const [favoriteBooks, setFavoriteBooks] = useState<any[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  
  // Pagination state for discover books
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 20; // Keep original amount
  
  // Always fetch discovery books (works for guests too) - get more books for pagination
  const { data: discoverBooks, loading: discoverBooksLoading, error: discoverBooksError } = useGoogleBooksSimple('bestsellers', booksPerPage * 10); // Get 10 pages worth
  
  // Modal state for book details
  const [selectedBook, setSelectedBook] = useState<any>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [bookRatingUpdates, setBookRatingUpdates] = useState<{[key: string]: {rating: number, count: number}}>({});

  // Book details modal handlers
  const handleBookDetailsClick = (book: any) => {
    console.log('Opening book details modal for:', book);
    setSelectedBook(book);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedBook(null);
  };

  const handleRatingUpdated = (newRating: number, newCount: number) => {
    if (selectedBook?.googleBookId) {
      setBookRatingUpdates(prev => ({
        ...prev,
        [selectedBook.googleBookId]: { rating: newRating, count: newCount }
      }));
    }
  };

  // Function to get updated rating for a book
  const getBookRating = (book: any) => {
    const update = bookRatingUpdates[book.googleBookId];
    return update ? update.rating : book.averageRating;
  };

  // Function to get updated rating count for a book
  const getBookRatingCount = (book: any) => {
    const update = bookRatingUpdates[book.googleBookId];
    return update ? update.count : book.ratingsCount;
  };
  
  // Calculate pagination
  const totalPages = Math.ceil((discoverBooks?.length || 0) / booksPerPage);
  const startIndex = (currentPage - 1) * booksPerPage;
  const currentBooks = discoverBooks?.slice(startIndex, startIndex + booksPerPage) || [];
  
  // Pagination handlers
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Fetch favorites when user is logged in
  React.useEffect(() => {
    const fetchFavorites = async () => {
      if (!isLoggedIn) return;
      
      try {
        setFavoritesLoading(true);
        const favorites = await UserBookListService.getFavorites();
        
        // Deduplicate favorites that might appear multiple times
        const deduplicatedFavorites = (favorites || []).reduce((acc: any[], bookItem) => {
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
          }
          // If it exists, keep the first one and ignore duplicates
          
          return acc;
        }, []);
        
        setFavoriteBooks(deduplicatedFavorites); // Take all deduplicated favorites for horizontal scrolling
      } catch (error) {
        console.error('Error fetching favorites:', error);
        setFavoriteBooks([]);
      } finally {
        setFavoritesLoading(false);
      }
    };

    fetchFavorites();
  }, [isLoggedIn]);
  
  // Get currently reading book (first borrowed book) - only for logged in users
  const currentlyReading = isLoggedIn ? borrowedBooks?.content?.[0] : null;

  // Get to-read books (my books that aren't borrowed or read) - only for logged in users
  const toReadBooks = isLoggedIn ? (myBooks?.content?.filter(book => 
    !borrowedBooks?.content?.some(borrowed => borrowed.id === book.id) &&
    !readBooks?.content?.some(read => read.id === book.id)
  ).slice(0, 4) || []) : [];

  // favoriteBooks is now managed by state and useEffect above


  const renderBookCover = (book: any, style: React.CSSProperties = {}) => {
    if (book.cover) {
      return (
        <img
          src={typeof book.cover === 'string' && book.cover.startsWith('http') ? 
               book.cover : 
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
    padding: isMobile ? '12px' : '16px',
    borderRadius: '12px',
    border: '1px solid #E6D7C3',
    boxShadow: '0 4px 12px rgba(75, 63, 48, 0.1)',
    marginBottom: isMobile ? '16px' : '24px'
  };

  const headingStyle: React.CSSProperties = {
    fontFamily: 'Playfair Display, serif',
    fontSize: isMobile ? '18px' : isTablet ? '19px' : '20px',
    fontWeight: 600,
    color: '#4B3F30',
    marginBottom: isMobile ? '16px' : '24px'
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
        padding: isMobile ? '32px 0' : isTablet ? '48px 0' : '64px 0',
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '0 16px' : '0 24px' }}>
          <h1 style={{
            fontFamily: 'Playfair Display, serif',
            fontSize: isMobile ? '28px' : isTablet ? '36px' : '48px',
            fontWeight: 700,
            marginBottom: '16px'
          }}>
            {isLoggedIn ? 'Welcome Back to Your Literary Haven' : 'Welcome to BookNexus'}
          </h1>
          <p style={{
            fontSize: isMobile ? '14px' : isTablet ? '16px' : '20px',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '600px',
            margin: '0 auto 24px'
          }}>
            {isLoggedIn 
              ? 'Continue your reading journey in our cozy digital bookstore'
              : 'Discover, track, and share your reading journey. Join our community of book lovers!'
            }
          </p>
          {!isLoggedIn && (
            <Box sx={{ display: 'flex', gap: isMobile ? 1.5 : 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{
                  background: 'linear-gradient(45deg, #B8956A, #D2A441)',
                  color: 'white',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  px: isMobile ? 3 : 4,
                  py: isMobile ? 1.2 : 1.5,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: isMobile ? '14px' : '16px',
                  boxShadow: '0 2px 10px rgba(184, 149, 106, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #9D7F56, #B8956A)',
                    boxShadow: '0 4px 15px rgba(184, 149, 106, 0.4)'
                  }
                }}
              >
                Create Account
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/login')}
                sx={{
                  color: 'white',
                  borderColor: 'rgba(255, 255, 255, 0.5)',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  px: isMobile ? 3 : 4,
                  py: isMobile ? 1.2 : 1.5,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: isMobile ? '14px' : '16px',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'white'
                  }
                }}
              >
                Sign In
              </Button>
            </Box>
          )}
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '24px 16px' : isTablet ? '32px 20px' : '48px 24px' }}>
        {/* Favorites Section (only for logged-in users) */}
        {isLoggedIn && (
          <div style={{ marginBottom: '48px' }}>
            <h2 style={headingStyle}>My Favorites</h2>
            {favoritesLoading ? (
              <div style={{ ...cardStyle, display: 'flex', justifyContent: 'center', padding: '32px' }}>
                <CircularProgress sx={{ color: '#D2691E' }} size={24} />
              </div>
            ) : favoriteBooks.length > 0 ? (
              <div style={cardStyle}>
                <div style={{
                  display: 'flex',
                  gap: isMobile ? '12px' : '16px',
                  overflowX: 'auto',
                  paddingBottom: '4px',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#D2691E #F4E3C1',
                  WebkitOverflowScrolling: 'touch'
                } as React.CSSProperties}>
                  <style>{`
                    div::-webkit-scrollbar {
                      height: 6px;
                    }
                    div::-webkit-scrollbar-track {
                      background: #F4E3C1;
                      border-radius: 3px;
                    }
                    div::-webkit-scrollbar-thumb {
                      background: #D2691E;
                      border-radius: 3px;
                    }
                    div::-webkit-scrollbar-thumb:hover {
                      background: #B85A1A;
                    }
                  `}</style>
                  {favoriteBooks.map((bookListItem) => {
                    const book = bookListItem.book || bookListItem.googleBook;
                    return (
                      <div 
                        key={bookListItem.id}
                        style={{
                          cursor: 'pointer',
                          transition: 'transform 0.2s',
                          position: 'relative',
                          flexShrink: 0,
                          width: isMobile ? '100px' : '140px'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        onClick={() => handleBookDetailsClick(book)}
                      >
                        <div style={{
                          width: isMobile ? '100px' : '140px',
                          height: isMobile ? '150px' : '210px',
                          position: 'relative',
                          borderRadius: '8px',
                          overflow: 'hidden',
                          marginBottom: '8px'
                        }}>
                          {bookListItem.book?.cover || bookListItem.googleBook?.coverUrl ? (
                            <img
                              src={bookListItem.book?.cover ? 
                                (typeof bookListItem.book.cover === 'string' && bookListItem.book.cover.startsWith('http') ? 
                                  bookListItem.book.cover : 
                                  `data:image/jpeg;base64,${bookListItem.book.cover}`) :
                                bookListItem.googleBook?.coverUrl
                              }
                              alt={book?.title}
                              style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                borderRadius: '8px'
                              }}
                            />
                          ) : (
                            <div style={{
                              width: '100%',
                              height: '100%',
                              background: 'linear-gradient(135deg, #F4E3C1, #E6D7C3)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '8px'
                            }}>
                              <MenuBook style={{ color: '#8B7355', fontSize: '32px' }} />
                            </div>
                          )}
                          {/* Gold star indicator */}
                          <div style={{
                            position: 'absolute',
                            top: '6px',
                            left: '6px',
                            backgroundColor: '#FFD700',
                            borderRadius: '50%',
                            width: isMobile ? '22px' : '28px',
                            height: isMobile ? '22px' : '28px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(255, 215, 0, 0.4)'
                          }}>
                            <AutoStories style={{ fontSize: isMobile ? '12px' : '16px', color: '#B8860B' }} />
                          </div>
                        </div>
                        <div style={{
                          textAlign: 'center',
                          fontSize: isMobile ? '12px' : '14px',
                          fontWeight: 500,
                          color: '#4B3F30',
                          lineHeight: 1.3
                        }}>
                          {book?.title?.length > (isMobile ? 20 : 30) ? `${book.title.substring(0, isMobile ? 20 : 30)}...` : book?.title}
                        </div>
                        <div style={{
                          textAlign: 'center',
                          fontSize: isMobile ? '10px' : '12px',
                          color: '#6A5E4D',
                          marginTop: '4px'
                        }}>
                          {book?.authorName}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div style={{ ...cardStyle, textAlign: 'center' }}>
                <AutoStories style={{ color: '#FFD700', fontSize: '48px', marginBottom: '12px' }} />
                <p style={{ color: '#6A5E4D' }}>No favorites yet</p>
                <p style={{ color: '#8B7355', fontSize: '14px', marginTop: '8px' }}>
                  Visit your "My Books" page to add books to your favorites!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Friends Feed Section (only for logged-in users) */}
        {isLoggedIn && <FriendsFeed />}

        {/* Discover Books Section (visible to all users) */}
        <div>
          <h2 style={headingStyle}>Discover Books</h2>
          
          {discoverBooksLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
              <CircularProgress sx={{ color: '#D2691E' }} size={48} />
            </div>
          ) : discoverBooksError ? (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '48px' }}>
              <Alert severity="error" style={{ marginBottom: '16px' }}>
                Failed to load books from Google Books API
              </Alert>
              <p style={{ color: '#6A5E4D' }}>Please try again later</p>
            </div>
          ) : discoverBooks && discoverBooks.length > 0 ? (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile 
                  ? 'repeat(auto-fill, minmax(140px, 1fr))' 
                  : 'repeat(auto-fill, minmax(200px, 1fr))', // Back to original responsive grid
                gap: isMobile ? '16px' : '24px'
              }}>
                {currentBooks.map((book: any) => {
                  // Create book with updated rating data
                  const bookWithUpdatedRating = {
                    ...book,
                    averageRating: getBookRating(book),
                    ratingsCount: getBookRatingCount(book)
                  };

                  return (
                    <DiscoveryBookCard
                      key={book.id}
                      book={bookWithUpdatedRating}
                      showRating={true}
                      onViewDetails={handleBookDetailsClick}
                      source="google"
                    />
                  );
                })}
              </div>
              
              {/* Simple Pagination Controls */}
              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '12px',
                  marginTop: '32px'
                }}>
                  <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 16px',
                      backgroundColor: currentPage === 1 ? '#E6D7C3' : '#D2691E',
                      color: currentPage === 1 ? '#8B7355' : 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: 500,
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    <NavigateBefore style={{ fontSize: '16px' }} />
                    Previous
                  </button>
                  
                  <span style={{
                    color: '#4B3F30',
                    fontSize: '14px',
                    fontWeight: 500,
                    padding: '0 16px'
                  }}>
                    Page {currentPage} of {totalPages}
                  </span>
                  
                  <button
                    onClick={handleNextPage}
                    disabled={currentPage >= totalPages}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '10px 16px',
                      backgroundColor: currentPage >= totalPages ? '#E6D7C3' : '#D2691E',
                      color: currentPage >= totalPages ? '#8B7355' : 'white',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: 500,
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    Next
                    <NavigateNext style={{ fontSize: '16px' }} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              padding: '48px',
              borderRadius: '12px',
              border: '1px solid #E6D7C3',
              boxShadow: '0 4px 12px rgba(75, 63, 48, 0.1)',
              textAlign: 'center'
            }}>
              <MenuBook style={{ color: '#D2691E', fontSize: '48px', marginBottom: '12px' }} />
              <p style={{ color: '#6A5E4D' }}>No books available for discovery</p>
              <p style={{ color: '#8B7355', fontSize: '14px', marginTop: '8px' }}>
                Try searching for books instead!
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Book Details Modal */}
      <UnifiedBookDetailsModal
        book={selectedBook}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        context="discovery"
        onRatingUpdated={handleRatingUpdated}
      />
    </div>
  );
};

export default HomePage;