package com.rahil.book_nexus.notification;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface PersistentNotificationRepository extends JpaRepository<PersistentNotification, Integer> {
    
    /**
     * Get notifications for a specific user, ordered by creation date (newest first)
     */
    @Query("SELECT n FROM PersistentNotification n WHERE n.recipientUser.id = :userId ORDER BY n.createdDate DESC")
    Page<PersistentNotification> findByRecipientUserId(@Param("userId") Integer userId, Pageable pageable);
    
    /**
     * Count unread notifications for a specific user
     */
    @Query("SELECT COUNT(n) FROM PersistentNotification n WHERE n.recipientUser.id = :userId AND n.isRead = false")
    long countUnreadByRecipientUserId(@Param("userId") Integer userId);
    
    /**
     * Get unread notifications for a specific user
     */
    @Query("SELECT n FROM PersistentNotification n WHERE n.recipientUser.id = :userId AND n.isRead = false ORDER BY n.createdDate DESC")
    Page<PersistentNotification> findUnreadByRecipientUserId(@Param("userId") Integer userId, Pageable pageable);
    
    /**
     * Mark specific notification as read
     */
    @Modifying
    @Query("UPDATE PersistentNotification n SET n.isRead = true, n.readAt = :readAt WHERE n.id = :notificationId AND n.recipientUser.id = :userId")
    int markAsRead(@Param("notificationId") Integer notificationId, @Param("userId") Integer userId, @Param("readAt") LocalDateTime readAt);
    
    /**
     * Mark all notifications as read for a specific user
     */
    @Modifying
    @Query("UPDATE PersistentNotification n SET n.isRead = true, n.readAt = :readAt WHERE n.recipientUser.id = :userId AND n.isRead = false")
    int markAllAsRead(@Param("userId") Integer userId, @Param("readAt") LocalDateTime readAt);
    
    /**
     * Delete notifications older than specified date (cleanup)
     */
    @Modifying
    @Query("DELETE FROM PersistentNotification n WHERE n.createdDate < :before")
    void deleteOldNotifications(@Param("before") LocalDateTime before);
    
    /**
     * Delete specific notification (only if owned by user)
     */
    @Modifying
    @Query("DELETE FROM PersistentNotification n WHERE n.id = :notificationId AND n.recipientUser.id = :userId")
    int deleteByIdAndUserId(@Param("notificationId") Integer notificationId, @Param("userId") Integer userId);
}