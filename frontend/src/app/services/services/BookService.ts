/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
import type { BookRequest } from '../models/BookRequest';
import type { BookResponse } from '../models/BookResponse';
import type { PageResponseBookResponse } from '../models/PageResponseBookResponse';
import type { PageResponseBorrowedBookResponse } from '../models/PageResponseBorrowedBookResponse';
export class BookService {
    /**
     * @param page
     * @param size
     * @returns PageResponseBookResponse OK
     * @throws ApiError
     */
    public static findAllBooks(
        page?: number,
        size: number = 10,
    ): CancelablePromise<PageResponseBookResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/books',
            query: {
                'page': page,
                'size': size,
            },
        });
    }
    /**
     * @param requestBody
     * @returns number OK
     * @throws ApiError
     */
    public static saveBook(
        requestBody: BookRequest,
    ): CancelablePromise<number> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/books',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * @param bookId
     * @param formData
     * @returns any OK
     * @throws ApiError
     */
    public static uploadBookCoverPicture(
        bookId: number,
        formData?: {
            file: Blob;
        },
    ): CancelablePromise<Record<string, any>> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/books/cover/{book-id}',
            path: {
                'book-id': bookId,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * @param bookId
     * @returns number OK
     * @throws ApiError
     */
    public static borrowBook(
        bookId: number,
    ): CancelablePromise<number> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/books/borrow/{book-id}',
            path: {
                'book-id': bookId,
            },
        });
    }
    /**
     * @param bookId
     * @returns number OK
     * @throws ApiError
     */
    public static updateShareableStatus(
        bookId: number,
    ): CancelablePromise<number> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/books/shareable/{book-id}',
            path: {
                'book-id': bookId,
            },
        });
    }
    /**
     * @param bookId
     * @returns number OK
     * @throws ApiError
     */
    public static returnBorrowBook(
        bookId: number,
    ): CancelablePromise<number> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/books/borrow/return/{book-id}',
            path: {
                'book-id': bookId,
            },
        });
    }
    /**
     * @param bookId
     * @returns number OK
     * @throws ApiError
     */
    public static approveReturnBorrowBook(
        bookId: number,
    ): CancelablePromise<number> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/books/borrow/return/approve/{book-id}',
            path: {
                'book-id': bookId,
            },
        });
    }
    /**
     * @param bookId
     * @returns number OK
     * @throws ApiError
     */
    public static updateArchivedStatus(
        bookId: number,
    ): CancelablePromise<number> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/books/archived/{book-id}',
            path: {
                'book-id': bookId,
            },
        });
    }
    /**
     * @param bookId
     * @returns BookResponse OK
     * @throws ApiError
     */
    public static findBookById(
        bookId: number,
    ): CancelablePromise<BookResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/books/{book-id}',
            path: {
                'book-id': bookId,
            },
        });
    }
    /**
     * @param page
     * @param size
     * @returns PageResponseBorrowedBookResponse OK
     * @throws ApiError
     */
    public static findAllReturnedBooks(
        page?: number,
        size: number = 10,
    ): CancelablePromise<PageResponseBorrowedBookResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/books/returned',
            query: {
                'page': page,
                'size': size,
            },
        });
    }
    /**
     * @param page
     * @param size
     * @returns PageResponseBookResponse OK
     * @throws ApiError
     */
    public static findAllBooksByOwner(
        page?: number,
        size: number = 10,
    ): CancelablePromise<PageResponseBookResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/books/owner',
            query: {
                'page': page,
                'size': size,
            },
        });
    }
    /**
     * @param page
     * @param size
     * @returns PageResponseBorrowedBookResponse OK
     * @throws ApiError
     */
    public static findAllBorrowedBooks(
        page?: number,
        size: number = 10,
    ): CancelablePromise<PageResponseBorrowedBookResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/books/borrowed',
            query: {
                'page': page,
                'size': size,
            },
        });
    }

    /**
     * @param bookId
     * @returns number OK
     * @throws ApiError
     */
    public static markBookAsRead(
        bookId: number,
    ): CancelablePromise<number> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/books/borrow/mark-read/{book-id}',
            path: {
                'book-id': bookId,
            },
        });
    }

    /**
     * @param bookId
     * @returns number OK
     * @throws ApiError
     */
    public static unmarkBookAsRead(
        bookId: number,
    ): CancelablePromise<number> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/books/borrow/mark-read/{book-id}/unmark',
            path: {
                'book-id': bookId,
            },
        });
    }

    /**
     * @param page
     * @param size
     * @returns PageResponseBorrowedBookResponse OK
     * @throws ApiError
     */
    public static findAllReadBooks(
        page?: number,
        size: number = 10,
    ): CancelablePromise<PageResponseBorrowedBookResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/books/read',
            query: {
                'page': page,
                'size': size,
            },
        });
    }
}
