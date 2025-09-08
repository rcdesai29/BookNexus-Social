package com.rahil.book_nexus.feedback;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface ReviewReplyRepository extends JpaRepository<ReviewReply, Integer> {
    
    // Find all replies for a feedback review (unified)
    List<ReviewReply> findByParentFeedbackIdOrderByCreatedDateAsc(Integer parentFeedbackId);
    
    // Find all replies to a specific reply (nested replies)
    List<ReviewReply> findByParentReplyOrderByCreatedDateAsc(ReviewReply parentReply);
    
    // Count replies for a feedback
    long countByParentFeedbackId(Integer parentFeedbackId);
    
    // Get all replies in a thread (including nested) for a feedback
    @Query("SELECT r FROM ReviewReply r WHERE r.parentFeedback.id = :feedbackId OR r.parentReply IN " +
           "(SELECT r2 FROM ReviewReply r2 WHERE r2.parentFeedback.id = :feedbackId) " +
           "ORDER BY r.createdDate ASC")
    List<ReviewReply> findAllRepliesInThreadByFeedbackId(@Param("feedbackId") Integer feedbackId);
}