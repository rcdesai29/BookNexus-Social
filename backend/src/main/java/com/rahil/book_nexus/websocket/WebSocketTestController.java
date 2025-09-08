package com.rahil.book_nexus.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/websocket-test")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class WebSocketTestController {

    private final NotificationService notificationService;

    @PostMapping("/new-follower")
    public ResponseEntity<String> testNewFollower() {
        notificationService.sendNewFollowerNotification("123", "TestUser");
        return ResponseEntity.ok("New follower notification sent!");
    }

    @PostMapping("/new-review")
    public ResponseEntity<String> testNewReview() {
        notificationService.sendNewReviewNotification("The Great Gatsby", "BookLover");
        return ResponseEntity.ok("New review notification sent!");
    }

    @PostMapping("/book-recommendation")
    public ResponseEntity<String> testBookRecommendation() {
        notificationService.sendBookRecommendationNotification("1984", "ReaderFriend");
        return ResponseEntity.ok("Book recommendation notification sent!");
    }

    @PostMapping("/activity-update")
    public ResponseEntity<String> testActivityUpdate() {
        notificationService.sendActivityFeedUpdate("BookWorm", "just finished reading 'Dune'");
        return ResponseEntity.ok("Activity update notification sent!");
    }

    @PostMapping("/unfollow")
    public ResponseEntity<String> testUnfollow() {
        notificationService.sendUnfollowNotification("123", "TestUser");
        return ResponseEntity.ok("Unfollow notification sent!");
    }

    @PostMapping("/follower-count-update")
    public ResponseEntity<String> testFollowerCountUpdate() {
        notificationService.sendFollowerCountUpdate("123", 150, 75);
        return ResponseEntity.ok("Follower count update sent!");
    }

    @GetMapping("/status")
    public ResponseEntity<String> getStatus() {
        int connections = notificationService.getActiveConnections();
        return ResponseEntity.ok("WebSocket service is running. Active connections: " + connections);
    }
}