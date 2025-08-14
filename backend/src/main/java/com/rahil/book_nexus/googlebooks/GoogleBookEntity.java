package com.rahil.book_nexus.googlebooks;

import com.rahil.book_nexus.common.BaseEntity;
import com.rahil.book_nexus.user.User;
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
@Table(name = "google_book")
public class GoogleBookEntity extends BaseEntity {

    @Column(unique = true, nullable = false)
    private String googleBookId;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String authorName;

    @Column(length = 20)
    private String isbn;

    @Column(length = 2000)
    private String description;

    @Column(length = 500)
    private String coverUrl;

    @Column(length = 20)
    private String publishedDate;

    private Integer pageCount;

    @Column(length = 100)
    private String categories;

    private Double averageRating;

    private Integer ratingsCount;

    @Column(length = 20)
    private String isbn13;

    @Column(length = 20)
    private String isbn10;

    // Track which user first discovered this book
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "discovered_by")
    private User discoveredBy;

    // Security: Only store essential data, fetch live data from Google Books API when needed
    @Column(nullable = false)
    private Boolean isActive = true;
}
