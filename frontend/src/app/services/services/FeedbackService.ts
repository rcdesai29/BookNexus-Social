/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FeedbackRequest } from '../models/FeedbackRequest';
import type { PageResponseFeedbackResponse } from '../models/PageResponseFeedbackResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class FeedbackService {
    /**
     * @param requestBody
     * @returns number OK
     * @throws ApiError
     */
    public static saveFeedback(
        requestBody: FeedbackRequest,
    ): CancelablePromise<number> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/feedbacks',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param bookId
     * @param page
     * @param size
     * @returns PageResponseFeedbackResponse OK
     * @throws ApiError
     */
    public static findAllFeedbacksByBook(
        bookId: number,
        page?: number,
        size: number = 10,
    ): CancelablePromise<PageResponseFeedbackResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/feedbacks/book/{book-id}',
            path: {
                'book-id': bookId,
            },
            query: {
                'page': page,
                'size': size,
            },
        });
    }
    /**
     * @param userId
     * @param page
     * @param size
     * @returns PageResponseFeedbackResponse OK
     * @throws ApiError
     */
    public static findAllFeedbacksByUser(
        userId: number,
        page?: number,
        size: number = 10,
    ): CancelablePromise<PageResponseFeedbackResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/feedbacks/user/{user-id}',
            path: {
                'user-id': userId,
            },
            query: {
                'page': page,
                'size': size,
            },
        });
    }
}
