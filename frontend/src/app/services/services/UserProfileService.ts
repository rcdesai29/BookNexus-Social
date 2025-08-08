/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export interface UserProfileRequest {
    displayName?: string;
    bio?: string;
    location?: string;
    website?: string;
    twitterHandle?: string;
    instagramHandle?: string;
    goodreadsHandle?: string;
    profileVisibility?: 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS_ONLY';
    activityVisibility?: 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS_ONLY';
    reviewsVisibility?: 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS_ONLY';
    annualReadingGoal?: number;
    preferredFormat?: string;
    readingSpeed?: string;
}

export interface UserProfileResponse {
    userId: number;
    username: string;
    email: string;
    fullName: string;
    displayName: string;
    bio: string | null;
    location: string | null;
    website: string | null;
    avatarUrl: string | null;
    twitterHandle: string | null;
    instagramHandle: string | null;
    goodreadsHandle: string | null;
    profileVisibility: string;
    activityVisibility: string;
    reviewsVisibility: string;
    annualReadingGoal: number | null;
    preferredFormat: string | null;
    readingSpeed: string | null;
    booksRead: number;
    currentlyReading: number;
    wantToRead: number | null;
    averageRating: number | null;
    reviewsCount: number;
    followersCount: number;
    followingCount: number;
    memberSince: string;
    lastActive: string | null;
    isFollowing: boolean;
    isFollowedBy: boolean;
    isOwnProfile: boolean;
}

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    fullName: string;
}

export class UserProfileService {
    /**
     * @param userId
     * @returns UserProfileResponse OK
     * @throws ApiError
     */
    public static getUserProfile(
        userId: number,
    ): CancelablePromise<UserProfileResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/profiles/{userId}',
            path: {
                'userId': userId,
            },
        });
    }

    /**
     * @param userId
     * @param requestBody
     * @returns UserProfileResponse OK
     * @throws ApiError
     */
    public static updateUserProfile(
        userId: number,
        requestBody: UserProfileRequest,
    ): CancelablePromise<UserProfileResponse> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/profiles/{userId}',
            path: {
                'userId': userId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * @param userId
     * @returns string OK
     * @throws ApiError
     */
    public static followUser(
        userId: number,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/profiles/{userId}/follow',
            path: {
                'userId': userId,
            },
        });
    }

    /**
     * @param userId
     * @returns string OK
     * @throws ApiError
     */
    public static unfollowUser(
        userId: number,
    ): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/profiles/{userId}/follow',
            path: {
                'userId': userId,
            },
        });
    }

    /**
     * @param userId
     * @returns User OK
     * @throws ApiError
     */
    public static getFollowers(
        userId: number,
    ): CancelablePromise<Array<User>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/profiles/{userId}/followers',
            path: {
                'userId': userId,
            },
        });
    }

    /**
     * @param userId
     * @returns User OK
     * @throws ApiError
     */
    public static getFollowing(
        userId: number,
    ): CancelablePromise<Array<User>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/profiles/{userId}/following',
            path: {
                'userId': userId,
            },
        });
    }
}
