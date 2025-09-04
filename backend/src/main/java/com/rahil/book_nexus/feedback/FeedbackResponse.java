package com.rahil.book_nexus.feedback;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class FeedbackResponse {

    private Integer id;
    private Double rating;
    private String review;
    private boolean ownFeedback;
    private Integer bookId;
    private String bookTitle;
    private String bookAuthor;
    private String bookCover;
    private String createdDate;
    private String displayName;
    private String userId;
    private boolean isAnonymous;
}