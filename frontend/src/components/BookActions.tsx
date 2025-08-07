import { Alert, Button, Snackbar, Stack } from '@mui/material';
import React, { useState } from 'react';
import { BookService } from '../app/services/services/BookService';
import ReviewModal from './ReviewModal';

interface BookActionsProps {
  bookId: number;
  bookTitle: string;
  isBorrowed?: boolean;
  canApproveReturn?: boolean;
  isRead?: boolean;
  isOwner?: boolean;
}

const BookActions: React.FC<BookActionsProps> = ({ 
  bookId, 
  bookTitle, 
  isBorrowed, 
  canApproveReturn, 
  isRead, 
  isOwner 
}) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);

  const handleAction = async (action: 'borrow' | 'return' | 'approveReturn' | 'markRead' | 'markUnread' | 'addToTBR') => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (action === 'borrow') {
        await BookService.borrowBook(bookId);
        setMessage('Book added to Currently Reading!');
      } else if (action === 'return') {
        await BookService.returnBorrowBook(bookId);
        setMessage('Finished reading! Return request sent to owner.');
      } else if (action === 'approveReturn') {
        await BookService.approveReturnBorrowBook(bookId);
        setMessage('Return approved!');
      } else if (action === 'markRead') {
        // Show review modal instead of immediately marking as read
        setShowReviewModal(true);
        return; // Don't show success message yet
      } else if (action === 'markUnread') {
        await BookService.unmarkBookAsRead(bookId);
        setMessage('Book marked as unread!');
      } else if (action === 'addToTBR') {
        // TODO: Implement TBR functionality when API is available
        setMessage('TBR functionality coming soon!');
      }
    } catch (err: any) {
      setError(err?.body?.message || 'Action failed');
    } finally {
      setLoading(false);
      setOpen(true);
    }
  };

  const handleReviewSubmit = async (rating: number, review: string, isAnonymous: boolean) => {
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      // First mark the book as read
      await BookService.markBookAsRead(bookId);
      
      // TODO: Submit review to backend when API is available
      // await BookService.submitReview(bookId, rating, review, isAnonymous);
      
      // Close the review modal
      setShowReviewModal(false);
      
      // Show success message
      const reviewMessage = review.trim() ? ' Thanks for leaving a review!' : '';
      setMessage(`Congrats on reading "${bookTitle}"!${reviewMessage}`);
      
    } catch (err: any) {
      setError(err?.body?.message || 'Failed to mark book as read');
    } finally {
      setLoading(false);
      setOpen(true);
    }
  };

  const handleReviewSkip = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    
    try {
      await BookService.markBookAsRead(bookId);
      setShowReviewModal(false);
      setMessage(`Congrats on reading "${bookTitle}"!`);
    } catch (err: any) {
      setError(err?.body?.message || 'Failed to mark book as read');
    } finally {
      setLoading(false);
      setOpen(true);
    }
  };

  return (
    <>
      <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
        {!isBorrowed && !isOwner && <Button variant="contained" onClick={() => handleAction('borrow')} disabled={loading}>Start Reading</Button>}
        {!isBorrowed && !isOwner && <Button variant="outlined" onClick={() => handleAction('addToTBR')} disabled={loading}>Add to TBR</Button>}
        {isBorrowed && <Button variant="outlined" onClick={() => handleAction('return')} disabled={loading}>Finish Reading</Button>}
        {canApproveReturn && <Button variant="outlined" onClick={() => handleAction('approveReturn')} disabled={loading}>Approve Return</Button>}
        {isOwner && (
          <>
            {!isRead && <Button variant="outlined" color="primary" onClick={() => handleAction('markRead')} disabled={loading}>Mark as Read</Button>}
            {isRead && <Button variant="outlined" color="secondary" onClick={() => handleAction('markUnread')} disabled={loading}>Mark as Unread</Button>}
          </>
        )}
      </Stack>
      
      <ReviewModal
        open={showReviewModal}
        onClose={handleReviewSkip}
        onSubmit={handleReviewSubmit}
        bookTitle={bookTitle}
        loading={loading}
      />
      
      <Snackbar open={open} autoHideDuration={4000} onClose={() => setOpen(false)}>
        {error
          ? <Alert severity="error" onClose={() => setOpen(false)}>{error}</Alert>
          : message
            ? <Alert severity="success" onClose={() => setOpen(false)}>{message}</Alert>
            : undefined}
      </Snackbar>
    </>
  );
};

export default BookActions; 