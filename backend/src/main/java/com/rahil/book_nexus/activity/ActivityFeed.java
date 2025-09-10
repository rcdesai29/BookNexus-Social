package com.rahil.book_nexus.activity;

import com.rahil.book_nexus.common.BaseEntity;
import com.rahil.book_nexus.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "activity_feed")
public class ActivityFeed extends BaseEntity {
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ActivityType type;
    
    @Column(nullable = false, length = 1000)
    private String message;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
    
    @Column(name = "user_display_name", length = 255)
    private String userDisplayName;
    
    // Optional reference to related entities
    @Column(name = "book_id")
    private Integer bookId;
    
    @Column(name = "google_book_id", length = 100)
    private String googleBookId;
    
    @Column(name = "book_title", length = 1000)
    private String bookTitle;
    
    public enum ActivityType {
        NEW_FOLLOWER,
        UNFOLLOWED,
        NEW_REVIEW,
        REVIEW_LIKE,
        REVIEW_REPLY,
        BOOK_RECOMMENDATION,
        ACTIVITY_UPDATE,
        BOOK_ADDED_TO_TBR,
        BOOK_ADDED_TO_CURRENTLY_READING,
        BOOK_MARKED_AS_READ,
        BOOK_REMOVED_FROM_LIST
    }
}