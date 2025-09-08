import { Alert, Box, Button, CircularProgress, Rating, TextField, Typography, FormControlLabel, Checkbox } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { FeedbackService } from '../app/services/services/FeedbackService';
import ReviewThread from './ReviewThread';

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
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

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
      if (editingId) {
        await FeedbackService.updateFeedback(editingId, { bookId, review, rating: rating ?? undefined, isAnonymous });
        setEditingId(null);
      } else {
        await FeedbackService.saveFeedback({ bookId, review, rating: rating ?? undefined, isAnonymous });
      }
      setSuccess(true);
      setReview('');
      setRating(null);
      setIsAnonymous(false);
      fetchFeedbacks();
    } catch (err: any) {
      setSubmitError(err?.body?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };


  const handleCancel = () => {
    setEditingId(null);
    setReview('');
    setRating(null);
    setIsAnonymous(false);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>Reviews & Ratings</Typography>
      {loading && <CircularProgress />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box sx={{ mb: 3 }}>
        {feedbacks.map((fb, idx) => (
          <ReviewThread
            key={`${fb.id}-${idx}`}
            feedbackId={fb.id}
            reviewTitle={`Book Review`}
            reviewAuthor={fb.displayName || 'Anonymous'}
            reviewText={fb.review || ''}
            reviewDate={fb.createdDate ? new Date(fb.createdDate).toLocaleDateString() : ''}
            reviewRating={fb.rating}
            isOwnReview={fb.ownFeedback || false}
            isReviewAnonymous={fb.isAnonymous || false}
          />
        ))}
      </Box>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Typography variant="subtitle1">{editingId ? 'Edit Review' : 'Leave a Review'}</Typography>
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
        <FormControlLabel
          control={
            <Checkbox
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              sx={{ color: '#3C2A1E' }}
            />
          }
          label="Post anonymously"
          sx={{ mb: 1, color: '#3C2A1E' }}
        />
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button type="submit" variant="contained" disabled={submitting || !rating || !review}>
            {submitting ? 'Submitting...' : (editingId ? 'Update' : 'Submit')}
          </Button>
          {editingId && (
            <Button variant="outlined" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </Box>
        {submitError && <Alert severity="error" sx={{ mt: 1 }}>{submitError}</Alert>}
        {success && <Alert severity="success" sx={{ mt: 1 }}>
          {editingId ? 'Review updated!' : 'Feedback submitted!'}
        </Alert>}
      </Box>
    </Box>
  );
};

export default BookFeedback; 