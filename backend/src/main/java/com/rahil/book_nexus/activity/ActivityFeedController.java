package com.rahil.book_nexus.activity;

import com.rahil.book_nexus.common.PageResponse;
import com.rahil.book_nexus.user.User;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("activity")
@RequiredArgsConstructor
@Tag(name = "Activity Feed")
public class ActivityFeedController {
    
    private final ActivityFeedService activityFeedService;
    
    /**
     * Get recent activity for all users (global feed)
     */
    @GetMapping("/recent")
    public ResponseEntity<PageResponse<ActivityFeedResponse>> getRecentActivity(
            @RequestParam(name = "page", defaultValue = "0", required = false) int page,
            @RequestParam(name = "size", defaultValue = "10", required = false) int size) {
        return ResponseEntity.ok(activityFeedService.getRecentActivity(page, size));
    }
    
    /**
     * Get activity from friends (users that the current user follows)
     */
    @GetMapping("/friends")
    public ResponseEntity<PageResponse<ActivityFeedResponse>> getFriendsActivity(
            @RequestParam(name = "page", defaultValue = "0", required = false) int page,
            @RequestParam(name = "size", defaultValue = "10", required = false) int size,
            Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        return ResponseEntity.ok(activityFeedService.getFriendsActivity(user.getId(), page, size));
    }
    
    /**
     * Get activity for a specific user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<PageResponse<ActivityFeedResponse>> getUserActivity(
            @PathVariable Integer userId,
            @RequestParam(name = "page", defaultValue = "0", required = false) int page,
            @RequestParam(name = "size", defaultValue = "10", required = false) int size) {
        return ResponseEntity.ok(activityFeedService.getUserActivity(userId, page, size));
    }
    
    /**
     * Clear entire friends feed for the authenticated user
     */
    @DeleteMapping("/clear-friends-feed")
    public ResponseEntity<Void> clearFriendsFeed(Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        activityFeedService.clearFriendsFeedForUser(user.getId());
        return ResponseEntity.ok().build();
    }
    
    /**
     * Hide a specific activity feed entry from user's feed
     * Users can hide their own activities or activities from their friends feed
     */
    @DeleteMapping("/{activityId}")
    public ResponseEntity<Void> hideActivityEntry(
            @PathVariable Integer activityId,
            Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        boolean hidden = activityFeedService.hideActivityEntry(activityId, user.getId());
        
        if (hidden) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }
}