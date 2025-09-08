package com.rahil.book_nexus.feedback;

import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import jakarta.persistence.Enumerated;
import jakarta.persistence.EnumType;
import com.rahil.book_nexus.book.Book;
import com.rahil.book_nexus.user.User;
import com.rahil.book_nexus.common.BaseEntity;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import jakarta.persistence.JoinColumn;

@Entity
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Feedback extends BaseEntity {
    
    // Core review data
    private Double rating;
    
    @Column(length = 2000)
    private String review;
    
    @Builder.Default
    private Boolean isAnonymous = false;
    
    // Google Book ID (required - every book has this)
    @Column(length = 100, nullable = false)
    private String googleBookId;
    
    // Book metadata for display (to avoid API calls)
    @Column(length = 1000)
    private String bookTitle;
    
    @Column(length = 500)
    private String authorName;
    
    // Source tracking
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReviewSource source;
    
    // User reference
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
    
    // Legacy local book reference (nullable for backward compatibility)
    @ManyToOne
    @JoinColumn(name = "book_id", nullable = true)
    private Book book;
    
    public enum ReviewSource {
        LOCAL,   // Review from user's personal library
        GOOGLE   // Review from Google Books discovery
    }
}
