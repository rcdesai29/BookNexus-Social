import React from 'react';
import { IoCheckmarkCircle, IoLibrary, IoStar } from 'react-icons/io5';
import PaginationControls from '../components/PaginationControls';
import { useReadBooks } from '../hooks/useReadBooks';

const ReadPage: React.FC = () => {
  const { data: readBooksData, loading, error, page, setPage, size, setSize } = useReadBooks();

  if (loading) {
    return (
      <div className="min-h-screen bg-vintage-cream flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vintage-cream py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-playfair text-4xl font-bold text-amber-900 mb-2 flex items-center gap-3">
            <IoCheckmarkCircle className="text-green-600" />
            Books You've Read
          </h1>
          <p className="text-amber-700">Your completed reading journey</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">Error loading your read books: {error.message}</p>
          </div>
        )}

        {/* Empty State */}
        {!readBooksData?.content?.length ? (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm border border-amber-200/60 rounded-2xl shadow-lg shadow-amber-900/10 p-12 max-w-md mx-auto">
              <IoLibrary className="text-green-600 text-6xl mx-auto mb-6" />
              <h3 className="font-playfair text-2xl font-semibold text-amber-900 mb-4">
                No Books Read Yet
              </h3>
              <p className="text-amber-700 mb-6">
                Start reading some books and mark them as read to see them here.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Books Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
              {readBooksData.content.map((borrowedBook) => (
                <div
                  key={borrowedBook.id}
                  className="bg-white/80 backdrop-blur-sm border border-amber-200/60 rounded-xl shadow-lg shadow-amber-900/10 p-4 transition-all duration-300 hover:shadow-xl hover:shadow-amber-900/20 hover:-translate-y-1"
                >
                  {/* Book Cover */}
                  <div className="mb-4">
                    {borrowedBook.cover ? (
                      <img
                        src={typeof borrowedBook.cover === 'string' && borrowedBook.cover.startsWith('http')
                          ? `http://localhost:8088/api/v1/books/cover/${borrowedBook.id}`
                          : `data:image/jpeg;base64,${borrowedBook.cover}`}
                        alt={borrowedBook.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-amber-100 rounded-lg flex items-center justify-center">
                        <IoLibrary className="text-amber-600 text-4xl" />
                      </div>
                    )}
                  </div>

                  {/* Read Badge */}
                  <div className="flex items-center gap-2 mb-3">
                    <IoCheckmarkCircle className="text-green-600 w-5 h-5" />
                    <span className="text-green-700 text-sm font-medium">Completed</span>
                  </div>

                  {/* Book Info */}
                  <div className="mb-4">
                    <h3 className="font-playfair text-lg font-semibold text-amber-900 mb-2 line-clamp-2">
                      {borrowedBook.title}
                    </h3>
                    <p className="text-amber-700 text-sm mb-2">
                      by {borrowedBook.authorName}
                    </p>
                    
                    {/* Read Count */}
                    {borrowedBook.readCount && borrowedBook.readCount > 1 && (
                      <p className="text-amber-600 text-xs">
                        Read {borrowedBook.readCount} times
                      </p>
                    )}
                  </div>

                  {/* Rating Placeholder */}
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <IoStar
                        key={i}
                        className={`w-4 h-4 ${
                          i < 0 ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-amber-600 text-xs ml-1">No rating</span>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <button
                      onClick={() => {/* TODO: Implement review functionality */}}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-3 rounded-lg text-sm transition-colors duration-200"
                    >
                      Write Review
                    </button>
                    <button
                      onClick={() => {/* TODO: Implement view details */}}
                      className="w-full bg-white border border-amber-300 text-amber-800 hover:bg-amber-50 font-medium py-2 px-3 rounded-lg text-sm transition-colors duration-200"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <PaginationControls
              currentPage={page}
              totalPages={readBooksData.totalPages || 0}
              onPageChange={setPage}
              onSizeChange={setSize}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default ReadPage;