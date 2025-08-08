import React, { useState } from 'react';
import { BookService } from '../app/services/services/BookService';
import ReviewModal from './ReviewModal';

interface BookActionsProps {
  bookId: number;
  onBorrow?: () => void;
  onReturn?: () => void;
  onReview?: () => void;
}

const BookActions: React.FC<BookActionsProps> = ({
  bookId,
  onBorrow,
  onReturn,
  onReview
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const handleBorrow = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await BookService.borrowBook(bookId);
      setSuccess('Book borrowed successfully!');
      onBorrow?.();
    } catch (err: any) {
      setError(err?.body?.message || 'Failed to borrow book');
    } finally {
      setLoading(false);
    }
  };

  const handleReturn = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await BookService.returnBorrowBook(bookId);
      setSuccess('Book returned successfully!');
      onReturn?.();
    } catch (err: any) {
      setError(err?.body?.message || 'Failed to return book');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = () => {
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = () => {
    setReviewModalOpen(false);
    onReview?.();
  };

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-green-800 text-sm">{success}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleBorrow}
          disabled={loading}
          className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {loading ? 'Processing...' : 'Borrow Book'}
        </button>

        <button
          onClick={handleReturn}
          disabled={loading}
          className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {loading ? 'Processing...' : 'Return Book'}
        </button>

        <button
          onClick={handleReview}
          disabled={loading}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Write Review
        </button>
      </div>

      {/* Review Modal */}
      <ReviewModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        onSubmit={handleReviewSubmit}
        bookId={bookId}
      />
    </div>
  );
};

export default BookActions;