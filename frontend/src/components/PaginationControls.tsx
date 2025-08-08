import React from 'react';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSizeChange: (size: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  onSizeChange
}) => {
  const handlePrevious = () => {
    if (currentPage > 0) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    onPageChange(page);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(0, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageClick(i)}
          className={`px-3 py-2 mx-1 rounded-lg transition-colors duration-200 ${
            i === currentPage
              ? 'bg-orange-600 text-white'
              : 'bg-white text-amber-800 border border-amber-300 hover:bg-amber-50'
          }`}
        >
          {i + 1}
        </button>
      );
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between mt-8 p-4 bg-white/80 backdrop-blur-sm border border-amber-200/60 rounded-xl">
      
      {/* Left side - Page size selector */}
      <div className="flex items-center gap-3">
        <span className="text-amber-800 text-sm font-medium">Items per page:</span>
        <select
          onChange={(e) => onSizeChange(Number(e.target.value))}
          className="px-3 py-1 border border-amber-300 rounded-lg bg-white text-amber-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          defaultValue={10}
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>

      {/* Center - Page navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={handlePrevious}
          disabled={currentPage === 0}
          className="flex items-center gap-1 px-3 py-2 bg-white text-amber-800 border border-amber-300 rounded-lg hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          <IoChevronBack className="w-4 h-4" />
          Previous
        </button>

        {renderPageNumbers()}

        <button
          onClick={handleNext}
          disabled={currentPage >= totalPages - 1}
          className="flex items-center gap-1 px-3 py-2 bg-white text-amber-800 border border-amber-300 rounded-lg hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          Next
          <IoChevronForward className="w-4 h-4" />
        </button>
      </div>

      {/* Right side - Page info */}
      <div className="text-amber-700 text-sm">
        Page {currentPage + 1} of {totalPages}
      </div>
    </div>
  );
};

export default PaginationControls;