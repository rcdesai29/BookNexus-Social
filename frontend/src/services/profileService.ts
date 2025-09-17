import { tokenService } from './tokenService';
import { API_CONFIG } from '../config/api';

export interface UserProfile {
  userId: number;
  username: string;
  email: string;
  fullName: string;
  displayName: string;
  bio?: string;
  location?: string;
  website?: string;
  avatarUrl?: string;
  profileVisibility: 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS_ONLY';
  activityVisibility: 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS_ONLY';
  reviewsVisibility: 'PUBLIC' | 'PRIVATE' | 'FOLLOWERS_ONLY';
  booksRead: number;
  currentlyReading: number;
  reviewsCount: number;
  followersCount: number;
  followingCount: number;
  memberSince: string;
  isOwnProfile: boolean;
}

const BASE_URL = API_CONFIG.BASE_URL;

export const profileService = {
  async getCurrentUserProfile(): Promise<UserProfile> {
    const token = tokenService.getToken();
    const user = tokenService.getUser();
    
    if (!token || !user) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${BASE_URL}/profiles/${user.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async getUserProfile(userId: number): Promise<UserProfile> {
    const token = tokenService.getToken();

    const response = await fetch(`${BASE_URL}/profiles/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async searchUsers(displayName: string): Promise<UserProfile[]> {
    const token = tokenService.getToken();

    const response = await fetch(`${BASE_URL}/profiles/search?displayName=${encodeURIComponent(displayName)}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  },

  async checkDisplayNameAvailability(displayName: string): Promise<boolean> {
    const response = await fetch(`${BASE_URL}/profiles/check-display-name/${encodeURIComponent(displayName)}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }
};