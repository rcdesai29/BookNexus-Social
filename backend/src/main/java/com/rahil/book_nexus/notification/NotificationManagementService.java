package com.rahil.book_nexus.notification;

import com.rahil.book_nexus.common.PageResponse;
import com.rahil.book_nexus.user.UserProfile;
import com.rahil.book_nexus.user.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationManagementService {
    
    private final PersistentNotificationRepository notificationRepository;
    private final UserProfileRepository userProfileRepository;
    
    /**
     * Get notifications for a user with pagination
     */
    public PageResponse<NotificationResponse> getUserNotifications(Integer userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PersistentNotification> notifications = notificationRepository.findByRecipientUserId(userId, pageable);
        
        List<NotificationResponse> responses = notifications.getContent().stream()
                .map(this::mapToResponse)
                .toList();
        
        return new PageResponse<>(
                responses,
                notifications.getNumber(),
                notifications.getSize(),
                notifications.getTotalElements(),
                notifications.getTotalPages(),
                notifications.isFirst(),
                notifications.isLast()
        );
    }
    
    /**
     * Get unread notifications for a user
     */
    public PageResponse<NotificationResponse> getUnreadNotifications(Integer userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<PersistentNotification> notifications = notificationRepository.findUnreadByRecipientUserId(userId, pageable);
        
        List<NotificationResponse> responses = notifications.getContent().stream()
                .map(this::mapToResponse)
                .toList();
        
        return new PageResponse<>(
                responses,
                notifications.getNumber(),
                notifications.getSize(),
                notifications.getTotalElements(),
                notifications.getTotalPages(),
                notifications.isFirst(),
                notifications.isLast()
        );
    }
    
    /**
     * Get notification counts for a user
     */
    public NotificationCountResponse getNotificationCounts(Integer userId) {
        long unreadCount = notificationRepository.countUnreadByRecipientUserId(userId);
        return NotificationCountResponse.builder()
                .unreadCount(unreadCount)
                .totalCount(unreadCount) // For now, we'll just return unread count as total
                .build();
    }
    
    /**
     * Mark a specific notification as read
     */
    @Transactional
    public boolean markNotificationAsRead(Integer notificationId, Integer userId) {
        int updated = notificationRepository.markAsRead(notificationId, userId, LocalDateTime.now());
        log.info("Marked notification {} as read for user {}: {}", notificationId, userId, updated > 0);
        return updated > 0;
    }
    
    /**
     * Mark all notifications as read for a user
     */
    @Transactional
    public long markAllNotificationsAsRead(Integer userId) {
        int updated = notificationRepository.markAllAsRead(userId, LocalDateTime.now());
        log.info("Marked {} notifications as read for user {}", updated, userId);
        return updated;
    }
    
    /**
     * Delete a specific notification (only if owned by user)
     */
    @Transactional
    public boolean deleteNotification(Integer notificationId, Integer userId) {
        int deleted = notificationRepository.deleteByIdAndUserId(notificationId, userId);
        log.info("Deleted notification {} for user {}: {}", notificationId, userId, deleted > 0);
        return deleted > 0;
    }
    
    /**
     * Cleanup old notifications (scheduled task could call this)
     */
    @Transactional
    public void cleanupOldNotifications(int daysToKeep) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(daysToKeep);
        notificationRepository.deleteOldNotifications(cutoff);
        log.info("Cleaned up notifications older than {} days", daysToKeep);
    }
    
    private NotificationResponse mapToResponse(PersistentNotification notification) {
        String triggerUserDisplayName = null;
        Integer triggerUserId = null;
        
        if (notification.getTriggerUser() != null) {
            triggerUserId = notification.getTriggerUser().getId();
            UserProfile triggerProfile = userProfileRepository.findByUserId(triggerUserId).orElse(null);
            triggerUserDisplayName = (triggerProfile != null && triggerProfile.getDisplayName() != null)
                    ? triggerProfile.getDisplayName()
                    : notification.getTriggerUser().getFullName();
        }
        
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .message(notification.getMessage())
                .triggerUserDisplayName(triggerUserDisplayName)
                .triggerUserId(triggerUserId)
                .isRead(notification.getIsRead())
                .createdDate(notification.getCreatedDate() != null ? 
                    notification.getCreatedDate().atStartOfDay() : null)
                .readAt(notification.getReadAt())
                .relatedEntityType(notification.getRelatedEntityType())
                .relatedEntityId(notification.getRelatedEntityId())
                .bookTitle(notification.getBookTitle())
                .googleBookId(notification.getGoogleBookId())
                .build();
    }
}