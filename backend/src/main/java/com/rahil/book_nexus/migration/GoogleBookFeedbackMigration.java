package com.rahil.book_nexus.migration;

import com.rahil.book_nexus.feedback.Feedback;
import com.rahil.book_nexus.feedback.FeedbackRepository;
import com.rahil.book_nexus.googlebooks.GoogleBookFeedback;
import com.rahil.book_nexus.googlebooks.GoogleBookFeedbackRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class GoogleBookFeedbackMigration implements CommandLineRunner {

    private final GoogleBookFeedbackRepository googleBookFeedbackRepository;
    private final FeedbackRepository feedbackRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Starting Google Book feedback migration...");
        
        // Get all Google Book feedbacks that haven't been migrated yet
        List<GoogleBookFeedback> googleFeedbacks = googleBookFeedbackRepository.findAll();
        
        if (googleFeedbacks.isEmpty()) {
            log.info("No Google Book feedbacks found to migrate");
            return;
        }
        
        log.info("Found {} Google Book feedbacks to migrate", googleFeedbacks.size());
        
        int migrated = 0;
        for (GoogleBookFeedback googleFeedback : googleFeedbacks) {
            try {
                // Check if this feedback has already been migrated
                boolean exists = feedbackRepository.existsByGoogleBookIdAndUserIdAndReviewAndRating(
                    googleFeedback.getGoogleBookId(),
                    googleFeedback.getUser().getId(),
                    googleFeedback.getReview(),
                    googleFeedback.getRating()
                );
                
                if (exists) {
                    log.debug("Feedback for Google Book {} by user {} already exists, skipping", 
                             googleFeedback.getGoogleBookId(), googleFeedback.getUser().getId());
                    continue;
                }
                
                // Create new unified Feedback entity
                Feedback unifiedFeedback = Feedback.builder()
                    .googleBookId(googleFeedback.getGoogleBookId())
                    .bookTitle(googleFeedback.getBookTitle())
                    .authorName(googleFeedback.getAuthorName())
                    .rating(googleFeedback.getRating())
                    .review(googleFeedback.getReview())
                    .anonymous(googleFeedback.getIsAnonymous() != null ? googleFeedback.getIsAnonymous() : false)
                    .source(Feedback.ReviewSource.GOOGLE)
                    .user(googleFeedback.getUser())
                    .book(null) // No local book reference for Google reviews
                    .build();
                
                // Copy audit fields manually
                unifiedFeedback.setCreatedDate(googleFeedback.getCreatedDate());
                unifiedFeedback.setLastModifiedDate(googleFeedback.getLastModifiedDate());
                unifiedFeedback.setCreatedBy(googleFeedback.getCreatedBy());
                unifiedFeedback.setLastModifiedBy(googleFeedback.getLastModifiedBy());
                
                feedbackRepository.save(unifiedFeedback);
                migrated++;
                
                log.debug("Migrated Google Book feedback {} -> Unified feedback {}", 
                         googleFeedback.getId(), unifiedFeedback.getId());
                         
            } catch (Exception e) {
                log.error("Failed to migrate Google Book feedback {}: {}", 
                         googleFeedback.getId(), e.getMessage());
            }
        }
        
        log.info("Migration completed: {} Google Book feedbacks migrated to unified system", migrated);
    }
}