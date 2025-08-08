import React, { useState } from 'react';
import { BookService } from '../app/services/services/BookService';

const AddBookPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [isbn, setIsbn] = useState('');
  const [synopsis, setSynopsis] = useState('');
  const [shareable, setShareable] = useState(true);
  const [cover, setCover] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !authorName || !isbn || !synopsis) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await BookService.saveBook({
        id: undefined,
        title,
        authorName,
        isbn,
        synopsis,
        shareable
      });
      setSuccess(true);
      // Reset form
      setTitle('');
      setAuthorName('');
      setIsbn('');
      setSynopsis('');
      setShareable(true);
      setCover(null);
    } catch (err: any) {
      setError(err?.body?.message || 'Failed to add book');
    } finally {
      setLoading(false);
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  return (
    <div className="min-h-screen bg-vintage-cream py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-playfair text-4xl font-bold text-amber-900 mb-2">
            Add New Book
          </h1>
          <p className="text-amber-700">Share a new book with the community</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">Book added successfully!</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white/80 backdrop-blur-sm border border-amber-200/60 rounded-2xl shadow-lg shadow-amber-900/10 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-amber-900 mb-1">
                Title *
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white/80 text-amber-900 placeholder-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter book title"
              />
            </div>

            {/* Author */}
            <div>
              <label htmlFor="authorName" className="block text-sm font-medium text-amber-900 mb-1">
                Author Name *
              </label>
              <input
                id="authorName"
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white/80 text-amber-900 placeholder-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter author name"
              />
            </div>

            {/* ISBN */}
            <div>
              <label htmlFor="isbn" className="block text-sm font-medium text-amber-900 mb-1">
                ISBN *
              </label>
              <input
                id="isbn"
                type="text"
                required
                value={isbn}
                onChange={(e) => setIsbn(e.target.value)}
                className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white/80 text-amber-900 placeholder-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter ISBN"
              />
            </div>

            {/* Synopsis */}
            <div>
              <label htmlFor="synopsis" className="block text-sm font-medium text-amber-900 mb-1">
                Synopsis *
              </label>
              <textarea
                id="synopsis"
                required
                rows={3}
                maxLength={255}
                value={synopsis}
                onChange={(e) => setSynopsis(e.target.value)}
                className="w-full px-3 py-2 border border-amber-300 rounded-lg bg-white/80 text-amber-900 placeholder-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 resize-none"
                placeholder="Enter book synopsis"
              />
              <p className={`text-xs mt-1 ${synopsis.length > 255 ? 'text-red-600' : 'text-amber-600'}`}>
                {synopsis.length}/255 characters
              </p>
            </div>

            {/* Shareable Checkbox */}
            <div className="flex items-center">
              <input
                id="shareable"
                type="checkbox"
                checked={shareable}
                onChange={(e) => setShareable(e.target.checked)}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-amber-300 rounded"
              />
              <label htmlFor="shareable" className="ml-2 block text-sm text-amber-900">
                Make this book shareable with other users
              </label>
            </div>

            {/* Cover Upload */}
            <div>
              <label className="block text-sm font-medium text-amber-900 mb-2">
                Book Cover
              </label>
              <div className="border-2 border-dashed border-amber-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setCover(e.target.files?.[0] || null)}
                  className="hidden"
                  id="cover-upload"
                />
                <label
                  htmlFor="cover-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors duration-200"
                >
                  Upload Cover
                </label>
                {cover && (
                  <p className="mt-2 text-sm text-amber-700">
                    Selected: {cover.name}
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-700 text-white font-medium py-3 px-6 rounded-lg hover:from-orange-700 hover:to-orange-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Adding Book...
                </div>
              ) : (
                'Add Book'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBookPage;