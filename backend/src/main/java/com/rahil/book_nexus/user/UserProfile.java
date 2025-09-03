package com.rahil.book_nexus.user;

import com.rahil.book_nexus.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "user_profile")
public class UserProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(length = 100, unique = true, nullable = false)
    private String displayName;

    @Column(length = 500)
    private String bio;

    @Column(length = 100)
    private String location;

    @Column(length = 200)
    private String website;

    @Column(length = 200)
    private String avatarUrl;

    @Column(length = 50)
    private String twitterHandle;

    @Column(length = 50)
    private String instagramHandle;

    @Column(length = 50)
    private String goodreadsHandle;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ProfileVisibility profileVisibility = ProfileVisibility.PUBLIC;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ActivityVisibility activityVisibility = ActivityVisibility.PUBLIC;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private ReviewsVisibility reviewsVisibility = ReviewsVisibility.PUBLIC;

    @Column
    private Integer annualReadingGoal;

    @Column(length = 20)
    private String preferredFormat; // PHYSICAL, EBOOK, AUDIOBOOK

    @Column(length = 20)
    private String readingSpeed; // FAST, AVERAGE, SLOW

    public enum ProfileVisibility {
        PUBLIC, PRIVATE, FOLLOWERS_ONLY
    }

    public enum ActivityVisibility {
        PUBLIC, PRIVATE, FOLLOWERS_ONLY
    }

    public enum ReviewsVisibility {
        PUBLIC, PRIVATE, FOLLOWERS_ONLY
    }
}
