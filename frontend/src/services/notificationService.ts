import { tokenService } from './tokenService';
import { API_CONFIG } from '../config/api';

export interface NotificationResponse {
  id: number;
  type: 'NEW_FOLLOWER' | 'UNFOLLOWED' | 'REVIEW_LIKE' | 'REPLY_LIKE' | 'REVIEW_REPLY';
  message: string;
  triggerUserDisplayName?: string;
  triggerUserId?: number;
  isRead: boolean;
  createdDate: string;
  readAt?: string;
  relatedEntityType?: string;
  relatedEntityId?: number;
  bookTitle?: string;
  googleBookId?: string;
}

export interface NotificationCountResponse {
  unreadCount: number;
  totalCount: number;
}

export interface PageResponse<T> {
  content: T[];
  number: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

class NotificationService {
  private baseUrl = `${API_CONFIG.BASE_URL}/notifications`;

  private async apiCall(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = tokenService.getToken();
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }

  async getNotifications(page = 0, size = 20, unreadOnly = false): Promise<PageResponse<NotificationResponse>> {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      unreadOnly: unreadOnly.toString()
    });

    const response = await this.apiCall(`?${params}`);
    return response.json();
  }

  async getNotificationCounts(): Promise<NotificationCountResponse> {
    const response = await this.apiCall('/count');
    return response.json();
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await this.apiCall(`/${notificationId}/read`, {
      method: 'PUT'
    });
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await this.apiCall('/read-all', {
      method: 'PUT'
    });
  }

  async deleteNotification(notificationId: number): Promise<void> {
    await this.apiCall(`/${notificationId}`, {
      method: 'DELETE'
    });
  }
}

export const notificationService = new NotificationService();