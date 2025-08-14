import { OpenAPI } from '../core/OpenAPI';
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
  private static readonly BASE_URL = '/google-books';

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
      startIndex: startIndex.toString()
    });

    const result = await __request(OpenAPI, {
      method: 'GET',
      url: `${this.BASE_URL}/search?${queryParams.toString()}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return result as GoogleBooksResponse;
  }

  /**
   * Get popular books by category
   */
  public static async getPopularBooks(
    category: string = 'fiction',
    maxResults: number = 20
  ): Promise<GoogleBooksResponse> {
    const queryParams = new URLSearchParams({
      category: category,
      maxResults: maxResults.toString()
    });

    const result = await __request(OpenAPI, {
      method: 'GET',
      url: `${this.BASE_URL}/popular?${queryParams.toString()}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return result as GoogleBooksResponse;
  }

  /**
   * Get trending books (recently published)
   */
  public static async getTrendingBooks(
    maxResults: number = 20
  ): Promise<GoogleBooksResponse> {
    const queryParams = new URLSearchParams({
      maxResults: maxResults.toString()
    });

    const result = await __request(OpenAPI, {
      method: 'GET',
      url: `${this.BASE_URL}/trending?${queryParams.toString()}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return result as GoogleBooksResponse;
  }

  /**
   * Get book details by Google Books ID
   */
  public static async getBookById(bookId: string): Promise<GoogleBookItem> {
    const result = await __request(OpenAPI, {
      method: 'GET',
      url: `${this.BASE_URL}/${bookId}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return result as GoogleBookItem;
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
