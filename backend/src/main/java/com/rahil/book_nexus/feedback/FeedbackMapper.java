package com.rahil.book_nexus.feedback;

import com.rahil.book_nexus.book.Book;
import com.rahil.book_nexus.googlebooks.GoogleBookFeedback;
import com.rahil.book_nexus.user.UserProfileRepository;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;

import java.util.Objects;

@Service
@RequiredArgsConstructor
public class FeedbackMapper {

    private final UserProfileRepository userProfileRepository;
    public Feedback toFeedback(FeedbackRequest request) {
        return Feedback.builder()
                .rating(request.rating())
                .review(request.review())
                .anonymous(request.isAnonymous() != null ? request.isAnonymous() : false)
                .book(Book.builder()
                        .id(request.bookId())
                        .shareable(false)
                        .archived(false)
                        .build())
                .build();
    }

    public FeedbackResponse toFeedbackResponse(Feedback feedback, Integer id) {
        String displayName;
        if (feedback.getAnonymous() != null && feedback.getAnonymous()) {
            displayName = "Anonymous";
        } else {
            displayName = userProfileRepository.findByUserId(feedback.getUser().getId())
                    .map(profile -> profile.getDisplayName())
                    .orElse(feedback.getUser().getFullName());
        }
                
        return FeedbackResponse.builder()
                .id(feedback.getId())
                .rating(feedback.getRating())
                .review(feedback.getReview())
                .ownFeedback(Objects.equals(feedback.getUser().getId(), id))
                .bookId(feedback.getBook() != null ? feedback.getBook().getId() : null)
                .bookTitle(feedback.getBook() != null ? feedback.getBook().getTitle() : feedback.getBookTitle())
                .bookAuthor(feedback.getBook() != null ? feedback.getBook().getAuthorName() : feedback.getAuthorName())
                .bookCover(feedback.getBook() != null ? feedback.getBook().getBookCover() : null)
                .createdDate(feedback.getCreatedDate() != null ? feedback.getCreatedDate().toString() : null)
                .displayName(displayName)
                .userId(feedback.getUser().getId().toString())
                .isAnonymous(feedback.getAnonymous() != null && feedback.getAnonymous())
                .build();
    }

    public FeedbackResponse toFeedbackResponse(GoogleBookFeedback googleBookFeedback, Integer id) {
        String displayName;
        if (googleBookFeedback.getIsAnonymous() != null && googleBookFeedback.getIsAnonymous()) {
            displayName = "Anonymous";
        } else {
            displayName = userProfileRepository.findByUserId(googleBookFeedback.getUser().getId())
                    .map(profile -> profile.getDisplayName())
                    .orElse(googleBookFeedback.getUser().getFullName());
        }
                
        return FeedbackResponse.builder()
                .id(googleBookFeedback.getId())
                .rating(googleBookFeedback.getRating())
                .review(googleBookFeedback.getReview())
                .ownFeedback(Objects.equals(googleBookFeedback.getUser().getId(), id))
                .bookId(null) // Google books don't have regular book IDs
                .bookTitle(googleBookFeedback.getBookTitle())
                .bookAuthor(googleBookFeedback.getAuthorName())
                .bookCover(null) // Google book covers would need to be fetched separately
                .createdDate(googleBookFeedback.getCreatedDate() != null ? googleBookFeedback.getCreatedDate().toString() : null)
                .displayName(displayName)
                .userId(googleBookFeedback.getUser().getId().toString())
                .isAnonymous(googleBookFeedback.getIsAnonymous() != null ? googleBookFeedback.getIsAnonymous() : false)
                .build();
    }
}