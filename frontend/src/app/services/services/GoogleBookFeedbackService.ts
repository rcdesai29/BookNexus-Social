import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export interface GoogleBookFeedbackRequest {
  googleBookId: string;
  bookTitle: string;
  authorName: string;
  rating: number;
  review: string;
}

export interface GoogleBookFeedbackResponse {
  id: number;
  googleBookId: string;
  bookTitle: string;
  authorName: string;
  rating: number;
  review: string;
  userName: string;
  createdDate: string;
}

export class GoogleBookFeedbackService {
  /**
   * Save feedback for a Google Book
   */
  public static async saveFeedback(request: GoogleBookFeedbackRequest): Promise<number> {
    const result = await __request(OpenAPI, {
      method: 'POST',
      url: '/google-books/feedback',
      headers: {
        'Content-Type': 'application/json',
      },
      body: request,
      mediaType: 'application/json',
    });

    return result as number;
  }

  /**
   * Get all feedback for a Google Book
   */
  public static async getFeedbackByGoogleBookId(googleBookId: string): Promise<GoogleBookFeedbackResponse[]> {
    const result = await __request(OpenAPI, {
      method: 'GET',
      url: `/google-books/feedback/${googleBookId}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return result as GoogleBookFeedbackResponse[];
  }

  /**
   * Get average rating for a Google Book
   */
  public static async getAverageRating(googleBookId: string): Promise<number> {
    const result = await __request(OpenAPI, {
      method: 'GET',
      url: `/google-books/feedback/${googleBookId}/rating`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return result as number;
  }

  /**
   * Get rating count for a Google Book
   */
  public static async getRatingCount(googleBookId: string): Promise<number> {
    const result = await __request(OpenAPI, {
      method: 'GET',
      url: `/google-books/feedback/${googleBookId}/count`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return result as number;
  }
}
