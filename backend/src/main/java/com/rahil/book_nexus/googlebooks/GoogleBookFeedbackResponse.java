package com.rahil.book_nexus.googlebooks;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleBookFeedbackResponse {
    private Integer id;
    private String googleBookId;
    private String bookTitle;
    private String authorName;
    private Double rating;
    private String review;
    private String displayName;
    private LocalDate createdDate;
    private boolean isAnonymous;
    private String userId;
}
