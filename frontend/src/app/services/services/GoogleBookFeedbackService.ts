import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export interface GoogleBookFeedbackRequest {
  googleBookId: string;
  bookTitle: string;
  authorName: string;
  rating: number;
  review: string;
  isAnonymous?: boolean;
}

export interface GoogleBookFeedbackResponse {
  id: number;
  googleBookId: string;
  bookTitle: string;
  authorName: string;
  rating: number;
  review: string;
  displayName: string;
  createdDate: number[]; // Backend returns array like [2025, 9, 4]
  anonymous: boolean; // Backend uses 'anonymous' not 'isAnonymous'
  userId?: string;
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

  /**
   * Get all Google Book feedback by user ID
   */
  public static async getFeedbackByUserId(userId: number): Promise<GoogleBookFeedbackResponse[]> {
    const result = await __request(OpenAPI, {
      method: 'GET',
      url: `/google-books/feedback/user/${userId}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return result as GoogleBookFeedbackResponse[];
  }

  /**
   * Update Google Book feedback
   */
  public static async updateFeedback(feedbackId: number, request: GoogleBookFeedbackRequest): Promise<number> {
    const result = await __request(OpenAPI, {
      method: 'PUT',
      url: `/google-books/feedback/${feedbackId}`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: request,
      mediaType: 'application/json',
    });

    return result as number;
  }

  /**
   * Delete Google Book feedback
   */
  public static async deleteFeedback(feedbackId: number): Promise<void> {
    await __request(OpenAPI, {
      method: 'DELETE',
      url: `/google-books/feedback/${feedbackId}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
