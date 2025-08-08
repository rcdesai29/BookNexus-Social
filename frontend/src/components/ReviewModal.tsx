import React, { useState } from 'react';
import { IoClose, IoStar } from 'react-icons/io5';

interface ReviewModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;
  bookId: number;
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  open,
  onClose,
  onSubmit,
  bookId
}) => {
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setLoading(true);
    try {
      // TODO: Implement actual review submission
      console.log('Submitting review:', { bookId, rating, review, isAnonymous });
      onSubmit();
      onClose();
      // Reset form
      setRating(0);
      setReview('');
      setIsAnonymous(false);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
          
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-playfair text-xl font-semibold text-amber-900">
              Write a Review
            </h3>
            <button
              onClick={onClose}
              className="text-amber-600 hover:text-amber-800 transition-colors duration-200"
            >
              <IoClose className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Rating *
              </label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`w-8 h-8 ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:text-yellow-400 transition-colors duration-200`}
                  >
                    <IoStar className="w-full h-full" />
                  </button>
                ))}
              </div>
            </div>

            {/* Review Text */}
            <div>
              <label htmlFor="review" className="block text-sm font-medium text-amber-900 mb-2">
                Review (optional)
              </label>
              <textarea
                id="review"
                rows={4}
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your thoughts about this book..."
                className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white text-amber-900 placeholder-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none"
              />
            </div>

            {/* Anonymous Checkbox */}
            <div className="flex items-center">
              <input
                id="anonymous"
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-amber-300 rounded"
              />
              <label htmlFor="anonymous" className="ml-2 block text-sm text-amber-900">
                Post review anonymously
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-white border border-amber-300 text-amber-800 font-medium py-2 px-4 rounded-lg hover:bg-amber-50 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={rating === 0 || loading}
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;