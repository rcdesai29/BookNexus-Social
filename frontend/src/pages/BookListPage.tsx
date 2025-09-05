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
  Star,
  MenuBook
} from '@mui/icons-material';
import { useBooks } from '../hooks/useBooks';
import { useBorrowedBooks } from '../hooks/useBorrowedBooks';
import { useMyBooks } from '../hooks/useMyBooks';
import { useReadBooks } from '../hooks/useReadBooks';
import { useGoogleBooksSimple } from '../hooks/useGoogleBooksSimple';
import { UserBookListService } from '../app/services/services/UserBookListService';
import { useAuth } from '../hooks/useAuth';

const BookListPage: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  
  const { data: allBooks, loading: allBooksLoading, error: allBooksError, page, setPage, size, setSize } = useBooks();
  
  // Only fetch user data if logged in
  const { data: borrowedBooks, loading: borrowedLoading } = useBorrowedBooks();
  const { data: myBooks, loading: myBooksLoading } = useMyBooks();
  const { data: readBooks, loading: readBooksLoading } = useReadBooks();
  
  // Use Google Books for discovery
  const { data: discoverBooks, loading: discoverBooksLoading, error: discoverBooksError } = useGoogleBooksSimple('bestsellers', 20);

  // Get currently reading book (first borrowed book) - only for logged in users
  const currentlyReading = isLoggedIn ? borrowedBooks?.content?.[0] : null;

  // Get to-read books (my books that aren't borrowed or read) - only for logged in users
  const toReadBooks = isLoggedIn ? (myBooks?.content?.filter(book => 
    !borrowedBooks?.content?.some(borrowed => borrowed.id === book.id) &&
    !readBooks?.content?.some(read => read.id === book.id)
  ).slice(0, 4) || []) : [];

  // Get favorite books (read books, first 4) - only for logged in users
  const favoriteBooks = isLoggedIn ? (readBooks?.content?.slice(0, 4) || []) : [];

  // Handle adding Google Books to user lists
  const handleAddToUserList = async (googleBookId: string, listType: 'CURRENTLY_READING' | 'TBR' | 'READ') => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    try {
      await UserBookListService.addGoogleBookToList(googleBookId, listType);
      console.log(`Added book ${googleBookId} to ${listType} list`);
    } catch (error) {
      console.error('Failed to add book to list:', error);
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
            {isLoggedIn ? 'Welcome Back to Your Literary Haven' : 'Welcome to BookNexus'}
          </h1>
          <p style={{
            fontSize: '20px',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            {isLoggedIn 
              ? 'Continue your reading journey in our cozy digital bookstore'
              : 'Discover, track, and share your reading journey. Join our community of book lovers!'
            }
          </p>
          {!isLoggedIn && (
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mt: 3 }}>
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
        {/* 2-Column Layout for logged-in users, single column for guests */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isLoggedIn ? '1fr 1fr' : '1fr',
          gap: '32px',
          marginBottom: '48px'
        }}>
          
          {/* LEFT COLUMN — Currently Reading & To Read (only for logged in users) */}
          {isLoggedIn && (
          <div>
            {/* Currently Reading Section */}
            <div style={{ marginBottom: '32px' }}>
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

            {/* To Read Section */}
            <div>
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
          </div>
          )}

          {/* RIGHT COLUMN — Favorites & Quick Actions (only for logged in) */}
          {isLoggedIn && (
          <div>
            {/* Favorites Section */}
            <div style={{ marginBottom: '32px' }}>
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

                        {/* Quick Actions */}
            <div>
              <h2 style={headingStyle}>Quick Actions</h2>
              <div style={cardStyle}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr',
                  gap: '16px'
                }}>
                  <button
                    style={{
                      ...buttonStyle,
                      width: '100%',
                      padding: '16px',
                      fontSize: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#B85A1A'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#D2691E'}
                    onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                  >
                    <MenuBook style={{ fontSize: '24px' }} />
                    Browse Books
                  </button>
                </div>
              </div>
            </div>
          </div>
          )}
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
              {discoverBooks.map((book: any) => (
                <div 
                  key={book.id}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #E6D7C3',
                    boxShadow: '0 4px 12px rgba(75, 63, 48, 0.1)',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(75, 63, 48, 0.15)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(75, 63, 48, 0.1)';
                  }}
                >
                  {/* Book Cover */}
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
                        <MenuBook style={{ color: '#8B7355', fontSize: '48px' }} />
                      </div>
                    )}
                  </div>

                  {/* Book Info */}
                  <h3 style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '16px',
                    fontWeight: 600,
                    color: '#4B3F30',
                    marginBottom: '8px',
                    lineHeight: 1.3,
                    flex: 1
                  }}>
                    {book.title}
                  </h3>
                  <p style={{
                    color: '#6A5E4D',
                    fontSize: '14px',
                    marginBottom: '8px'
                  }}>
                    by {book.authorName}
                  </p>

                  {/* Rating */}
                  {book.averageRating && (
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                      <Star style={{ color: '#FFD700', fontSize: '16px', marginRight: '4px' }} />
                      <span style={{ fontSize: '14px', color: '#6A5E4D' }}>
                        {book.averageRating.toFixed(1)} ({book.ratingsCount || 0} ratings)
                      </span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {isLoggedIn ? (
                      <>
                        <button
                          style={{
                            ...buttonStyle,
                            fontSize: '12px',
                            padding: '8px',
                            backgroundColor: '#4CAF50'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#45a049'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4CAF50'}
                          onClick={() => handleAddToUserList(book.id, 'READ')}
                        >
                          Add to Read
                        </button>
                        <button
                          style={{
                            ...buttonStyle,
                            fontSize: '12px',
                            padding: '8px',
                            backgroundColor: '#2196F3'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1976D2'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2196F3'}
                          onClick={() => handleAddToUserList(book.id, 'TBR')}
                        >
                          Add to TBR
                        </button>
                      </>
                    ) : (
                      <button
                        style={{
                          ...buttonStyle,
                          fontSize: '12px',
                          padding: '8px',
                          backgroundColor: '#2196F3'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1976D2'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2196F3'}
                        onClick={() => navigate('/register')}
                      >
                        Sign up to Add
                      </button>
                    )}
                    <button
                      style={{
                        ...buttonStyle,
                        fontSize: '12px',
                        padding: '8px'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#B85A1A'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#D2691E'}
                      onClick={() => navigate(`/search?q=${encodeURIComponent(book.title)}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
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
    </div>
  );
};

export default BookListPage;