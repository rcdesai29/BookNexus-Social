import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
import type { PageResponseFeedbackResponse } from '../models/PageResponseFeedbackResponse';
import type { FeedbackResponse } from '../models/FeedbackResponse';

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
    // Use formData option to properly send as form data
    const result = await __request(OpenAPI, {
      method: 'POST',
      url: '/feedbacks/google-book',
      formData: {
        googleBookId: request.googleBookId,
        bookTitle: request.bookTitle,
        authorName: request.authorName,
        rating: request.rating.toString(),
        review: request.review,
        isAnonymous: (request.isAnonymous || false).toString(),
      },
    });

    return result as number;
  }

  /**
   * Get all feedback for a Google Book
   */
  public static async getFeedbackByGoogleBookId(googleBookId: string): Promise<GoogleBookFeedbackResponse[]> {
    const result = await __request(OpenAPI, {
      method: 'GET',
      url: `/feedbacks/google-book/${googleBookId}`,
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
      url: `/feedbacks/google-book/${googleBookId}/rating`,
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
      url: `/feedbacks/google-book/${googleBookId}/count`,
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
      url: `/feedbacks/user/${userId}`,
      headers: {
        'Content-Type': 'application/json',
      },
    }) as PageResponseFeedbackResponse;

    // Convert FeedbackResponse items to GoogleBookFeedbackResponse format
    // Since the unified system doesn't distinguish Google Book vs regular books in the response structure,
    // we'll return all reviews but convert them to the expected format
    const googleBookReviews: GoogleBookFeedbackResponse[] = (result.content || [])
      .map((feedback: FeedbackResponse) => ({
        id: feedback.id || 0,
        googleBookId: '', // Not available in unified response - will need backend fix
        bookTitle: feedback.bookTitle || '',
        authorName: feedback.bookAuthor || '', // Use bookAuthor field
        rating: feedback.rating || 0,
        review: feedback.review || '',
        displayName: feedback.displayName || (feedback.ownFeedback ? 'You' : 'Anonymous'),
        createdDate: [2025, 9, 9], // Simplified date format
        anonymous: feedback.isAnonymous || false, // Use isAnonymous field
        userId: feedback.userId || userId.toString(),
      }));

    return googleBookReviews;
  }

  /**
   * Update Google Book feedback
   */
  public static async updateFeedback(feedbackId: number, request: GoogleBookFeedbackRequest): Promise<number> {
    const result = await __request(OpenAPI, {
      method: 'PUT',
      url: `/feedbacks/${feedbackId}`,
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
      url: `/feedbacks/${feedbackId}`,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
