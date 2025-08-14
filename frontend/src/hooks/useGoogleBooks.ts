import { useEffect, useState } from 'react';
import { GoogleBooksService, GoogleBooksResponse } from '../app/services/services/GoogleBooksService';

export interface GoogleBook {
  id: string;
  title: string;
  authorName: string;
  isbn: string;
  synopsis: string;
  cover: string | null;
  publishedDate?: string;
  pageCount?: number;
  categories?: string[];
  averageRating: number;
  ratingsCount: number;
  isGoogleBook: boolean;
  googleBookId: string;
}

export function useGoogleBooks(
  query: string = 'bestsellers',
  maxResults: number = 20,
  startIndex: number = 0
) {
  const [data, setData] = useState<GoogleBook[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<any>(null);
  const [totalItems, setTotalItems] = useState<number>(0);

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    const fetchBooks = async () => {
      try {
        let response: GoogleBooksResponse;
        
        if (query === 'trending') {
          response = await GoogleBooksService.getTrendingBooks(maxResults);
        } else if (query === 'popular') {
          response = await GoogleBooksService.getPopularBooks('fiction', maxResults);
        } else if (query === 'bestsellers') {
          // Search for popular books with high ratings and recent publications
          response = await GoogleBooksService.searchBooks('bestseller fiction 2024', maxResults, startIndex);
        } else {
          response = await GoogleBooksService.searchBooks(query, maxResults, startIndex);
        }

        const convertedBooks = (response.items || []).map(book => 
          GoogleBooksService.convertGoogleBookToBookFormat(book)
        );

        // Filter out books with very low rating counts to avoid showing fake-looking ratings
        const filteredBooks = convertedBooks.filter(book => 
          book.ratingsCount === 0 || book.ratingsCount >= 10
        );

        console.log('Google Books data:', {
          query,
          totalBooks: convertedBooks.length,
          filteredBooks: filteredBooks.length,
          booksWithRatings: convertedBooks.filter(b => b.averageRating > 0 && b.ratingsCount > 0).length,
          sampleBook: convertedBooks[0]
        });

        setData(filteredBooks);
        setTotalItems(response.totalItems);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [query, maxResults, startIndex]);

  return { data, loading, error, totalItems };
}

export function useTrendingBooks(maxResults: number = 5) {
  return useGoogleBooks('trending', maxResults);
}

export function usePopularBooks(maxResults: number = 10) {
  return useGoogleBooks('popular', maxResults);
}

export function useBestsellers(maxResults: number = 20) {
  return useGoogleBooks('bestsellers', maxResults);
}
