import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoBook, IoLibrary } from 'react-icons/io5';
import PaginationControls from '../components/PaginationControls';
import { useMyBooks } from '../hooks/useMyBooks';

const MyBooksPage: React.FC = () => {
  const navigate = useNavigate();
  const { data, loading, error, page, setPage, size, setSize } = useMyBooks();

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
            <IoLibrary className="text-orange-600" />
            My Books
          </h1>
          <p className="text-amber-700">Books in your personal library</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">Error loading your books: {error.message}</p>
          </div>
        )}

        {/* Empty State */}
        {!data?.content?.length ? (
          <div className="text-center py-16">
            <div className="bg-white/80 backdrop-blur-sm border border-amber-200/60 rounded-2xl shadow-lg shadow-amber-900/10 p-12 max-w-md mx-auto">
              <IoBook className="text-orange-600 text-6xl mx-auto mb-6" />
              <h3 className="font-playfair text-2xl font-semibold text-amber-900 mb-4">
                No Books Yet
              </h3>
              <p className="text-amber-700 mb-6">
                Start building your library by adding books you own or love.
              </p>
              <button
                onClick={() => navigate('/add-book')}
                className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200"
              >
                Add Your First Book
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Books Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
              {data.content.map((book) => (
                <div
                  key={book.id}
                  onClick={() => navigate(`/books/${book.id}`)}
                  className="bg-white/80 backdrop-blur-sm border border-amber-200/60 rounded-xl shadow-lg shadow-amber-900/10 p-4 transition-all duration-300 hover:shadow-xl hover:shadow-amber-900/20 hover:-translate-y-1 cursor-pointer"
                >
                  {/* Book Cover */}
                  <div className="mb-4">
                    {book.cover ? (
                      <img
                        src={typeof book.cover === 'string' && book.cover.startsWith('http')
                          ? `http://localhost:8088/api/v1/books/cover/${book.id}`
                          : `data:image/jpeg;base64,${book.cover}`}
                        alt={book.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-48 bg-amber-100 rounded-lg flex items-center justify-center">
                        <IoBook className="text-amber-600 text-4xl" />
                      </div>
                    )}
                  </div>

                  {/* Book Info */}
                  <div className="mb-4">
                    <h3 className="font-playfair text-lg font-semibold text-amber-900 mb-2 line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-amber-700 text-sm mb-2">
                      by {book.authorName}
                    </p>
                    {book.synopsis && (
                      <p className="text-amber-600 text-xs line-clamp-3">
                        {book.synopsis}
                      </p>
                    )}
                  </div>

                  {/* View Details Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/books/${book.id}`);
                    }}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-3 rounded-lg text-sm transition-colors duration-200"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <PaginationControls
              currentPage={page}
              totalPages={data.totalPages || 0}
              onPageChange={setPage}
              onSizeChange={setSize}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default MyBooksPage;