import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  IoTrendingUp,
  IoCafe,
  IoBook,
  IoHeart,
  IoStar,
  IoLibrary,
  IoAdd,
  IoArrowBack
} from 'react-icons/io5';
import PaginationControls from '../components/PaginationControls';
import { useBooks } from '../hooks/useBooks';
import { useBorrowedBooks } from '../hooks/useBorrowedBooks';
import { useMyBooks } from '../hooks/useMyBooks';
import { useReadBooks } from '../hooks/useReadBooks';
import { UnifiedSearchService } from '../services/unifiedSearchService';
import type { UnifiedSearchResponse } from '../app/services/models/UnifiedSearchResponse';
import type { GoogleBookSearchResult } from '../app/services/models/GoogleBookSearchResult';

const BookListPage: React.FC = () => {
  const { data: allBooks, loading: allBooksLoading, error: allBooksError, page, setPage, size, setSize } = useBooks();
  const { data: borrowedBooks, loading: borrowedLoading } = useBorrowedBooks();
  const { data: myBooks, loading: myBooksLoading } = useMyBooks();
  const { data: readBooks, loading: readBooksLoading } = useReadBooks();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UnifiedSearchResponse | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Get search query from URL parameters and perform search
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchParam = urlParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
      performSearch(searchParam);
    } else {
      setSearchQuery('');
      setSearchResults(null);
    }
  }, [location.search]);

  const performSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    
    try {
      const response = await UnifiedSearchService.searchBooks(query, 10, 20);
      setSearchResults(response);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchError('Search failed. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  };

  const handleAddGoogleBook = async (googleBook: GoogleBookSearchResult) => {
    try {
      await UnifiedSearchService.addBookFromGoogle(googleBook.googleId);
      // Show success message or refresh data
      alert('Book added to your library successfully!');
    } catch (error) {
      console.error('Failed to add book:', error);
      alert('Failed to add book to your library. It may already exist.');
    }
  };

  // Get currently reading book (first borrowed book)
  const currentlyReading = borrowedBooks?.content?.[0];

  // Get trending books (first 5 from all books)
  const trendingBooks = allBooks?.content?.slice(0, 5) || [];

  // Get to-read books (my books that aren't borrowed or read)
  const toReadBooks = myBooks?.content?.filter(book => 
    !borrowedBooks?.content?.some(borrowed => borrowed.id === book.id) &&
    !readBooks?.content?.some(read => read.id === book.id)
  ).slice(0, 4) || [];

  // Get favorite books (read books, first 4)
  const favoriteBooks = readBooks?.content?.slice(0, 4) || [];

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
        <IoBook className="text-amber-600 text-2xl" />
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

  // If there's a search query, show search results page
  if (searchQuery) {
  return (
      <div style={{ minHeight: '100vh', backgroundColor: '#FAF3E3' }}>
        {/* Search Results Header */}
        <div style={{
          background: 'linear-gradient(90deg, #4B3F30, #5D4A33, #4B3F30)',
          color: 'white',
          padding: '32px 0',
          textAlign: 'center'
        }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
            <h1 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '36px',
              fontWeight: 700,
              marginBottom: '16px'
            }}>
              Search Results
            </h1>
            <p style={{
              fontSize: '18px',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '16px'
            }}>
              Found {searchResults?.totalResults || 0} books for "{searchQuery}"
              {searchResults && (
                <span style={{ display: 'block', fontSize: '14px', marginTop: '4px' }}>
                  {searchResults.totalLocalResults} in your library, {searchResults.totalGoogleResults} from Google Books
                </span>
              )}
            </p>
            <button
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '6px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
              onClick={() => {
                setSearchQuery('');
                navigate('/books');
              }}
            >
              ← Back to Browse
            </button>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
          {searchLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
            </div>
          ) : searchError ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-md mx-auto">
                <p className="text-red-800">{searchError}</p>
              </div>
            </div>
          ) : searchResults && (searchResults.localBooks.length > 0 || searchResults.googleBooks.length > 0) ? (
            <div>
              {/* Local Books Section */}
              {searchResults.localBooks.length > 0 && (
                <div style={{ marginBottom: '48px' }}>
                  <h2 className="font-playfair text-3xl font-semibold text-amber-900 mb-6 flex items-center gap-3">
                    <IoBook className="text-orange-600" />
                    Your Library ({searchResults.localBooks.length})
                  </h2>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: '24px'
                  }}>
                    {searchResults.localBooks.map(book => (
                      <div key={book.id}>
                        <div 
                          style={{
                            ...cardStyle,
                            cursor: 'pointer',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            height: '100%'
                          }}
                          onMouseOver={(e) => {
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = '0 8px 25px rgba(75, 63, 48, 0.15)';
                          }}
                          onMouseOut={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(75, 63, 48, 0.1)';
                          }}
                          onClick={() => navigate(`/books/${book.id}`)}
                        >
                          {renderBookCover(book, { width: '100%', height: '192px', marginBottom: '16px' })}
                          <div>
                            <h4 style={{
                              fontFamily: 'Playfair Display, serif',
                              fontSize: '14px',
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
                            </h4>
                            <p style={{
                              color: '#6A5E4D',
                              marginBottom: '12px',
                              fontSize: '12px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}>
                              by {book.authorName}
                            </p>
                            <button 
                              style={{
                                ...buttonStyle,
                                width: '100%',
                                fontSize: '12px'
                              }}
                              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#B85A1A'}
                              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#D2691E'}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/books/${book.id}`);
                              }}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Google Books Section */}
              {searchResults.googleBooks.length > 0 && (
                <div>
                  <h2 className="font-playfair text-3xl font-semibold text-amber-900 mb-6 flex items-center gap-3">
                    <IoLibrary className="text-orange-600" />
                    Discover Books ({searchResults.googleBooks.length})
                  </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '24px'
            }}>
              {searchResults.googleBooks.map(book => (
                <div key={book.googleId}>
                  <div 
                    style={{
                      ...cardStyle,
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      height: '100%'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(75, 63, 48, 0.15)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(75, 63, 48, 0.1)';
                    }}
                    onClick={() => navigate(`/google-books/${book.googleId}`)}
                  >
                    {/* Google Book Cover */}
                    {book.thumbnailUrl ? (
                      <img 
                        src={book.thumbnailUrl} 
                  alt={book.title}
                        style={{ 
                          width: '100%', 
                          height: '192px', 
                          objectFit: 'cover', 
                          borderRadius: '8px', 
                          marginBottom: '16px' 
                        }} 
                />
              ) : (
                      <div style={{ 
                        width: '100%', 
                        height: '192px', 
                        backgroundColor: '#F4E3C1', 
                        borderRadius: '8px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        marginBottom: '16px' 
                      }}>
                        <p style={{ color: '#6A5E4D', fontSize: '12px', textAlign: 'center' }}>No Cover</p>
                      </div>
                    )}
                    
                    <div>
                      <h4 style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: '14px',
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
                      </h4>
                      <p style={{
                        color: '#6A5E4D',
                        marginBottom: '12px',
                        fontSize: '12px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        by {book.authorName}
                      </p>
                      <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
                        <button 
                          style={{
                            ...buttonStyle,
                            width: '100%',
                            fontSize: '12px',
                            backgroundColor: '#4B3F30'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3A2F23'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4B3F30'}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/google-books/${book.googleId}`);
                          }}
                        >
                          View Details
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddGoogleBook(book);
                          }}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-3 rounded-lg text-xs transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                          <IoAdd className="w-4 h-4" />
                          Add to Library
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    ) : (
            <div className="text-center py-12">
              <div className="bg-white/80 backdrop-blur-sm border border-amber-200/60 rounded-2xl shadow-lg shadow-amber-900/10 p-8 max-w-md mx-auto">
                <IoLibrary className="text-orange-600 text-6xl mx-auto mb-4" />
                <h3 className="font-playfair text-2xl font-semibold text-amber-900 mb-4">
                  No Books Found
                </h3>
                <p className="text-amber-700 mb-6">
                  We couldn't find any books matching "{searchQuery}". Try different keywords or browse our collection.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    navigate('/books');
                  }}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200"
                >
                  Browse All Books
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default homepage view
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
            <h2 className="font-playfair text-2xl font-semibold text-amber-900 mb-6">Currently Reading</h2>
            
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
                <IoCafe className="text-orange-600 text-5xl mb-3 mx-auto" />
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
              
              {allBooksLoading ? (
                <div style={{ ...cardStyle, display: 'flex', justifyContent: 'center', padding: '32px' }}>
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
                </div>
              ) : trendingBooks.length > 0 ? (
                <div style={cardStyle}>
                  <div style={{
                    display: 'flex',
                    gap: '16px',
                    overflowX: 'auto',
                    paddingBottom: '8px'
                  }}>
                    {trendingBooks.map((book) => (
                      <div 
                        key={book.id}
                        style={{
                          minWidth: '110px',
                          width: '110px',
                          height: '170px',
                          borderRadius: '8px',
                          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                          cursor: 'pointer',
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          padding: '8px',
                          transition: 'transform 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        onClick={() => navigate(`/books/${book.id}`)}
                      >
                        {renderBookCover(book, { width: '100%', height: '120px', marginBottom: '8px' })}
                        <h4 style={{
                          fontFamily: 'Playfair Display, serif',
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#4B3F30',
                          lineHeight: 1.2,
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}>
                          {book.title}
                        </h4>
                        <p style={{
                          color: '#6A5E4D',
                          fontSize: '10px',
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {book.authorName}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={{ ...cardStyle, textAlign: 'center' }}>
                  <IoTrendingUp className="text-orange-600 text-5xl mb-3 mx-auto" />
                  <p style={{ color: '#6A5E4D' }}>No trending books available</p>
                </div>
              )}
            </div>

            {/* From Friends Section */}
            <div>
              <h2 style={headingStyle}>From Friends</h2>
              <div style={{ ...cardStyle, textAlign: 'center' }}>
                <IoHeart className="text-orange-600 text-5xl mb-3 mx-auto" />
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
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto"></div>
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
                  <IoBook className="text-orange-600 text-5xl mb-3 mx-auto" />
                  <p style={{ color: '#6A5E4D' }}>Build your reading list</p>
                </div>
              )}
            </div>

            {/* Favorites Section */}
            <div>
              <h2 style={headingStyle}>Favorites</h2>
              {readBooksLoading ? (
                <div style={{ ...cardStyle, display: 'flex', justifyContent: 'center', padding: '32px' }}>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto"></div>
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
                  <IoStar className="text-yellow-500 text-5xl mb-3 mx-auto" />
                  <p style={{ color: '#6A5E4D' }}>No favorites yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* All Books Section */}
        {allBooksLoading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          </div>
        )}

        {allBooksError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">{allBooksError.message || String(allBooksError)}</p>
          </div>
        )}

        {allBooks?.content && allBooks.content.length > 0 && (
          <div>
            <h2 style={headingStyle}>Discover Books</h2>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: '24px'
            }}>
              {allBooks.content.map(book => (
                <div key={book.id}>
                  <div 
                    style={{
                      ...cardStyle,
                      cursor: 'pointer',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      height: '100%'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(75, 63, 48, 0.15)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(75, 63, 48, 0.1)';
                    }}
                    onClick={() => navigate(`/books/${book.id}`)}
                  >
                    {renderBookCover(book, { width: '100%', height: '192px', marginBottom: '16px' })}
                    <div>
                      <h4 style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: '14px',
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
                      </h4>
                      <p style={{
                        color: '#6A5E4D',
                        marginBottom: '12px',
                        fontSize: '12px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                  by {book.authorName}
                      </p>
                      <button 
                        style={{
                          ...buttonStyle,
                          width: '100%',
                          fontSize: '12px'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#B85A1A'}
                        onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#D2691E'}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/books/${book.id}`);
                  }}
                >
                  View Details
                      </button>
                    </div>
                  </div>
          </div>
        ))}
      </div>
            
            {allBooks && (
              <div style={{ marginTop: '48px' }}>
        <PaginationControls
          currentPage={page}
            totalPages={allBooks.totalPages || 0}
          onPageChange={setPage}
            onSizeChange={setSize}
        />
              </div>
            )}
          </div>
      )}
      </div>
    </div>
  );
};

export default BookListPage; 