package com.rahil.book_nexus.notification;

import com.rahil.book_nexus.common.PageResponse;
import com.rahil.book_nexus.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {
    
    private final NotificationManagementService notificationManagementService;
    
    /**
     * Get notifications for the authenticated user
     */
    @GetMapping
    public ResponseEntity<PageResponse<NotificationResponse>> getNotifications(
            @RequestParam(name = "page", defaultValue = "0", required = false) int page,
            @RequestParam(name = "size", defaultValue = "20", required = false) int size,
            @RequestParam(name = "unreadOnly", defaultValue = "false", required = false) boolean unreadOnly,
            Authentication connectedUser) {
        
        User user = (User) connectedUser.getPrincipal();
        PageResponse<NotificationResponse> notifications;
        
        if (unreadOnly) {
            notifications = notificationManagementService.getUnreadNotifications(user.getId(), page, size);
        } else {
            notifications = notificationManagementService.getUserNotifications(user.getId(), page, size);
        }
        
        return ResponseEntity.ok(notifications);
    }
    
    /**
     * Get notification counts (unread badge count)
     */
    @GetMapping("/count")
    public ResponseEntity<NotificationCountResponse> getNotificationCounts(Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        NotificationCountResponse counts = notificationManagementService.getNotificationCounts(user.getId());
        return ResponseEntity.ok(counts);
    }
    
    /**
     * Mark a specific notification as read
     */
    @PutMapping("/{notificationId}/read")
    public ResponseEntity<Void> markNotificationAsRead(
            @PathVariable Integer notificationId,
            Authentication connectedUser) {
        
        User user = (User) connectedUser.getPrincipal();
        boolean updated = notificationManagementService.markNotificationAsRead(notificationId, user.getId());
        
        if (updated) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
    
    /**
     * Mark all notifications as read
     */
    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllNotificationsAsRead(Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        long updated = notificationManagementService.markAllNotificationsAsRead(user.getId());
        log.info("Marked {} notifications as read for user {}", updated, user.getId());
        return ResponseEntity.ok().build();
    }
    
    /**
     * Delete a specific notification
     */
    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable Integer notificationId,
            Authentication connectedUser) {
        
        User user = (User) connectedUser.getPrincipal();
        boolean deleted = notificationManagementService.deleteNotification(notificationId, user.getId());
        
        if (deleted) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}