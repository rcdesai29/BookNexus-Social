import { Alert, Button, Card, CardActions, CardContent, CardMedia, CircularProgress, Container, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>To Be Read (TBR)</Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error.message || String(error)}</Alert>}
      
      {books.length === 0 && !loading && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Your TBR list is empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
            Browse books in the main library and add them to your TBR list.
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => navigate('/books')}
          >
            Browse Books
          </Button>
        </div>
      )}

      <div className="book-list-grid">
        {books.map(book => (
          <div className="book-list-card" key={book.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%', maxWidth: 280 }}>
              {book.cover ? (
                <CardMedia
                  component="img"
                  height="120"
                  image={typeof book.cover === 'string' && book.cover.startsWith('http') ? 
                         `http://localhost:8088/api/v1/books/cover/${book.id}` : 
                         `data:image/jpeg;base64,${book.cover}`}
                  alt={book.title}
                  sx={{ objectFit: 'contain' }}
                />
              ) : (
                <CardMedia
                  component="div"
                  sx={{ height: 120, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Typography variant="body2" color="text.secondary">
                    No Cover
                  </Typography>
                </CardMedia>
              )}
              <CardContent sx={{ flexGrow: 1, p: 1.5 }}>
                <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold', mb: 0.5, lineHeight: 1.2 }}>
                  {book.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  by {book.authorName}
                </Typography>
              </CardContent>
              <CardActions sx={{ p: 1.5, pt: 0 }}>
                <Button 
                  size="small" 
                  variant="contained" 
                  color="primary"
                  onClick={() => book.id && handleBorrowBook(book.id)}
                  sx={{ flex: 1, mr: 1 }}
                >
                  Borrow Now
                </Button>
                <Button 
                  size="small" 
                  variant="outlined" 
                  color="error"
                  onClick={() => book.id && handleRemoveFromTBR(book.id)}
                  sx={{ flex: 1 }}
                >
                  Remove
                </Button>
              </CardActions>
            </Card>
          </div>
        ))}
      </div>
    </Container>
  );
};

export default TBRPage; 