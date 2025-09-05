import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Book as BookIcon
} from '@mui/icons-material';
import DiscoveryBookCard from '../components/DiscoveryBookCard';
import UnifiedBookDetailsModal from '../components/UnifiedBookDetailsModal';
import { GoogleBook } from '../hooks/useGoogleBooksSimple';
import { directApiService } from '../services/directApi';
import { GoogleBookFeedbackService } from '../app/services/services/GoogleBookFeedbackService';
import { BookService } from '../app/services/services/BookService';
import { UserBookListService } from '../app/services/services/UserBookListService';
import { useAuth } from '../hooks/useAuth';

const SearchPage: React.FC = () => {
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  
  // State for search
  const [searchTerm, setSearchTerm] = useState(query);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  
  // State for results
  const [combinedResults, setCombinedResults] = useState<any[]>([]);
  
  // Modal state
  const [selectedBook, setSelectedBook] = useState<GoogleBook | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  // Search function
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setCombinedResults([]);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    try {
      // Search local database
      const localResults = await BookService.findAllBooks(0, 50);
      const filteredLocalBooks = localResults.content?.filter(book => 
        book.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.authorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.isbn?.includes(searchQuery)
      ) || [];

      // Search Google Books API
      const googleResults = await directApiService.getGoogleBooks(searchQuery, 20);
      const convertedGoogleBooks = (googleResults.items || []).map((item: any) => {
        // Backend returns flattened structure, not wrapped in volumeInfo
        const isbn = item.isbn13 || item.isbn10 || 
                     item.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier ||
                     item.industryIdentifiers?.find((id: any) => id.type === 'ISBN_10')?.identifier ||
                     '';

        return {
          id: item.id,
          title: item.title || 'Unknown Title',
          authorName: item.authors?.join(', ') || 'Unknown Author',
          isbn: isbn,
          synopsis: item.description || 'No description available.',
          cover: item.imageLinks?.thumbnail || null,
          publishedDate: item.publishedDate,
          pageCount: item.pageCount,
          categories: item.categories,
          averageRating: item.averageRating || 0,
          ratingsCount: item.ratingsCount || 0,
          isGoogleBook: true,
          googleBookId: item.id
        };
      });

      // Filter Google Books to avoid duplicates and low-quality results
      const filteredGoogleBooks = convertedGoogleBooks.filter((book: GoogleBook) => {
        // Remove books with very low rating counts (but be more lenient)
        if (book.ratingsCount > 0 && book.ratingsCount < 5) return false;
        
        // Check if this Google Book is already in local database
        const isDuplicate = filteredLocalBooks.some(localBook => 
          localBook.isbn === book.isbn && book.isbn !== '' ||
          localBook.title?.toLowerCase() === book.title?.toLowerCase() &&
          localBook.authorName?.toLowerCase() === book.authorName?.toLowerCase()
        );
        
        return !isDuplicate;
      });

      // Store filtered results for combination

      // Combine and sort results
      const combined = [
        ...filteredLocalBooks.map(book => ({ ...book, source: 'local' })),
        ...filteredGoogleBooks.map((book: GoogleBook) => ({ ...book, source: 'google' }))
      ];

      // Sort by relevance (exact matches first, then partial matches)
      const sortedResults = combined.sort((a, b) => {
        const aTitle = a.title?.toLowerCase() || '';
        const bTitle = b.title?.toLowerCase() || '';
        const searchLower = searchQuery.toLowerCase();
        
        // Exact title match gets highest priority
        if (aTitle === searchLower && bTitle !== searchLower) return -1;
        if (bTitle === searchLower && aTitle !== searchLower) return 1;
        
        // Starts with search term gets second priority
        if (aTitle.startsWith(searchLower) && !bTitle.startsWith(searchLower)) return -1;
        if (bTitle.startsWith(searchLower) && !aTitle.startsWith(searchLower)) return 1;
        
        // Higher ratings get priority
        if (a.averageRating && b.averageRating) {
          return b.averageRating - a.averageRating;
        }
        
        // Local books get priority over Google books
        if (a.source === 'local' && b.source === 'google') return -1;
        if (b.source === 'local' && a.source === 'google') return 1;
        
        return 0;
      });

      setCombinedResults(sortedResults);

    } catch (error: any) {
      setSearchError(error?.message || 'Search failed');
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle search input
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchParams({ q: searchTerm.trim() });
      performSearch(searchTerm.trim());
    }
  };

  // Handle search on query change
  useEffect(() => {
    if (query) {
      setSearchTerm(query);
      performSearch(query);
    }
  }, [query, performSearch]);

  // Review modal handlers
  const handleReviewClick = (book: GoogleBook) => {
    // Check if user is logged in
    if (!isLoggedIn) {
      // Redirect to login page for guests
      navigate('/login');
      return;
    }
    
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

  const handleAddToUserList = async (googleBookId: string, listType: 'CURRENTLY_READING' | 'TBR' | 'READ') => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    try {
      await UserBookListService.addGoogleBookToList(googleBookId, listType);
    } catch (error) {
      console.error('Failed to add book to list:', error);
    }
  };

  const handleViewDetails = (book: GoogleBook) => {
    setSelectedBook(book);
    setIsReviewModalOpen(true);
  };

  // Render book card based on source
  const renderBookCard = (book: any) => {
    if (book.source === 'google') {
      return (
        <DiscoveryBookCard
          key={book.googleBookId}
          book={book}
          showRating={true}
          onViewDetails={handleViewDetails}
          source="google"
        />
      );
    } else {
      // Local book card
      return (
        <div
          key={book.id}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            padding: '16px',
            borderRadius: '12px',
            border: '1px solid #E6D7C3',
            boxShadow: '0 4px 12px rgba(75, 63, 48, 0.1)',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
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
          {book.cover ? (
            <img
              src={typeof book.cover === 'string' && book.cover.startsWith('http') ? 
                   `http://localhost:8088/api/v1/books/cover/${book.id}` : 
                   `data:image/jpeg;base64,${book.cover}`}
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
              background: 'linear-gradient(135deg, #F4E3C1, #E6D7C3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              marginBottom: '16px'
            }}>
              <BookIcon style={{ color: '#8B7355', fontSize: '48px' }} />
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
            <div style={{
              backgroundColor: '#D2691E',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: 500,
              display: 'inline-block'
            }}>
              In Library
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#FAF3E3' }}>
      {/* Header */}
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
            Search Books
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255, 255, 255, 0.9)',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Find books in our library and discover new ones from around the world
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px' }}>
        {/* Search Form */}
        <form onSubmit={handleSearch} style={{ marginBottom: '48px' }}>
          <div style={{
            display: 'flex',
            gap: '16px',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <SearchIcon style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#8B7355',
                fontSize: '20px'
              }} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, author, or ISBN..."
                style={{
                  width: '100%',
                  padding: '16px 16px 16px 48px',
                  border: '1px solid #E6D7C3',
                  borderRadius: '12px',
                  fontSize: '16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  color: '#4B3F30',
                  outline: 'none',
                  transition: 'all 0.2s'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#D2691E';
                  e.target.style.boxShadow = '0 0 0 3px rgba(210, 105, 30, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#E6D7C3';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm('');
                    setSearchParams({});
                  }}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#8B7355'
                  }}
                >
                  <ClearIcon />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={isSearching || !searchTerm.trim()}
              style={{
                backgroundColor: '#D2691E',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                padding: '16px 32px',
                fontSize: '16px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => {
                if (!isSearching && searchTerm.trim()) {
                  e.currentTarget.style.backgroundColor = '#B85A1A';
                }
              }}
              onMouseOut={(e) => {
                if (!isSearching && searchTerm.trim()) {
                  e.currentTarget.style.backgroundColor = '#D2691E';
                }
              }}
            >
              {isSearching ? (
                <>
                  <CircularProgress size={16} sx={{ color: 'white' }} />
                  Searching...
                </>
              ) : (
                <>
                  <SearchIcon />
                  Search
                </>
              )}
            </button>
          </div>
        </form>

        {/* Search Results */}
        {searchError && (
          <Alert severity="error" style={{ marginBottom: '32px' }}>
            {searchError}
          </Alert>
        )}

        {query && !isSearching && (
          <div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px'
            }}>
              <h2 style={{
                fontFamily: 'Playfair Display, serif',
                fontSize: '24px',
                fontWeight: 600,
                color: '#4B3F30'
              }}>
                Search Results for "{query}"
              </h2>
              <div style={{
                color: '#6A5E4D',
                fontSize: '14px'
              }}>
                {combinedResults.length} book{combinedResults.length !== 1 ? 's' : ''} found
              </div>
            </div>

            {combinedResults.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '24px'
              }}>
                {combinedResults.map(renderBookCard)}
              </div>
            ) : (
              <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                padding: '48px',
                borderRadius: '16px',
                border: '1px solid #E6D7C3',
                textAlign: 'center'
              }}>
                <BookIcon style={{ color: '#D2691E', fontSize: '64px', marginBottom: '16px' }} />
                <h3 style={{
                  fontFamily: 'Playfair Display, serif',
                  fontSize: '20px',
                  fontWeight: 600,
                  color: '#4B3F30',
                  marginBottom: '8px'
                }}>
                  No books found
                </h3>
                <p style={{ color: '#6A5E4D' }}>
                  Try searching with different keywords or check the spelling
                </p>
              </div>
            )}
          </div>
        )}

        {/* Search Tips */}
        {!query && (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(10px)',
            padding: '32px',
            borderRadius: '16px',
            border: '1px solid #E6D7C3'
          }}>
            <h3 style={{
              fontFamily: 'Playfair Display, serif',
              fontSize: '20px',
              fontWeight: 600,
              color: '#4B3F30',
              marginBottom: '16px'
            }}>
              Search Tips
            </h3>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '16px'
            }}>
              <div>
                <h4 style={{ color: '#4B3F30', marginBottom: '8px' }}>📚 Search by Title</h4>
                <p style={{ color: '#6A5E4D', fontSize: '14px' }}>
                  Try partial titles like "red rising" to find "Red Rising" and related books
                </p>
              </div>
              <div>
                <h4 style={{ color: '#4B3F30', marginBottom: '8px' }}>✍️ Search by Author</h4>
                <p style={{ color: '#6A5E4D', fontSize: '14px' }}>
                  Find all books by your favorite authors
                </p>
              </div>
              <div>
                <h4 style={{ color: '#4B3F30', marginBottom: '8px' }}>🔍 Search by ISBN</h4>
                <p style={{ color: '#6A5E4D', fontSize: '14px' }}>
                  Use ISBN numbers for exact book matches
                </p>
              </div>
              <div>
                <h4 style={{ color: '#4B3F30', marginBottom: '8px' }}>🌍 Global Search</h4>
                <p style={{ color: '#6A5E4D', fontSize: '14px' }}>
                  Results include both our library and books from around the world
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Book Details Modal */}
      <UnifiedBookDetailsModal
        book={selectedBook}
        isOpen={isReviewModalOpen}
        onClose={handleCloseReviewModal}
        context="discovery"
      />
    </div>
  );
};

export default SearchPage;
