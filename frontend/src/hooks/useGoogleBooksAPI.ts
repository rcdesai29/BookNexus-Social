import { useState } from 'react';
import { GoogleBook } from './useGoogleBooksSimple';
import { directApiService } from '../services/directApi';

export function useGoogleBooksAPI() {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  const getBookById = async (googleBookId: string): Promise<GoogleBook> => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the direct API service to get book details by ID
      const response = await directApiService.getBookById(googleBookId);
      
      // Transform the response to match our GoogleBook interface
      const bookData = response;
      
      // Extract image URL from the API response
      const imageUrl = bookData.imageLinks?.thumbnail || bookData.cover || bookData.imageUrl || null;
      
      const googleBook: GoogleBook = {
        id: bookData.id || googleBookId,
        title: bookData.title || 'Unknown Title',
        authorName: Array.isArray(bookData.authors) ? bookData.authors.join(', ') : (bookData.authorName || 'Unknown Author'),
        isbn: bookData.isbn13 || bookData.isbn10 || bookData.isbn || '',
        synopsis: bookData.description || bookData.synopsis || '',
        cover: imageUrl,
        imageUrl: imageUrl,
        publishedDate: bookData.publishedDate,
        pageCount: bookData.pageCount,
        categories: bookData.categories || [],
        averageRating: bookData.averageRating || 0,
        ratingsCount: bookData.ratingsCount || 0,
        isGoogleBook: true,
        googleBookId: googleBookId
      };

      return googleBook;
    } catch (err: any) {
      console.error('Failed to fetch book by ID:', err);
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    getBookById,
    loading,
    error
  };
}