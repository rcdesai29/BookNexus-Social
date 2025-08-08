package com.rahil.book_nexus.user;

import com.rahil.book_nexus.user.UserProfile.ActivityVisibility;
import com.rahil.book_nexus.user.UserProfile.ProfileVisibility;
import com.rahil.book_nexus.user.UserProfile.ReviewsVisibility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserProfileResponse {
    
    private Integer userId;
    private String username;
    private String email;
    private String fullName;
    private String displayName;
    private String bio;
    private String location;
    private String website;
    private String avatarUrl;
    private String twitterHandle;
    private String instagramHandle;
    private String goodreadsHandle;
    
    private ProfileVisibility profileVisibility;
    private ActivityVisibility activityVisibility;
    private ReviewsVisibility reviewsVisibility;
    
    private Integer annualReadingGoal;
    private String preferredFormat;
    private String readingSpeed;
    
    // Stats
    private Long booksRead;
    private Long currentlyReading;
    private Long wantToRead;
    private Double averageRating;
    private Long reviewsCount;
    private Long followersCount;
    private Long followingCount;
    
    // Timestamps
    private LocalDate memberSince;
    private LocalDate lastActive;
    
    // Social
    private Boolean isFollowing;
    private Boolean isFollowedBy;
    private Boolean isOwnProfile;
}
