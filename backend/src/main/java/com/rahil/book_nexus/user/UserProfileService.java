package com.rahil.book_nexus.user;

import com.rahil.book_nexus.history.BookTransactionHistoryRepository;
import com.rahil.book_nexus.feedback.FeedbackRepository;
import com.rahil.book_nexus.googlebooks.GoogleBookIntegrationService;
import com.rahil.book_nexus.googlebooks.GoogleBookFeedbackRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class UserProfileService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final FollowRepository followRepository;
    private final BookTransactionHistoryRepository transactionHistoryRepository;
    private final FeedbackRepository feedbackRepository;
    private final GoogleBookFeedbackRepository googleBookFeedbackRepository;
    private final GoogleBookIntegrationService googleBookIntegrationService;
    private final com.rahil.book_nexus.websocket.NotificationService notificationService;

    public UserProfileResponse getUserProfile(Integer userId, Authentication connectedUser) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        User currentUser = connectedUser != null ? (User) connectedUser.getPrincipal() : null;
        boolean isOwnProfile = currentUser != null && currentUser.getId().equals(userId);

        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultProfile(user));

        return buildProfileResponse(user, profile, currentUser, isOwnProfile);
    }

    public UserProfileResponse updateUserProfile(Integer userId, UserProfileRequest request,
            Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        if (!user.getId().equals(userId)) {
            throw new IllegalArgumentException("You can only update your own profile");
        }

        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultProfile(user));

        // Display name cannot be changed after initial setup
        if (!profile.getDisplayName().equalsIgnoreCase(request.displayName())) {
            throw new IllegalArgumentException("Display name cannot be changed after initial setup");
        }

        // Update profile fields (displayName is not updated to prevent changes)
        profile.setBio(request.bio());
        profile.setLocation(request.location());
        profile.setWebsite(request.website());
        profile.setTwitterHandle(request.twitterHandle());
        profile.setInstagramHandle(request.instagramHandle());
        profile.setGoodreadsHandle(request.goodreadsHandle());
        profile.setProfileVisibility(request.profileVisibility());
        profile.setActivityVisibility(request.activityVisibility());
        profile.setReviewsVisibility(request.reviewsVisibility());
        profile.setAnnualReadingGoal(request.annualReadingGoal());
        profile.setPreferredFormat(request.preferredFormat());
        profile.setReadingSpeed(request.readingSpeed());

        UserProfile savedProfile = userProfileRepository.save(profile);
        return buildProfileResponse(user, savedProfile, user, true);
    }

    public void followUser(Integer targetUserId, Authentication connectedUser) {
        User follower = (User) connectedUser.getPrincipal();
        User following = userRepository.findById(targetUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (follower.getId().equals(targetUserId)) {
            throw new IllegalArgumentException("You cannot follow yourself");
        }

        if (followRepository.existsByFollowerIdAndFollowingId(follower.getId(), targetUserId)) {
            throw new IllegalArgumentException("You are already following this user");
        }

        Follow follow = Follow.builder()
                .follower(follower)
                .following(following)
                .createdBy(follower.getId())
                .build();

        followRepository.save(follow);
        log.info("User {} started following user {}", follower.getUsername(), following.getUsername());
        
        // Send notification to the followed user
        UserProfile followerProfile = userProfileRepository.findByUserId(follower.getId()).orElse(null);
        String followerDisplayName = (followerProfile != null && followerProfile.getDisplayName() != null) 
            ? followerProfile.getDisplayName() 
            : follower.getFullName();
        notificationService.sendNewFollowerNotification(following.getId().toString(), followerDisplayName);
        
        // Send activity feed update
        notificationService.sendActivityFeedUpdate(followerDisplayName, "started following " + (userProfileRepository.findByUserId(following.getId()).map(p -> p.getDisplayName()).orElse(following.getFullName())));
        
        // Send real-time follower count updates to both users
        int followingUserFollowerCount = (int) followRepository.countFollowersByUserId(following.getId());
        int followingUserFollowingCount = (int) followRepository.countFollowingByUserId(following.getId());
        int followerUserFollowerCount = (int) followRepository.countFollowersByUserId(follower.getId());
        int followerUserFollowingCount = (int) followRepository.countFollowingByUserId(follower.getId());
        
        notificationService.sendFollowerCountUpdate(
            following.getId().toString(), 
            followingUserFollowerCount, 
            followingUserFollowingCount
        );
        notificationService.sendFollowerCountUpdate(
            follower.getId().toString(), 
            followerUserFollowerCount, 
            followerUserFollowingCount
        );
    }

    public void unfollowUser(Integer targetUserId, Authentication connectedUser) {
        User follower = (User) connectedUser.getPrincipal();
        User unfollowed = userRepository.findById(targetUserId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        if (!followRepository.existsByFollowerIdAndFollowingId(follower.getId(), targetUserId)) {
            throw new IllegalArgumentException("You are not following this user");
        }

        followRepository.deleteByFollowerIdAndFollowingId(follower.getId(), targetUserId);
        log.info("User {} unfollowed user {}", follower.getUsername(), unfollowed.getUsername());
        
        // Send unfollow notification to the unfollowed user
        UserProfile unfollowerProfile = userProfileRepository.findByUserId(follower.getId()).orElse(null);
        String unfollowerDisplayName = (unfollowerProfile != null && unfollowerProfile.getDisplayName() != null) 
            ? unfollowerProfile.getDisplayName() 
            : follower.getFullName();
        notificationService.sendUnfollowNotification(unfollowed.getId().toString(), unfollowerDisplayName);
        
        // Send activity feed update  
        notificationService.sendActivityFeedUpdate(unfollowerDisplayName, "unfollowed " + (userProfileRepository.findByUserId(unfollowed.getId()).map(p -> p.getDisplayName()).orElse(unfollowed.getFullName())));
        
        // Send real-time follower count updates to both users
        int unfollowedUserFollowerCount = (int) followRepository.countFollowersByUserId(unfollowed.getId());
        int unfollowedUserFollowingCount = (int) followRepository.countFollowingByUserId(unfollowed.getId());
        int unfollowerUserFollowerCount = (int) followRepository.countFollowersByUserId(follower.getId());
        int unfollowerUserFollowingCount = (int) followRepository.countFollowingByUserId(follower.getId());
        
        notificationService.sendFollowerCountUpdate(
            unfollowed.getId().toString(), 
            unfollowedUserFollowerCount, 
            unfollowedUserFollowingCount
        );
        notificationService.sendFollowerCountUpdate(
            follower.getId().toString(), 
            unfollowerUserFollowerCount, 
            unfollowerUserFollowingCount
        );
    }

    public List<User> getFollowers(Integer userId, Authentication connectedUser) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        return followRepository.findFollowersByUserId(userId);
    }

    public List<User> getFollowing(Integer userId, Authentication connectedUser) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));

        return followRepository.findFollowingByUserId(userId);
    }

    public boolean isDisplayNameAvailable(String displayName) {
        if (displayName == null || displayName.trim().isEmpty()) {
            return false;
        }
        return !userProfileRepository.existsByDisplayNameIgnoreCase(displayName.trim());
    }

    public List<UserProfileResponse> searchUsersByDisplayName(String displayName, Authentication connectedUser) {
        User currentUser = connectedUser != null ? (User) connectedUser.getPrincipal() : null;
        
        return userProfileRepository.findAll().stream()
                .filter(profile -> profile.getDisplayName() != null && 
                        profile.getDisplayName().toLowerCase().contains(displayName.toLowerCase()))
                .filter(profile -> profile.getProfileVisibility() == UserProfile.ProfileVisibility.PUBLIC ||
                        (currentUser != null && isFollowingOrSelf(currentUser, profile.getUser())))
                .limit(20)
                .map(profile -> buildProfileResponse(profile.getUser(), profile, currentUser, 
                        currentUser != null && currentUser.getId().equals(profile.getUser().getId())))
                .toList();
    }

    public UserProfileResponse getUserByDisplayName(String displayName, Authentication connectedUser) {
        UserProfile profile = userProfileRepository.findByDisplayNameIgnoreCase(displayName)
                .orElseThrow(() -> new EntityNotFoundException("User with display name '" + displayName + "' not found"));
        
        User currentUser = connectedUser != null ? (User) connectedUser.getPrincipal() : null;
        boolean isOwnProfile = currentUser != null && currentUser.getId().equals(profile.getUser().getId());
        
        return buildProfileResponse(profile.getUser(), profile, currentUser, isOwnProfile);
    }

    private boolean isFollowingOrSelf(User currentUser, User targetUser) {
        if (currentUser.getId().equals(targetUser.getId())) {
            return true;
        }
        return followRepository.existsByFollowerIdAndFollowingId(currentUser.getId(), targetUser.getId());
    }

    private UserProfile createDefaultProfile(User user) {
        String uniqueDisplayName = generateUniqueDisplayName(user);
        
        UserProfile profile = UserProfile.builder()
                .user(user)
                .displayName(uniqueDisplayName)
                .profileVisibility(UserProfile.ProfileVisibility.PUBLIC)
                .activityVisibility(UserProfile.ActivityVisibility.PUBLIC)
                .reviewsVisibility(UserProfile.ReviewsVisibility.PUBLIC)
                .createdBy(user.getId())
                .build();

        return userProfileRepository.save(profile);
    }

    private String generateUniqueDisplayName(User user) {
        String baseName = sanitizeDisplayName(user.getFullName());
        
        if (baseName.isEmpty()) {
            baseName = "user" + user.getId();
        }
        
        String displayName = baseName;
        int counter = 1;
        
        while (!isDisplayNameAvailable(displayName)) {
            displayName = baseName + counter;
            counter++;
        }
        
        return displayName;
    }

    private String sanitizeDisplayName(String name) {
        if (name == null) return "";
        
        return name.toLowerCase()
                .replaceAll("[^a-zA-Z0-9._-]", "")
                .replaceAll("\\s+", "")
                .trim();
    }

    private UserProfileResponse buildProfileResponse(User user, UserProfile profile, User currentUser,
            boolean isOwnProfile) {
        // Calculate stats using Google Books system
        long booksRead = googleBookIntegrationService.getBooksReadCount(user);
        long currentlyReading = googleBookIntegrationService.getCurrentlyReadingCount(user);
        long regularReviewsCount = feedbackRepository.countByUserId(user.getId());
        long googleBookReviewsCount = googleBookFeedbackRepository.countByUserId(user.getId());
        long reviewsCount = regularReviewsCount + googleBookReviewsCount;
        long followersCount = followRepository.countFollowersByUserId(user.getId());
        long followingCount = followRepository.countFollowingByUserId(user.getId());

        // Calculate average rating
        Double averageRating = feedbackRepository.findAverageRatingByUserId(user.getId());

        // Check follow relationships
        boolean isFollowing = false;
        boolean isFollowedBy = false;

        if (currentUser != null && !isOwnProfile) {
            isFollowing = followRepository.existsByFollowerIdAndFollowingId(currentUser.getId(), user.getId());
            isFollowedBy = followRepository.existsByFollowerIdAndFollowingId(user.getId(), currentUser.getId());
        }

        return UserProfileResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .displayName(profile.getDisplayName())
                .bio(profile.getBio())
                .location(profile.getLocation())
                .website(profile.getWebsite())
                .avatarUrl(profile.getAvatarUrl())
                .twitterHandle(profile.getTwitterHandle())
                .instagramHandle(profile.getInstagramHandle())
                .goodreadsHandle(profile.getGoodreadsHandle())
                .profileVisibility(profile.getProfileVisibility())
                .activityVisibility(profile.getActivityVisibility())
                .reviewsVisibility(profile.getReviewsVisibility())
                .annualReadingGoal(profile.getAnnualReadingGoal())
                .preferredFormat(profile.getPreferredFormat())
                .readingSpeed(profile.getReadingSpeed())
                .booksRead(booksRead)
                .currentlyReading(currentlyReading)
                .averageRating(averageRating)
                .reviewsCount(reviewsCount)
                .followersCount(followersCount)
                .followingCount(followingCount)
                .memberSince(user.getCreatedDate() != null ? user.getCreatedDate().toString() : null)
                .lastActive(user.getLastModifiedDate() != null ? user.getLastModifiedDate().toString() : null)
                .isFollowing(isFollowing)
                .isFollowedBy(isFollowedBy)
                .isOwnProfile(isOwnProfile)
                .build();
    }
}
