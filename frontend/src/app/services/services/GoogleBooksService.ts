import { request as __request } from '../core/request';

export interface GoogleBookVolumeInfo {
  title: string;
  authors?: string[];
  description?: string;
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
  };
  publishedDate?: string;
  pageCount?: number;
  categories?: string[];
  averageRating?: number;
  ratingsCount?: number;
  industryIdentifiers?: Array<{
    type: string;
    identifier: string;
  }>;
}

export interface GoogleBookItem {
  id: string;
  volumeInfo: GoogleBookVolumeInfo;
}

export interface GoogleBooksResponse {
  items?: GoogleBookItem[];
  totalItems: number;
}

export class GoogleBooksService {
  private static readonly BASE_URL = 'https://www.googleapis.com/books/v1';
  private static readonly API_KEY = ''; // Google Books API doesn't require an API key for basic usage

  /**
   * Search for books using Google Books API
   */
  public static async searchBooks(
    query: string,
    maxResults: number = 20,
    startIndex: number = 0
  ): Promise<GoogleBooksResponse> {
    const queryParams = new URLSearchParams({
      q: query,
      maxResults: maxResults.toString(),
      startIndex: startIndex.toString(),
      key: this.API_KEY
    });

    // Use fetch directly for Google Books API to avoid CORS issues
    const response = await fetch(`${this.BASE_URL}/volumes?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  }

  /**
   * Get popular books by category
   */
  public static async getPopularBooks(
    category: string = 'fiction',
    maxResults: number = 20
  ): Promise<GoogleBooksResponse> {
    // Search for popular fiction books with better quality results
    const query = `subject:${category} bestseller`;
    return this.searchBooks(query, maxResults);
  }

  /**
   * Get trending books (recently published)
   */
  public static async getTrendingBooks(
    maxResults: number = 20
  ): Promise<GoogleBooksResponse> {
    const currentYear = new Date().getFullYear();
    const query = `publishedDate:${currentYear} fiction`;
    return this.searchBooks(query, maxResults);
  }

  /**
   * Get book details by Google Books ID
   */
  public static async getBookById(bookId: string): Promise<GoogleBookItem> {
    // Use fetch directly for Google Books API to avoid CORS issues
    const response = await fetch(`${this.BASE_URL}/volumes/${bookId}`);
    
    if (!response.ok) {
      throw new Error(`Google Books API error: ${response.status}`);
    }

    const result = await response.json();
    return result;
  }

  /**
   * Convert Google Book to our Book format
   */
  public static convertGoogleBookToBookFormat(googleBook: GoogleBookItem): any {
    const volumeInfo = googleBook.volumeInfo;
    const isbn = volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_13')?.identifier ||
                 volumeInfo.industryIdentifiers?.find(id => id.type === 'ISBN_10')?.identifier ||
                 '';

    return {
      id: googleBook.id,
      title: volumeInfo.title || 'Unknown Title',
      authorName: volumeInfo.authors?.join(', ') || 'Unknown Author',
      isbn: isbn,
      synopsis: volumeInfo.description || 'No description available.',
      cover: volumeInfo.imageLinks?.thumbnail || null,
      publishedDate: volumeInfo.publishedDate,
      pageCount: volumeInfo.pageCount,
      categories: volumeInfo.categories,
      averageRating: volumeInfo.averageRating || 0,
      ratingsCount: volumeInfo.ratingsCount || 0,
      isGoogleBook: true,
      googleBookId: googleBook.id
    };
  }
}
