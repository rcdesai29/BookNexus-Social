package com.rahil.book_nexus.feedback;

import com.rahil.book_nexus.googlebooks.GoogleBookFeedback;
import com.rahil.book_nexus.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface LikeRepository extends JpaRepository<Like, Integer> {
    
    // Find like by user and feedback
    Optional<Like> findByUserAndFeedback(User user, Feedback feedback);
    
    // Find like by user and Google feedback
    Optional<Like> findByUserAndGoogleFeedback(User user, GoogleBookFeedback googleFeedback);
    
    // Find like by user and review reply
    Optional<Like> findByUserAndReviewReply(User user, ReviewReply reviewReply);
    
    // Count likes for a feedback
    long countByFeedback(Feedback feedback);
    
    // Count likes for a Google feedback
    long countByGoogleFeedback(GoogleBookFeedback googleFeedback);
    
    // Count likes for a review reply
    long countByReviewReply(ReviewReply reviewReply);
    
    // Check if user liked a specific feedback
    boolean existsByUserAndFeedback(User user, Feedback feedback);
    
    // Check if user liked a specific Google feedback
    boolean existsByUserAndGoogleFeedback(User user, GoogleBookFeedback googleFeedback);
    
    // Check if user liked a specific review reply
    boolean existsByUserAndReviewReply(User user, ReviewReply reviewReply);
    
    // Delete like by user and feedback
    void deleteByUserAndFeedback(User user, Feedback feedback);
    
    // Delete like by user and Google feedback
    void deleteByUserAndGoogleFeedback(User user, GoogleBookFeedback googleFeedback);
    
    // Delete like by user and review reply
    void deleteByUserAndReviewReply(User user, ReviewReply reviewReply);
}