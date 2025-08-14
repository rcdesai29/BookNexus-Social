package com.rahil.book_nexus.googlebooks;

import com.rahil.book_nexus.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class GoogleBookFeedbackService {

    private final GoogleBookFeedbackRepository feedbackRepository;

    public Integer saveFeedback(GoogleBookFeedbackRequest request, Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        
        // Check if user already reviewed this book
        Optional<GoogleBookFeedback> existingFeedback = feedbackRepository
                .findByGoogleBookIdAndUserId(request.getGoogleBookId(), user.getId());
        
        if (existingFeedback.isPresent()) {
            // Update existing feedback
            GoogleBookFeedback feedback = existingFeedback.get();
            feedback.setRating(request.getRating());
            feedback.setReview(request.getReview());
            feedback.setBookTitle(request.getBookTitle());
            feedback.setAuthorName(request.getAuthorName());
            
            GoogleBookFeedback savedFeedback = feedbackRepository.save(feedback);
            log.info("Updated Google Book feedback for user: {} and book: {}", 
                    user.getFullName(), request.getBookTitle());
            return savedFeedback.getId();
        } else {
            // Create new feedback
            GoogleBookFeedback feedback = GoogleBookFeedback.builder()
                    .googleBookId(request.getGoogleBookId())
                    .bookTitle(request.getBookTitle())
                    .authorName(request.getAuthorName())
                    .rating(request.getRating())
                    .review(request.getReview())
                    .user(user)
                    .build();
            
            GoogleBookFeedback savedFeedback = feedbackRepository.save(feedback);
            log.info("Created Google Book feedback for user: {} and book: {}", 
                    user.getFullName(), request.getBookTitle());
            return savedFeedback.getId();
        }
    }

    public List<GoogleBookFeedbackResponse> getFeedbackByGoogleBookId(String googleBookId) {
        List<GoogleBookFeedback> feedbacks = feedbackRepository.findByGoogleBookId(googleBookId);
        
        return feedbacks.stream()
                .map(this::mapToResponse)
                .toList();
    }

    public Double getAverageRating(String googleBookId) {
        return feedbackRepository.getAverageRatingByGoogleBookId(googleBookId)
                .orElse(0.0);
    }

    public Long getRatingCount(String googleBookId) {
        return feedbackRepository.getRatingCountByGoogleBookId(googleBookId);
    }

    private GoogleBookFeedbackResponse mapToResponse(GoogleBookFeedback feedback) {
        return GoogleBookFeedbackResponse.builder()
                .id(feedback.getId())
                .googleBookId(feedback.getGoogleBookId())
                .bookTitle(feedback.getBookTitle())
                .authorName(feedback.getAuthorName())
                .rating(feedback.getRating())
                .review(feedback.getReview())
                .userName(feedback.getUser() != null ? feedback.getUser().getFullName() : "Unknown User")
                .createdDate(feedback.getCreatedDate())
                .build();
    }
}
