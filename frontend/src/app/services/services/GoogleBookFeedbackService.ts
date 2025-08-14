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
  private static readonly BASE_URL = 'http://localhost:8088/api/v1/google-books';

  /**
   * Save feedback for a Google Book
   */
  public static async saveFeedback(request: GoogleBookFeedbackRequest): Promise<number> {
    const result = await __request<number>({
      method: 'POST',
      path: `${this.BASE_URL}/feedback`,
      headers: {
        'Content-Type': 'application/json',
      },
      body: request,
    });

    return result;
  }

  /**
   * Get all feedback for a Google Book
   */
  public static async getFeedbackByGoogleBookId(googleBookId: string): Promise<GoogleBookFeedbackResponse[]> {
    const result = await __request<GoogleBookFeedbackResponse[]>({
      method: 'GET',
      path: `${this.BASE_URL}/feedback/${googleBookId}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return result;
  }

  /**
   * Get average rating for a Google Book
   */
  public static async getAverageRating(googleBookId: string): Promise<number> {
    const result = await __request<number>({
      method: 'GET',
      path: `${this.BASE_URL}/feedback/${googleBookId}/rating`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return result;
  }

  /**
   * Get rating count for a Google Book
   */
  public static async getRatingCount(googleBookId: string): Promise<number> {
    const result = await __request<number>({
      method: 'GET',
      path: `${this.BASE_URL}/feedback/${googleBookId}/count`,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return result;
  }
}
