import { OpenAPI } from '../app/services/core/OpenAPI';
import { request as __request } from '../app/services/core/request';
import type { UnifiedSearchResponse } from '../app/services/models/UnifiedSearchResponse';

export class UnifiedSearchService {
  /**
   * Search books across local library and Google Books
   * @param query Search query
   * @param maxLocal Maximum local results (default: 10)
   * @param maxGoogle Maximum Google Books results (default: 20)
   * @returns UnifiedSearchResponse
   */
  public static searchBooks(
    query: string,
    maxLocal: number = 10,
    maxGoogle: number = 20
  ): Promise<UnifiedSearchResponse> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/books/search',
      query: {
        'q': query,
        'maxLocal': maxLocal,
        'maxGoogle': maxGoogle,
      },
    });
  }

  /**
   * Add a book from Google Books to user's library
   * @param googleId Google Books ID
   * @returns Book ID
   */
  public static addBookFromGoogle(googleId: string): Promise<number> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/books/add-from-google',
      query: {
        'googleId': googleId,
      },
    });
  }

  /**
   * Get a specific Google Book by ID
   * @param googleId Google Books ID
   * @returns GoogleBookSearchResult
   */
  public static getGoogleBookById(googleId: string): Promise<import('../app/services/models/GoogleBookSearchResult').GoogleBookSearchResult> {
    return __request(OpenAPI, {
      method: 'GET',
      url: `/books/google/${googleId}`,
    });
  }
}
