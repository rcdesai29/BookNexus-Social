import { Alert, Box, CircularProgress, Container, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { BookResponse } from '../app/services/models/BookResponse';
import type { BorrowedBookResponse } from '../app/services/models/BorrowedBookResponse';
import { BookService } from '../app/services/services/BookService';
import BookActions from '../components/BookActions';
import BookFeedback from '../components/BookFeedback';
import { tokenService } from '../services/tokenService';

const BookDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<BookResponse | null>(null);
  const [borrowedBook, setBorrowedBook] = useState<BorrowedBookResponse | null>(null);
  const [readBook, setReadBook] = useState<BorrowedBookResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // Get current user info
  const currentUser = tokenService.getUser();
  const isOwner = !!(book && currentUser && book.owner === currentUser.name);
  
  // Check if book is borrowed by current user
  const isBorrowed = !!borrowedBook;
  const canApproveReturn = !!(isOwner && borrowedBook && !borrowedBook.returned);
  const isRead = !!readBook;

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    
    const fetchBookData = async () => {
      try {
        // Fetch book details
        const bookData = await BookService.findBookById(Number(id));
        setBook(bookData);
        
        // Check if user is logged in before fetching status
        if (tokenService.isLoggedIn()) {
          try {
            // Check if book is borrowed by current user
            const borrowedBooks = await BookService.findAllBorrowedBooks(0, 1000);
            const borrowed = borrowedBooks.content?.find(b => b.id === Number(id));
            if (borrowed) {
              setBorrowedBook(borrowed);
            }
            
            // Check if book is in read list
            const readBooks = await BookService.findAllReadBooks(0, 1000);
            const read = readBooks.content?.find(b => b.id === Number(id));
            if (read) {
              setReadBook(read);
            }
          } catch (statusError) {
            // Ignore status errors - book might not be borrowed/read
            console.log('Could not fetch book status:', statusError);
          }
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchBookData();
  }, [id]);

  if (loading) return <Container sx={{ mt: 4 }}><CircularProgress /></Container>;
  if (error) return <Container sx={{ mt: 4 }}><Alert severity="error">{error.message || String(error)}</Alert></Container>;
  if (!book) return <Container sx={{ mt: 4 }}><Alert severity="info">Book not found.</Alert></Container>;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>{book.title}</Typography>
      <Typography variant="subtitle1" gutterBottom>by {book.authorName}</Typography>
      <Typography variant="body1" gutterBottom>ISBN: {book.isbn}</Typography>
      <Typography variant="body2" gutterBottom>{book.synopsis}</Typography>
      <Box sx={{ mt: 2 }}>
        <BookActions 
          bookId={book.id!} 
          bookTitle={book.title!}
          isBorrowed={isBorrowed} 
          canApproveReturn={canApproveReturn}
          isOwner={isOwner}
          isRead={isRead}
        />
      </Box>
      <BookFeedback bookId={book.id!} />
    </Container>
  );
};

export default BookDetailPage; 