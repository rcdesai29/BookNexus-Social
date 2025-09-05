import { request as __request } from '../core/request';
import { OpenAPI } from '../core/OpenAPI';
import type { CancelablePromise } from '../core/CancelablePromise';

export interface UserBookList {
    id?: number;
    user?: {
        id?: number;
        fullName?: string;
        email?: string;
    };
    book?: {
        id?: number;
        title?: string;
        authorName?: string;
        cover?: string;
    };
    googleBook?: {
        id?: number;
        googleBookId?: string;
        title?: string;
        authorName?: string;
        coverUrl?: string;
        description?: string;
        averageRating?: number;
        ratingsCount?: number;
    };
    listType?: 'CURRENTLY_READING' | 'TBR' | 'READ';
    isActive?: boolean;
    isFavorite?: boolean;
    userRating?: number;
    userReview?: string;
    readingProgress?: number;
    createdDate?: string;
    lastModifiedDate?: string;
}

export class UserBookListService {
    /**
     * Add a Google Book to a user's list
     * @param googleBookId The Google Book ID
     * @param listType The list type (FAVORITE, CURRENTLY_READING, TBR, READ)
     * @returns UserBookList
     * @throws ApiError
     */
    public static async addGoogleBookToList(
        googleBookId: string,
        listType: 'CURRENTLY_READING' | 'TBR' | 'READ'
    ): Promise<UserBookList> {
        return __request(OpenAPI, {
            method: 'POST',
            url: `/user-book-lists/google-books/${googleBookId}/add`,
            query: {
                'listType': listType,
            },
        });
    }

    /**
     * Remove a Google Book from a user's list
     * @param googleBookId The Google Book ID
     * @param listType The list type (FAVORITE, CURRENTLY_READING, TBR, READ)
     * @returns void
     * @throws ApiError
     */
    public static async removeGoogleBookFromList(
        googleBookId: string,
        listType: 'CURRENTLY_READING' | 'TBR' | 'READ'
    ): Promise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: `/user-book-lists/google-books/${googleBookId}/remove`,
            query: {
                'listType': listType,
            },
        });
    }

    /**
     * Get all books in a specific list for the current user
     * @param listType The list type (FAVORITE, CURRENTLY_READING, TBR, READ)
     * @returns UserBookList[]
     * @throws ApiError
     */
    public static async getUserBooksByListType(
        listType: 'CURRENTLY_READING' | 'TBR' | 'READ'
    ): Promise<UserBookList[]> {
        return __request(OpenAPI, {
            method: 'GET',
            url: `/user-book-lists/list-type/${listType}`,
        });
    }

    /**
     * Get all books across all lists for the current user
     * @returns UserBookList[]
     * @throws ApiError
     */
    public static async getAllUserBooks(): Promise<UserBookList[]> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/user-book-lists/all',
        });
    }

    /**
     * Get user's favorite books
     * @returns UserBookList[]
     * @throws ApiError
     */
    public static async getFavorites(): Promise<UserBookList[]> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/user-book-lists/favorites',
        });
    }

    /**
     * Get user's currently reading books
     * @returns UserBookList[]
     * @throws ApiError
     */
    public static async getCurrentlyReading(): Promise<UserBookList[]> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/user-book-lists/currently-reading',
        });
    }

    /**
     * Get user's TBR (To Be Read) books
     * @returns UserBookList[]
     * @throws ApiError
     */
    public static async getTBR(): Promise<UserBookList[]> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/user-book-lists/tbr',
        });
    }

    /**
     * Get user's read books
     * @returns UserBookList[]
     * @throws ApiError
     */
    public static async getRead(): Promise<UserBookList[]> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/user-book-lists/read',
        });
    }

    /**
     * Update reading progress for a currently reading book
     * @param googleBookId The Google Book ID
     * @param progress Progress percentage (0-100)
     * @returns UserBookList
     * @throws ApiError
     */
    public static async updateReadingProgress(
        googleBookId: string,
        progress: number
    ): Promise<UserBookList> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: `/user-book-lists/google-books/${googleBookId}/progress`,
            query: {
                'progress': progress,
            },
        });
    }

    /**
     * Toggle favorite status for a Google Book
     * @param googleBookId The Google Book ID
     * @returns UserBookList
     * @throws ApiError
     */
    public static async toggleFavorite(googleBookId: string): Promise<UserBookList> {
        return __request(OpenAPI, {
            method: 'POST',
            url: `/user-book-lists/google-books/${googleBookId}/toggle-favorite`,
        });
    }
}
