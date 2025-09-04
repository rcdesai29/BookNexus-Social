import { Alert, Box, Button, CircularProgress, List, ListItem, ListItemText, Rating, TextField, Typography, FormControlLabel, Checkbox, IconButton, Menu, MenuItem } from '@mui/material';
import { MoreVert as MoreVertIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import React, { useEffect, useState } from 'react';
import { FeedbackService } from '../app/services/services/FeedbackService';
import { useAuth } from '../hooks/useAuth';

interface BookFeedbackProps {
  bookId: number;
}

const BookFeedback: React.FC<BookFeedbackProps> = ({ bookId }) => {
  const { user } = useAuth();
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

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

  const handleEdit = (feedback: any) => {
    setEditingId(feedback.id);
    setReview(feedback.review);
    setRating(feedback.rating);
    setIsAnonymous(feedback.isAnonymous || false);
    setAnchorEl(null);
  };

  const handleDelete = async (feedbackId: number) => {
    try {
      await FeedbackService.deleteFeedback(feedbackId);
      setSuccess(true);
      fetchFeedbacks();
    } catch (err: any) {
      setSubmitError(err?.body?.message || 'Failed to delete feedback');
    }
    setAnchorEl(null);
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
      <List>
        {feedbacks.map((fb, idx) => (
          <ListItem key={idx} divider>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Rating value={fb.rating} readOnly />
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#3C2A1E' }}>
                      by {fb.displayName || 'Anonymous'}
                    </Typography>
                    {fb.createdDate && (
                      <Typography variant="caption" sx={{ color: '#8B7355' }}>
                        • {new Date(fb.createdDate).toLocaleDateString()}
                      </Typography>
                    )}
                  </Box>
                  {fb.ownFeedback && user && (
                    <>
                      <IconButton
                        size="small"
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                        sx={{ color: '#8B7355' }}
                      >
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                      >
                        <MenuItem onClick={() => handleEdit(fb)}>
                          <EditIcon sx={{ mr: 1 }} />
                          Edit
                        </MenuItem>
                        <MenuItem onClick={() => handleDelete(fb.id)} sx={{ color: 'error.main' }}>
                          <DeleteIcon sx={{ mr: 1 }} />
                          Delete
                        </MenuItem>
                      </Menu>
                    </>
                  )}
                </Box>
              } 
              secondary={fb.review}
            />
          </ListItem>
        ))}
      </List>
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