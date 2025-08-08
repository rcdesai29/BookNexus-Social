import React, { useEffect, useState } from 'react';
import { IoStar } from 'react-icons/io5';
import { FeedbackService } from '../app/services/services/FeedbackService';
import type { FeedbackResponse } from '../app/services/models/FeedbackResponse';

interface BookFeedbackProps {
  bookId: number;
}

const BookFeedback: React.FC<BookFeedbackProps> = ({ bookId }) => {
  const [feedbacks, setFeedbacks] = useState<FeedbackResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadFeedbacks();
  }, [bookId]);

  const loadFeedbacks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await FeedbackService.findAllFeedbacksByBook(bookId, 0, 10);
      setFeedbacks(response.content || []);
    } catch (err: any) {
      setError('Failed to load feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setSubmitting(true);
    try {
      await FeedbackService.saveFeedback({
        bookId,
        review: review,
        rating
      });
      setRating(0);
      setReview('');
      loadFeedbacks(); // Reload feedbacks
    } catch (err: any) {
      setError('Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const renderStars = (currentRating: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type={interactive ? "button" : undefined}
            disabled={!interactive}
            onClick={interactive ? () => setRating(star) : undefined}
            className={`w-5 h-5 ${
              star <= currentRating ? 'text-yellow-400' : 'text-gray-300'
            } ${interactive ? 'hover:text-yellow-400 cursor-pointer' : 'cursor-default'} transition-colors duration-200`}
          >
            <IoStar className="w-full h-full" />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Submit New Feedback */}
      <div className="bg-white/80 backdrop-blur-sm border border-amber-200/60 rounded-2xl shadow-lg shadow-amber-900/10 p-6">
        <h3 className="font-playfair text-xl font-semibold text-amber-900 mb-4">
          Write a Review
        </h3>
        
        <form onSubmit={handleSubmitFeedback} className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-amber-900 mb-2">
              Your Rating *
            </label>
            {renderStars(rating, true)}
          </div>

          {/* Review Text */}
          <div>
            <label htmlFor="review" className="block text-sm font-medium text-amber-900 mb-2">
              Review
            </label>
            <textarea
              id="review"
              rows={3}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Share your thoughts about this book..."
              className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white text-amber-900 placeholder-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={rating === 0 || submitting}
            className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Existing Feedbacks */}
      <div className="bg-white/80 backdrop-blur-sm border border-amber-200/60 rounded-2xl shadow-lg shadow-amber-900/10 p-6">
        <h3 className="font-playfair text-xl font-semibold text-amber-900 mb-4">
          Reviews ({feedbacks.length})
        </h3>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        ) : feedbacks.length === 0 ? (
          <p className="text-amber-700 text-center py-8">
            No reviews yet. Be the first to review this book!
          </p>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((feedback, index) => (
              <div
                key={index}
                className="border-b border-amber-200 pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-amber-900">Anonymous</p>
                    <p className="text-xs text-amber-600">
                      Recent review
                    </p>
                  </div>
                  {renderStars(feedback.rating || 0)}
                </div>
                {feedback.review && (
                  <p className="text-amber-800 mt-2">{feedback.review}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BookFeedback;