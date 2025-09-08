package com.rahil.book_nexus.websocket;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationWebSocketHandler webSocketHandler;

    /**
     * Send a new follower notification (broadcast for now until user-specific routing is implemented)
     */
    public void sendNewFollowerNotification(String followedUserId, String followerDisplayName) {
        WebSocketMessage message = WebSocketMessage.notification(
                "NEW_FOLLOWER", 
                followerDisplayName + " started following you!"
        );
        
        webSocketHandler.broadcast(message);
        log.info("Sent new follower notification: {} -> {}", followerDisplayName, followedUserId);
    }

    /**
     * Send unfollow notification (broadcast for now until user-specific routing is implemented)
     */
    public void sendUnfollowNotification(String unfollowedUserId, String unfollowerDisplayName) {
        WebSocketMessage message = WebSocketMessage.notification(
                "UNFOLLOWED", 
                unfollowerDisplayName + " unfollowed you"
        );
        
        webSocketHandler.broadcast(message);
        log.info("Sent unfollow notification: {} -> {}", unfollowerDisplayName, unfollowedUserId);
    }

    /**
     * Send real-time follower count update (broadcast for now until user-specific routing is implemented)
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
        
        webSocketHandler.broadcast(message);
        log.info("Sent follower count update to user {}: followers={}, following={}", 
                userId, newFollowerCount, newFollowingCount);
    }

    /**
     * Send a new review notification
     */
    public void sendNewReviewNotification(String bookTitle, String reviewerDisplayName) {
        WebSocketMessage message = WebSocketMessage.notification(
                "NEW_REVIEW",
                reviewerDisplayName + " reviewed \"" + bookTitle + "\""
        );
        
        webSocketHandler.broadcast(message);
        log.info("Sent new review notification: {} reviewed {}", reviewerDisplayName, bookTitle);
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
    public void sendReviewReplyNotificationToUser(Integer userId, String replyMessage) {
        WebSocketMessage message = WebSocketMessage.notification(
                "REVIEW_REPLY",
                replyMessage
        );
        
        webSocketHandler.sendToUser(userId.toString(), message);
        log.info("Sent review reply notification to user {}: {}", userId, replyMessage);
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
     * Send activity feed update
     */
    public void sendActivityFeedUpdate(String userDisplayName, String activity) {
        WebSocketMessage message = WebSocketMessage.notification(
                "ACTIVITY_UPDATE",
                userDisplayName + " " + activity
        );
        
        webSocketHandler.broadcast(message);
        log.info("Sent activity update: {} {}", userDisplayName, activity);
    }

    /**
     * Send a review like notification
     */
    public void sendReviewLikeNotification(String userId, String likeMessage) {
        WebSocketMessage message = WebSocketMessage.notification(
                "REVIEW_LIKE",
                likeMessage
        );
        
        webSocketHandler.broadcast(message);
        log.info("Sent review like notification to user {}: {}", userId, likeMessage);
    }

    /**
     * Send a reply like notification
     */
    public void sendReplyLikeNotification(String userId, String likeMessage) {
        WebSocketMessage message = WebSocketMessage.notification(
                "REPLY_LIKE",
                likeMessage
        );
        
        webSocketHandler.broadcast(message);
        log.info("Sent reply like notification to user {}: {}", userId, likeMessage);
    }

    /**
     * Get count of active WebSocket connections
     */
    public int getActiveConnections() {
        return webSocketHandler.getActiveConnectionsCount();
    }
}