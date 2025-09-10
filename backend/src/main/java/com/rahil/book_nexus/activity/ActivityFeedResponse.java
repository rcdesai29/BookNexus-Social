package com.rahil.book_nexus.activity;

import lombok.Builder;

import java.time.LocalDate;

@Builder
public record ActivityFeedResponse(
    Integer id,
    ActivityFeed.ActivityType type,
    String message,
    String userDisplayName,
    String bookTitle,
    String googleBookId,
    Integer bookId,
    LocalDate createdDate
) {
}