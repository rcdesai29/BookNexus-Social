import React, { useState } from 'react';
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
  MenuBook
} from '@mui/icons-material';
import { useGoogleBooksSimple } from '../hooks/useGoogleBooksSimple';
import { useBorrowedBooks } from '../hooks/useBorrowedBooks';
import { useMyBooks } from '../hooks/useMyBooks';
import { useReadBooks } from '../hooks/useReadBooks';
import { useAuth } from '../hooks/useAuth';
import DiscoveryBookCard from '../components/DiscoveryBookCard';
import UnifiedBookDetailsModal from '../components/UnifiedBookDetailsModal';
import { UserBookListService } from '../app/services/services/UserBookListService';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  
  // Only fetch user data if logged in
  const { data: borrowedBooks, loading: borrowedLoading } = useBorrowedBooks();
  const { data: myBooks, loading: myBooksLoading } = useMyBooks(); 
  const { data: readBooks, loading: readBooksLoading } = useReadBooks();
  
  // Favorites state
  const [favoriteBooks, setFavoriteBooks] = useState<any[]>([]);
  const [favoritesLoading, setFavoritesLoading] = useState(false);
  
  // Always fetch discovery books (works for guests too)
  const { data: discoverBooks, loading: discoverBooksLoading, error: discoverBooksError } = useGoogleBooksSimple('bestsellers', 20);
  
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
            {isLoggedIn ? 'Welcome Back to Your Literary Haven' : 'Welcome to BookNexus'}
          </h1>
          <p style={{
            fontSize: '20px',
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
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                onClick={() => navigate('/register')}
                sx={{
                  background: 'linear-gradient(45deg, #B8956A, #D2A441)',
                  color: 'white',
                  fontFamily: 'Inter, sans-serif',
                  fontWeight: 500,
                  px: 4,
                  py: 1.5,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: '16px',
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
                  px: 4,
                  py: 1.5,
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontSize: '16px',
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

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
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
                  gap: '16px',
                  overflowX: 'auto',
                  paddingBottom: '4px',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#D2691E #F4E3C1'
                }}>
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
                          width: '140px'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        onClick={() => handleBookDetailsClick(book)}
                      >
                        <div style={{
                          width: '140px',
                          height: '210px',
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
                            <AutoStories style={{ fontSize: '16px', color: '#B8860B' }} />
                          </div>
                        </div>
                        <div style={{
                          textAlign: 'center',
                          fontSize: '14px',
                          fontWeight: 500,
                          color: '#4B3F30',
                          lineHeight: 1.3
                        }}>
                          {book?.title?.length > 30 ? `${book.title.substring(0, 30)}...` : book?.title}
                        </div>
                        <div style={{
                          textAlign: 'center',
                          fontSize: '12px',
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
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '24px'
            }}>
              {discoverBooks.map((book: any) => {
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
          ) : (
            <div style={{ ...cardStyle, textAlign: 'center', padding: '48px' }}>
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