import { Alert, Box, Button, CircularProgress, List, ListItem, ListItemText, Rating, TextField, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { FeedbackService } from '../app/services/services/FeedbackService';

interface BookFeedbackProps {
  bookId: number;
}

const BookFeedback: React.FC<BookFeedbackProps> = ({ bookId }) => {
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [review, setReview] = useState('');
  const [rating, setRating] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const fetchFeedbacks = () => {
    setLoading(true);
    FeedbackService.findAllFeedbacksByBook(bookId)
      .then(res => setFeedbacks(res.content || []))
      .catch(err => setError(err?.body?.message || 'Failed to load feedback'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFeedbacks();
    // eslint-disable-next-line
  }, [bookId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSuccess(false);
    setSubmitting(true);
    try {
      await FeedbackService.saveFeedback({ bookId, review, rating: rating ?? undefined });
      setSuccess(true);
      setReview('');
      setRating(null);
      fetchFeedbacks();
    } catch (err: any) {
      setSubmitError(err?.body?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>Reviews & Ratings</Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <List>
        {feedbacks.map((fb, idx) => (
          <ListItem key={idx} divider>
            <ListItemText
              primary={<Rating value={fb.rating} readOnly />} 
              secondary={fb.review}
            />
          </ListItem>
        ))}
      </List>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Typography variant="subtitle1">Leave a Review</Typography>
        <Rating
          value={rating}
          onChange={(_, value) => setRating(value)}
          precision={0.5}
          sx={{ mb: 1 }}
        />
        <TextField
          label="Review"
          value={review}
          onChange={e => setReview(e.target.value)}
          fullWidth
          multiline
          rows={2}
          sx={{ mb: 1 }}
        />
        <Button type="submit" variant="contained" disabled={submitting || !rating || !review}>
          {submitting ? 'Submitting...' : 'Submit'}
        </Button>
        {submitError && <Alert severity="error" sx={{ mt: 1 }}>{submitError}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 1 }}>Feedback submitted!</Alert>}
      </Box>
    </Box>
  );
};

export default BookFeedback; 