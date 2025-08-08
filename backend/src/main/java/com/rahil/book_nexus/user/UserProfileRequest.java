package com.rahil.book_nexus.user;

import com.rahil.book_nexus.user.UserProfile.ActivityVisibility;
import com.rahil.book_nexus.user.UserProfile.ProfileVisibility;
import com.rahil.book_nexus.user.UserProfile.ReviewsVisibility;
import jakarta.validation.constraints.Size;

public record UserProfileRequest(
    @Size(max = 100, message = "Display name must be 100 characters or less")
    String displayName,
    
    @Size(max = 500, message = "Bio must be 500 characters or less")
    String bio,
    
    @Size(max = 100, message = "Location must be 100 characters or less")
    String location,
    
    @Size(max = 200, message = "Website URL must be 200 characters or less")
    String website,
    
    @Size(max = 50, message = "Twitter handle must be 50 characters or less")
    String twitterHandle,
    
    @Size(max = 50, message = "Instagram handle must be 50 characters or less")
    String instagramHandle,
    
    @Size(max = 50, message = "Goodreads handle must be 50 characters or less")
    String goodreadsHandle,
    
    ProfileVisibility profileVisibility,
    ActivityVisibility activityVisibility,
    ReviewsVisibility reviewsVisibility,
    
    Integer annualReadingGoal,
    String preferredFormat,
    String readingSpeed
) {}
