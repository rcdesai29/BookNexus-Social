package com.rahil.book_nexus.feedback;

import com.rahil.book_nexus.book.Book;
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
                .build();
    }
}