import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  IoArrowBack,
  IoAdd,
  IoBook,
  IoPerson,
  IoLayersOutline,
  IoCalendarOutline
} from 'react-icons/io5';
import { UnifiedSearchService } from '../services/unifiedSearchService';
import type { GoogleBookSearchResult } from '../app/services/models/GoogleBookSearchResult';

const GoogleBookDetailPage: React.FC = () => {
  const { googleId } = useParams<{ googleId: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<GoogleBookSearchResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    if (googleId) {
      fetchBookDetails();
    }
  }, [googleId]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const bookData = await UnifiedSearchService.getGoogleBookById(googleId!);
      setBook(bookData);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch book details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToLibrary = async () => {
    if (!book) return;
    
    try {
      setAdding(true);
      await UnifiedSearchService.addBookFromGoogle(book.googleId);
      // Navigate to the local book detail page
      // You might want to get the new book ID from the response and navigate there
      navigate('/books');
    } catch (err: any) {
      setError(err?.message || 'Failed to add book to library');
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-vintage-cream flex justify-center items-center">
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
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-amber-800 to-orange-700 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors duration-200 mb-6"
          >
            <IoArrowBack />
            Back to Search
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
          
          {/* Left Column - Book Cover and Action */}
          <div className="lg:col-span-1">
            {/* Book Cover */}
            {book.thumbnailUrl ? (
              <img
                src={book.thumbnailUrl}
                alt={book.title}
                className="w-full max-w-sm mx-auto rounded-xl shadow-lg shadow-amber-900/20 mb-6"
              />
            ) : (
              <div className="w-full max-w-sm mx-auto aspect-[3/4] bg-amber-100 rounded-xl shadow-lg shadow-amber-900/20 mb-6 flex flex-col items-center justify-center">
                <IoBook className="text-amber-600 text-6xl mb-2" />
                <span className="text-amber-700">No Cover Available</span>
              </div>
            )}

            {/* Action Button */}
            <button
              onClick={handleAddToLibrary}
              disabled={adding}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white font-medium py-3 px-6 rounded-lg hover:from-orange-700 hover:to-orange-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              <IoAdd className="w-5 h-5" />
              {adding ? 'Adding...' : 'Add to My Library'}
            </button>
          </div>

          {/* Right Column - Book Details */}
          <div className="lg:col-span-2">
            
            {/* Book Information */}
            <div className="bg-white/80 backdrop-blur-sm border border-amber-200/60 rounded-2xl shadow-lg shadow-amber-900/10 p-8 mb-8">
              <h2 className="font-playfair text-2xl font-semibold text-amber-900 mb-6">
                Book Information
              </h2>

              <div className="grid gap-6">
                
                {/* Author */}
                <div className="flex items-center gap-4">
                  <IoPerson className="text-orange-600 text-xl" />
                  <div>
                    <p className="text-amber-700 text-sm">Author</p>
                    <p className="text-amber-900 font-medium">{book.authorName}</p>
                  </div>
                </div>

                {/* Published Date */}
                {book.publishedDate && (
                  <div className="flex items-center gap-4">
                    <IoCalendarOutline className="text-orange-600 text-xl" />
                    <div>
                      <p className="text-amber-700 text-sm">Published</p>
                      <p className="text-amber-900 font-medium">{new Date(book.publishedDate).getFullYear()}</p>
                    </div>
                  </div>
                )}

                {/* Category */}
                {book.category && (
                  <div className="flex items-center gap-4">
                    <IoLayersOutline className="text-orange-600 text-xl" />
                    <div>
                      <p className="text-amber-700 text-sm">Category</p>
                      <span className="inline-block bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium">
                        {book.category}
                      </span>
                    </div>
                  </div>
                )}

                {/* ISBN */}
                {book.isbn && (
                  <div className="flex items-center gap-4">
                    <IoBook className="text-orange-600 text-xl" />
                    <div>
                      <p className="text-amber-700 text-sm">ISBN</p>
                      <p className="text-amber-900 font-medium">{book.isbn}</p>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Description */}
            {book.description && (
              <div className="bg-white/80 backdrop-blur-sm border border-amber-200/60 rounded-2xl shadow-lg shadow-amber-900/10 p-8">
                <h2 className="font-playfair text-2xl font-semibold text-amber-900 mb-6">
                  Description
                </h2>
                <p className="text-amber-800 leading-relaxed">
                  {book.description}
                </p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleBookDetailPage;