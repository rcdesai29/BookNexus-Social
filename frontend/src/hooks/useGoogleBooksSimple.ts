import { useEffect, useState } from 'react';
import { directApiService } from '../services/directApi';

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

export function useGoogleBooksSimple(
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
        console.log('Fetching books with query:', query);
        const response = await directApiService.getGoogleBooks(query, maxResults);

        const convertedBooks = (response.items || []).map((item: any) => {
          // Backend returns flattened structure, not wrapped in volumeInfo
          const isbn = item.isbn13 || item.isbn10 || 
                       item.industryIdentifiers?.find((id: any) => id.type === 'ISBN_13')?.identifier ||
                       item.industryIdentifiers?.find((id: any) => id.type === 'ISBN_10')?.identifier ||
                       '';

          return {
            id: item.id,
            title: item.title || 'Unknown Title',
            authorName: item.authors?.join(', ') || 'Unknown Author',
            isbn: isbn,
            synopsis: item.description || 'No description available.',
            cover: item.imageLinks?.thumbnail || null,
            publishedDate: item.publishedDate,
            pageCount: item.pageCount,
            categories: item.categories,
            averageRating: item.averageRating || 0,
            ratingsCount: item.ratingsCount || 0,
            isGoogleBook: true,
            googleBookId: item.id
          };
        });

        // Be very lenient with filtering to show more books
        const filteredBooks = convertedBooks.filter((book: GoogleBook) => 
          book.ratingsCount === 0 || book.ratingsCount >= 1
        );

        console.log('Converted books:', filteredBooks);
        setData(filteredBooks);
        setTotalItems(response.totalItems || filteredBooks.length);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [query, maxResults, startIndex]);

  return { data, loading, error, totalItems };
}