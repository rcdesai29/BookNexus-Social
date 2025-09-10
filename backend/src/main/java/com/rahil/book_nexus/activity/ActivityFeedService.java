package com.rahil.book_nexus.activity;

import com.rahil.book_nexus.common.PageResponse;
import com.rahil.book_nexus.user.User;
import com.rahil.book_nexus.user.FollowRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityFeedService {
    
    private final ActivityFeedRepository activityFeedRepository;
    private final FollowRepository followRepository;
    private final UserActivityHiddenRepository userActivityHiddenRepository;
    
    /**
     * Save activity feed item
     */
    @Transactional
    public ActivityFeed saveActivity(ActivityFeed.ActivityType type, String message, User user, 
                                   String userDisplayName, Integer bookId, String googleBookId, String bookTitle) {
        ActivityFeed activity = ActivityFeed.builder()
                .type(type)
                .message(message)
                .user(user)
                .userDisplayName(userDisplayName)
                .bookId(bookId)
                .googleBookId(googleBookId)
                .bookTitle(bookTitle)
                .build();
        
        ActivityFeed saved = activityFeedRepository.save(activity);
        log.info("Saved activity feed item: {} - {}", type, message);
        return saved;
    }
    
    /**
     * Get recent activity (global feed)
     */
    public PageResponse<ActivityFeedResponse> getRecentActivity(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ActivityFeed> activities = activityFeedRepository.findRecentActivity(pageable);
        
        List<ActivityFeedResponse> responses = activities.getContent().stream()
                .map(this::mapToResponse)
                .toList();
        
        return new PageResponse<>(
                responses,
                activities.getNumber(),
                activities.getSize(),
                activities.getTotalElements(),
                activities.getTotalPages(),
                activities.isFirst(),
                activities.isLast()
        );
    }
    
    /**
     * Get activity for friends (users that the current user follows)
     */
    public PageResponse<ActivityFeedResponse> getFriendsActivity(Integer userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ActivityFeed> activities = activityFeedRepository.findFriendsActivity(userId, pageable);
        
        List<ActivityFeedResponse> responses = activities.getContent().stream()
                .map(this::mapToResponse)
                .toList();
        
        return new PageResponse<>(
                responses,
                activities.getNumber(),
                activities.getSize(),
                activities.getTotalElements(),
                activities.getTotalPages(),
                activities.isFirst(),
                activities.isLast()
        );
    }
    
    /**
     * Get activity for a specific user
     */
    public PageResponse<ActivityFeedResponse> getUserActivity(Integer userId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ActivityFeed> activities = activityFeedRepository.findByUserId(userId, pageable);
        
        List<ActivityFeedResponse> responses = activities.getContent().stream()
                .map(this::mapToResponse)
                .toList();
        
        return new PageResponse<>(
                responses,
                activities.getNumber(),
                activities.getSize(),
                activities.getTotalElements(),
                activities.getTotalPages(),
                activities.isFirst(),
                activities.isLast()
        );
    }
    
    /**
     * Cleanup old activity (scheduled task could call this)
     */
    @Transactional
    public void cleanupOldActivity(int daysToKeep) {
        LocalDateTime cutoff = LocalDateTime.now().minusDays(daysToKeep);
        activityFeedRepository.deleteOldActivity(cutoff);
        log.info("Cleaned up activity feed items older than {} days", daysToKeep);
    }
    
    /**
     * Clear all activities from friends that a user follows (hide from user's feed)
     */
    @Transactional
    public void clearFriendsFeedForUser(Integer userId) {
        userActivityHiddenRepository.hideAllFriendsActivitiesForUser(userId);
        log.info("Hidden all friends activities for user ID: {}", userId);
    }
    
    /**
     * Hide a specific activity feed entry from user's feed (with authorization check)
     */
    @Transactional
    public boolean hideActivityEntry(Integer activityId, Integer requestingUserId) {
        return activityFeedRepository.findById(activityId)
            .map(activity -> {
                // Users can hide activities from their own feed or activities from their friends feed
                boolean canHide = activity.getUser().getId().equals(requestingUserId) || 
                                isUserFollowingActivityOwner(requestingUserId, activity.getUser().getId());
                
                if (canHide) {
                    // Check if already hidden
                    if (!userActivityHiddenRepository.existsByUserIdAndActivityId(requestingUserId, activityId)) {
                        UserActivityHidden hiddenActivity = UserActivityHidden.builder()
                            .user(User.builder().id(requestingUserId).build())
                            .activity(activity)
                            .hiddenAt(LocalDateTime.now())
                            .createdBy(requestingUserId)
                            .build();
                        
                        userActivityHiddenRepository.save(hiddenActivity);
                        log.info("Hidden activity ID: {} for user ID: {}", activityId, requestingUserId);
                    } else {
                        log.info("Activity ID: {} already hidden for user ID: {}", activityId, requestingUserId);
                    }
                    return true;
                } else {
                    log.warn("User ID: {} attempted to hide unauthorized activity ID: {}", requestingUserId, activityId);
                    return false;
                }
            })
            .orElse(false);
    }
    
    /**
     * Check if a user follows another user (helper method)
     */
    private boolean isUserFollowingActivityOwner(Integer followerId, Integer followedUserId) {
        return followRepository.existsByFollowerIdAndFollowingId(followerId, followedUserId);
    }
    
    private ActivityFeedResponse mapToResponse(ActivityFeed activity) {
        return ActivityFeedResponse.builder()
                .id(activity.getId())
                .type(activity.getType())
                .message(activity.getMessage())
                .userDisplayName(activity.getUserDisplayName())
                .bookTitle(activity.getBookTitle())
                .googleBookId(activity.getGoogleBookId())
                .bookId(activity.getBookId())
                .createdDate(activity.getCreatedDate())
                .build();
    }
}