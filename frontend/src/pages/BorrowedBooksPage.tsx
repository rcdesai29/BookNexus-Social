import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Alert, Button, Card, CardActions, CardContent, CardMedia, CircularProgress, Container, Typography } from '@mui/material';
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

  return (
    <Container maxWidth="xl" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>Currently Reading</Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error">{error.message || String(error)}</Alert>}
      
      {books.length === 0 && !loading && (
        <Typography variant="body1" color="text.secondary">
          You haven't borrowed any books yet.
        </Typography>
      )}

      <div className="book-list-grid">
        {books.map(book => (
          <div className="book-list-card" key={book.id}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column', 
              width: '100%',
              maxWidth: 280,
              border: isBookRead(book) ? '2px solid #4caf50' : 'none'
            }}>
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
                  variant={isBookRead(book) ? "contained" : "outlined"}
                  color={isBookRead(book) ? "success" : "primary"}
                  startIcon={isBookRead(book) ? <CheckCircleIcon /> : undefined}
                  onClick={() => book.id && (isBookRead(book) ? handleUnmarkAsRead(book.id) : handleMarkAsRead(book.id))}
                  sx={{ flex: 1, mr: 1 }}
                >
                  {isBookRead(book) ? "Read ✓" : "Mark as Read"}
                </Button>
                <Button 
                  size="small" 
                  variant="outlined" 
                  color="secondary"
                  onClick={() => book.id && handleReturnBook(book.id)}
                  sx={{ flex: 1 }}
                >
                  Return
                </Button>
              </CardActions>
            </Card>
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
    </Container>
  );
};

export default BorrowedBooksPage; 