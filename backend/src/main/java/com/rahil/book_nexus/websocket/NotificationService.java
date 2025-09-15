package com.rahil.book_nexus.websocket;

import com.rahil.book_nexus.activity.ActivityFeed;
import com.rahil.book_nexus.activity.ActivityFeedService;
import com.rahil.book_nexus.notification.PersistentNotification;
import com.rahil.book_nexus.notification.PersistentNotificationRepository;
import com.rahil.book_nexus.user.User;
import com.rahil.book_nexus.user.FollowRepository;
import com.rahil.book_nexus.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationWebSocketHandler webSocketHandler;
    private final ActivityFeedService activityFeedService;
    private final FollowRepository followRepository;
    private final PersistentNotificationRepository persistentNotificationRepository;
    private final UserRepository userRepository;

    /**
     * Send notification to all followers of a specific user
     */
    private void sendToFollowers(Integer userId, WebSocketMessage message) {
        List<User> followers = followRepository.findFollowersByUserId(userId);
        for (User follower : followers) {
            webSocketHandler.sendToUser(follower.getId().toString(), message);
        }
        log.info("Sent notification to {} followers of user {}", followers.size(), userId);
    }

    /**
     * Send notification to a specific user only
     */
    private void sendToUser(String userId, WebSocketMessage message) {
        webSocketHandler.sendToUser(userId, message);
    }

    /**
     * Send a new follower notification to the followed user only
     */
    public void sendNewFollowerNotification(String followedUserId, String followerDisplayName, Integer followerId) {
        String message = followerDisplayName + " started following you!";
        WebSocketMessage wsMessage = WebSocketMessage.notification("NEW_FOLLOWER", message);
        
        sendToUser(followedUserId, wsMessage);
        
        // Persist notification
        persistNotification(
            Integer.valueOf(followedUserId), 
            followerId,
            PersistentNotification.NotificationType.NEW_FOLLOWER, 
            message,
            "FOLLOW", 
            followerId, 
            null, 
            null
        );
        
        log.info("Sent and persisted new follower notification: {} -> {}", followerDisplayName, followedUserId);
    }

    /**
     * Send unfollow notification to the unfollowed user only
     */
    public void sendUnfollowNotification(String unfollowedUserId, String unfollowerDisplayName, Integer unfollowerId) {
        String message = unfollowerDisplayName + " unfollowed you";
        WebSocketMessage wsMessage = WebSocketMessage.notification("UNFOLLOWED", message);
        
        sendToUser(unfollowedUserId, wsMessage);
        
        // Persist notification
        persistNotification(
            Integer.valueOf(unfollowedUserId), 
            unfollowerId,
            PersistentNotification.NotificationType.UNFOLLOWED, 
            message,
            "UNFOLLOW", 
            unfollowerId, 
            null, 
            null
        );
        
        log.info("Sent and persisted unfollow notification: {} -> {}", unfollowerDisplayName, unfollowedUserId);
    }

    /**
     * Send real-time follower count update to specific user only
     */
    public void sendFollowerCountUpdate(String userId, int newFollowerCount, int newFollowingCount) {
        WebSocketMessage message = WebSocketMessage.builder()
                .type("FOLLOWER_COUNT_UPDATE")
                .data(java.util.Map.of(
                    "message", "Follower count updated",
                    "followerCount", newFollowerCount,
                    "followingCount", newFollowingCount,
                    "userId", userId
                ))
                .build();
        
        sendToUser(userId, message);
        log.info("Sent follower count update to user {}: followers={}, following={}", 
                userId, newFollowerCount, newFollowingCount);
    }

    /**
     * Send a new review notification to followers only
     */
    public void sendNewReviewNotification(String bookTitle, String reviewerDisplayName, User reviewer) {
        WebSocketMessage message = WebSocketMessage.notification(
                "NEW_REVIEW",
                reviewerDisplayName + " reviewed \"" + bookTitle + "\""
        );
        
        sendToFollowers(reviewer.getId(), message);
        log.info("Sent new review notification to followers: {} reviewed {}", reviewerDisplayName, bookTitle);
    }
    
    /**
     * Legacy method for backward compatibility - sends to everyone
     */
    public void sendNewReviewNotification(String bookTitle, String reviewerDisplayName) {
        WebSocketMessage message = WebSocketMessage.notification(
                "NEW_REVIEW",
                reviewerDisplayName + " reviewed \"" + bookTitle + "\""
        );
        
        webSocketHandler.broadcast(message);
        log.info("Sent new review notification (broadcast): {} reviewed {}", reviewerDisplayName, bookTitle);
    }
    
    /**
     * Send a review reply notification to all users
     */
    public void sendReviewReplyNotification(String replyMessage) {
        WebSocketMessage message = WebSocketMessage.notification(
                "REVIEW_REPLY",
                replyMessage
        );
        
        webSocketHandler.broadcast(message);
        log.info("Sent review reply notification: {}", replyMessage);
    }
    
    /**
     * Send a review reply notification to a specific user
     */
    public void sendReviewReplyNotificationToUser(Integer userId, String replyMessage, Integer replyAuthorId, Integer reviewId) {
        WebSocketMessage message = WebSocketMessage.notification("REVIEW_REPLY", replyMessage);
        
        webSocketHandler.sendToUser(userId.toString(), message);
        
        // Persist notification
        persistNotification(
            userId, 
            replyAuthorId,
            PersistentNotification.NotificationType.REVIEW_REPLY, 
            replyMessage,
            "REVIEW", 
            reviewId, 
            null, 
            null
        );
        
        log.info("Sent and persisted review reply notification to user {}: {}", userId, replyMessage);
    }

    /**
     * Send a book recommendation notification
     */
    public void sendBookRecommendationNotification(String bookTitle, String recommenderDisplayName) {
        WebSocketMessage message = WebSocketMessage.notification(
                "BOOK_RECOMMENDATION",
                recommenderDisplayName + " recommends \"" + bookTitle + "\""
        );
        
        webSocketHandler.broadcast(message);
        log.info("Sent book recommendation: {} recommends {}", recommenderDisplayName, bookTitle);
    }

    /**
     * Send activity feed update (no persistence, no user context)
     * This is a fallback method - consider using the version with User parameter for targeted notifications
     */
    public void sendActivityFeedUpdate(String userDisplayName, String activity) {
        WebSocketMessage message = WebSocketMessage.notification(
                "ACTIVITY_UPDATE",
                userDisplayName + " " + activity
        );
        
        // Still broadcast for now since we don't have user context
        webSocketHandler.broadcast(message);
        log.info("Sent activity update (broadcast): {} {}", userDisplayName, activity);
    }
    
    /**
     * Send activity feed update with persistence for specific user and book - now targeted to followers only
     */
    public void sendActivityFeedUpdate(String userDisplayName, String activity, User user, String bookTitle, String googleBookId) {
        // Send real-time update to followers only
        WebSocketMessage message = WebSocketMessage.notification(
                "ACTIVITY_UPDATE",
                userDisplayName + " " + activity
        );
        sendToFollowers(user.getId(), message);
        
        // Persist to database
        activityFeedService.saveActivity(
            ActivityFeed.ActivityType.ACTIVITY_UPDATE,
            userDisplayName + " " + activity,
            user,
            userDisplayName,
            null,
            googleBookId,
            bookTitle
        );
        
        log.info("Sent and persisted activity update to followers: {} {}", userDisplayName, activity);
    }

    /**
     * Send a review like notification
     */
    public void sendReviewLikeNotification(String userId, String likeMessage, Integer likerUserId, Integer reviewId, String bookTitle) {
        WebSocketMessage message = WebSocketMessage.notification("REVIEW_LIKE", likeMessage);
        
        webSocketHandler.sendToUser(userId, message);
        
        // Persist notification
        persistNotification(
            Integer.valueOf(userId), 
            likerUserId,
            PersistentNotification.NotificationType.REVIEW_LIKE, 
            likeMessage,
            "REVIEW", 
            reviewId, 
            bookTitle, 
            null
        );
        
        log.info("Sent and persisted review like notification to user {}: {}", userId, likeMessage);
    }

    /**
     * Send a reply like notification
     */
    public void sendReplyLikeNotification(String userId, String likeMessage, Integer likerUserId, Integer replyId) {
        WebSocketMessage message = WebSocketMessage.notification("REPLY_LIKE", likeMessage);
        
        webSocketHandler.sendToUser(userId, message);
        
        // Persist notification
        persistNotification(
            Integer.valueOf(userId), 
            likerUserId,
            PersistentNotification.NotificationType.REPLY_LIKE, 
            likeMessage,
            "REPLY", 
            replyId, 
            null, 
            null
        );
        
        log.info("Sent and persisted reply like notification to user {}: {}", userId, likeMessage);
    }

    /**
     * Send a book list activity notification
     */
    public void sendBookListNotification(String notificationType, String message) {
        WebSocketMessage wsMessage = WebSocketMessage.notification(
                notificationType,
                message
        );
        
        webSocketHandler.broadcast(wsMessage);
        log.info("Sent book list notification ({}): {}", notificationType, message);
    }

    /**
     * Persist notification to database
     */
    private void persistNotification(Integer recipientUserId, Integer triggerUserId, 
                                   PersistentNotification.NotificationType type, String message,
                                   String relatedEntityType, Integer relatedEntityId, 
                                   String bookTitle, String googleBookId) {
        try {
            User recipientUser = userRepository.findById(recipientUserId).orElse(null);
            User triggerUser = triggerUserId != null ? userRepository.findById(triggerUserId).orElse(null) : null;
            
            if (recipientUser != null) {
                PersistentNotification notification = PersistentNotification.builder()
                    .type(type)
                    .message(message)
                    .recipientUser(recipientUser)
                    .triggerUser(triggerUser)
                    .relatedEntityType(relatedEntityType)
                    .relatedEntityId(relatedEntityId)
                    .bookTitle(bookTitle)
                    .googleBookId(googleBookId)
                    .build();
                
                persistentNotificationRepository.save(notification);
                log.info("Persisted notification: {} for user {}", type, recipientUserId);
            }
        } catch (Exception e) {
            log.error("Failed to persist notification: {} for user {}", type, recipientUserId, e);
        }
    }

    /**
     * Get count of active WebSocket connections
     */
    public int getActiveConnections() {
        return webSocketHandler.getActiveConnectionsCount();
    }
}