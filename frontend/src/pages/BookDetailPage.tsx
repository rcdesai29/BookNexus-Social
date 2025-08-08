import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IoBook, IoArrowBack } from 'react-icons/io5';
import { useNavigate } from 'react-router-dom';
import type { BookResponse } from '../app/services/models/BookResponse';
import { BookService } from '../app/services/services/BookService';
import BookActions from '../components/BookActions';
import BookFeedback from '../components/BookFeedback';

const BookDetailPage: React.FC = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<BookResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (bookId) {
      fetchBook();
    }
  }, [bookId]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      const response = await BookService.findBookById(parseInt(bookId!));
      setBook(response);
    } catch (err: any) {
      setError(err?.body?.message || 'Failed to fetch book details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-vintage-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-vintage-cream p-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error || 'Book not found'}</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-white border border-amber-300 text-amber-800 px-4 py-2 rounded-lg hover:bg-amber-50 transition-colors duration-200"
          >
            <IoArrowBack />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vintage-cream">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-800 to-orange-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors duration-200 mb-6"
          >
            <IoArrowBack />
            Back
          </button>
          <h1 className="font-playfair text-4xl font-bold mb-2">
            {book.title}
          </h1>
          <p className="text-white/90 text-xl">
            by {book.authorName}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column - Book Cover and Actions */}
          <div className="lg:col-span-1">
            {/* Book Cover */}
            {book.cover ? (
              <img
                src={typeof book.cover === 'string' && book.cover.startsWith('http')
                  ? `http://localhost:8088/api/v1/books/cover/${book.id}`
                  : `data:image/jpeg;base64,${book.cover}`}
                alt={book.title}
                className="w-full max-w-sm mx-auto rounded-xl shadow-lg shadow-amber-900/20 mb-6"
              />
            ) : (
              <div className="w-full max-w-sm mx-auto aspect-[3/4] bg-amber-100 rounded-xl shadow-lg shadow-amber-900/20 mb-6 flex flex-col items-center justify-center">
                <IoBook className="text-amber-600 text-6xl mb-2" />
                <span className="text-amber-700">No Cover Available</span>
              </div>
            )}

            {/* Book Actions */}
            <BookActions
              bookId={book.id!}
              onBorrow={fetchBook}
              onReturn={fetchBook}
              onReview={fetchBook}
            />
          </div>

          {/* Right Column - Book Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Book Information */}
            <div className="bg-white/80 backdrop-blur-sm border border-amber-200/60 rounded-2xl shadow-lg shadow-amber-900/10 p-8">
              <h2 className="font-playfair text-2xl font-semibold text-amber-900 mb-6">
                Book Information
              </h2>

              <div className="grid gap-4">
                <div>
                  <p className="text-amber-700 text-sm">Author</p>
                  <p className="text-amber-900 font-medium">{book.authorName}</p>
                </div>
                
                {book.isbn && (
                  <div>
                    <p className="text-amber-700 text-sm">ISBN</p>
                    <p className="text-amber-900 font-medium">{book.isbn}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-amber-700 text-sm">Available</p>
                  <p className="text-amber-900 font-medium">
                    {book.shareable ? 'Yes' : 'No'}
                  </p>
                </div>
                
                {book.rate && (
                  <div>
                    <p className="text-amber-700 text-sm">Rating</p>
                    <p className="text-amber-900 font-medium">{book.rate}/5</p>
                  </div>
                )}
              </div>
            </div>

            {/* Synopsis */}
            {book.synopsis && (
              <div className="bg-white/80 backdrop-blur-sm border border-amber-200/60 rounded-2xl shadow-lg shadow-amber-900/10 p-8">
                <h2 className="font-playfair text-2xl font-semibold text-amber-900 mb-6">
                  Synopsis
                </h2>
                <p className="text-amber-800 leading-relaxed">
                  {book.synopsis}
                </p>
              </div>
            )}

            {/* Book Feedback */}
            <BookFeedback bookId={book.id!} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetailPage;