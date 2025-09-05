package com.rahil.book_nexus.book;

import com.rahil.book_nexus.common.BaseEntity;
import com.rahil.book_nexus.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
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
@Table(name = "user_book_list")
public class UserBookList extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id")
    private Book book;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "google_book_id")
    private com.rahil.book_nexus.googlebooks.GoogleBookEntity googleBook;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ListType listType;

    @Column(nullable = false)
    private Boolean isActive = true;

    // User's personal rating (1-5 stars)
    private Integer userRating;

    // User's personal review
    @Column(length = 2000)
    private String userReview;

    // Track reading progress (0-100)
    private Integer readingProgress;

    // Whether this book is marked as favorite by the user
    @Column(nullable = false)
    @Builder.Default
    private Boolean isFavorite = false;

    public enum ListType {
        CURRENTLY_READING,  // Currently Reading
        TBR,               // To Be Read
        READ               // Read
    }

    // Security: Ensure either book or googleBook is set, but not both
    @PrePersist
    @PreUpdate
    private void validateBookReference() {
        if (book == null && googleBook == null) {
            throw new IllegalArgumentException("Either book or googleBook must be set");
        }
        if (book != null && googleBook != null) {
            throw new IllegalArgumentException("Cannot have both book and googleBook set");
        }
    }
}
