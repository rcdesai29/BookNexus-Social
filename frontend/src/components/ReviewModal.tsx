import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Rating,
  FormControlLabel,
  Checkbox,
  Box,
  Typography,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import React, { useState } from 'react';

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (rating: number, review: string, isAnonymous: boolean) => void;
  bookTitle: string;
  loading?: boolean;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ 
  open, 
  onClose, 
  onSubmit, 
  bookTitle, 
  loading = false 
}) => {
  const [rating, setRating] = useState<number>(0);
  const [review, setReview] = useState<string>('');
  const [isAnonymous, setIsAnonymous] = useState<boolean>(false);

  const handleSubmit = () => {
    if (rating > 0) {
      onSubmit(rating, review, isAnonymous);
    }
  };

  const handleClose = () => {
    setRating(0);
    setReview('');
    setIsAnonymous(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Review "{bookTitle}"</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Typography component="legend" variant="subtitle1" sx={{ mb: 1 }}>
            Rating *
          </Typography>
          <Rating
            name="book-rating"
            value={rating}
            onChange={(_, newValue) => setRating(newValue || 0)}
            size="large"
            precision={1}
          />
          {rating > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              You rated this book {rating} star{rating !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>
        
        <TextField
          fullWidth
          multiline
          rows={4}
          label="Review (optional)"
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Share your thoughts about this book..."
          sx={{ mb: 2 }}
        />
        
        <FormControlLabel
          control={
            <Checkbox
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            />
          }
          label="Post review anonymously"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Skip
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={rating === 0 || loading}
        >
          {loading ? 'Submitting...' : 'Submit Review'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReviewModal;
