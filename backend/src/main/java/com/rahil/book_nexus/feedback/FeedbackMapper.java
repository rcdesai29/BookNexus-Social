package com.rahil.book_nexus.feedback;

import com.rahil.book_nexus.book.Book;
import com.rahil.book_nexus.googlebooks.GoogleBookFeedback;
import org.springframework.stereotype.Service;

import java.util.Objects;

@Service
public class FeedbackMapper {
    public Feedback toFeedback(FeedbackRequest request) {
        return Feedback.builder()
                .rating(request.rating())
                .review(request.review())
                .book(Book.builder()
                        .id(request.bookId())
                        .shareable(false)
                        .archived(false)
                        .build())
                .build();
    }

    public FeedbackResponse toFeedbackResponse(Feedback feedback, Integer id) {
        return FeedbackResponse.builder()
                .rating(feedback.getRating())
                .review(feedback.getReview())
                .ownFeedback(Objects.equals(feedback.getUser().getId(), id))
                .bookId(feedback.getBook().getId())
                .bookTitle(feedback.getBook().getTitle())
                .bookAuthor(feedback.getBook().getAuthorName())
                .bookCover(feedback.getBook().getBookCover())
                .createdDate(feedback.getCreatedDate() != null ? feedback.getCreatedDate().toString() : null)
                .build();
    }

    public FeedbackResponse toFeedbackResponse(GoogleBookFeedback googleBookFeedback, Integer id) {
        return FeedbackResponse.builder()
                .rating(googleBookFeedback.getRating())
                .review(googleBookFeedback.getReview())
                .ownFeedback(Objects.equals(googleBookFeedback.getUser().getId(), id))
                .bookId(null) // Google books don't have regular book IDs
                .bookTitle(googleBookFeedback.getBookTitle())
                .bookAuthor(googleBookFeedback.getAuthorName())
                .bookCover(null) // Google book covers would need to be fetched separately
                .createdDate(googleBookFeedback.getCreatedDate() != null ? googleBookFeedback.getCreatedDate().toString() : null)
                .build();
    }
}