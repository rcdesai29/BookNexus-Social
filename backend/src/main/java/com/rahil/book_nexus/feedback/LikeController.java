package com.rahil.book_nexus.feedback;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/likes")
@RequiredArgsConstructor
public class LikeController {
    
    private final LikeService likeService;
    
    @PostMapping("/feedback/{feedbackId}")
    public ResponseEntity<Map<String, Object>> toggleFeedbackLike(
            @PathVariable Integer feedbackId,
            Authentication connectedUser
    ) {
        likeService.toggleFeedbackLike(feedbackId, connectedUser);
        long likeCount = likeService.getFeedbackLikeCount(feedbackId);
        boolean isLiked = likeService.isUserLikedFeedback(feedbackId, connectedUser);
        
        return ResponseEntity.ok(Map.of(
            "likeCount", likeCount,
            "isLiked", isLiked
        ));
    }
    
    @PostMapping("/google-feedback/{googleFeedbackId}")
    public ResponseEntity<Map<String, Object>> toggleGoogleFeedbackLike(
            @PathVariable Integer googleFeedbackId,
            Authentication connectedUser
    ) {
        likeService.toggleGoogleFeedbackLike(googleFeedbackId, connectedUser);
        long likeCount = likeService.getGoogleFeedbackLikeCount(googleFeedbackId);
        boolean isLiked = likeService.isUserLikedGoogleFeedback(googleFeedbackId, connectedUser);
        
        return ResponseEntity.ok(Map.of(
            "likeCount", likeCount,
            "isLiked", isLiked
        ));
    }
    
    @PostMapping("/reply/{replyId}")
    public ResponseEntity<Map<String, Object>> toggleReviewReplyLike(
            @PathVariable Integer replyId,
            Authentication connectedUser
    ) {
        likeService.toggleReviewReplyLike(replyId, connectedUser);
        long likeCount = likeService.getReviewReplyLikeCount(replyId);
        boolean isLiked = likeService.isUserLikedReviewReply(replyId, connectedUser);
        
        return ResponseEntity.ok(Map.of(
            "likeCount", likeCount,
            "isLiked", isLiked
        ));
    }
    
    @GetMapping("/feedback/{feedbackId}")
    public ResponseEntity<Map<String, Object>> getFeedbackLikeInfo(
            @PathVariable Integer feedbackId,
            Authentication connectedUser
    ) {
        long likeCount = likeService.getFeedbackLikeCount(feedbackId);
        boolean isLiked = likeService.isUserLikedFeedback(feedbackId, connectedUser);
        
        return ResponseEntity.ok(Map.of(
            "likeCount", likeCount,
            "isLiked", isLiked
        ));
    }
    
    @GetMapping("/google-feedback/{googleFeedbackId}")
    public ResponseEntity<Map<String, Object>> getGoogleFeedbackLikeInfo(
            @PathVariable Integer googleFeedbackId,
            Authentication connectedUser
    ) {
        long likeCount = likeService.getGoogleFeedbackLikeCount(googleFeedbackId);
        boolean isLiked = likeService.isUserLikedGoogleFeedback(googleFeedbackId, connectedUser);
        
        return ResponseEntity.ok(Map.of(
            "likeCount", likeCount,
            "isLiked", isLiked
        ));
    }
    
    @GetMapping("/reply/{replyId}")
    public ResponseEntity<Map<String, Object>> getReviewReplyLikeInfo(
            @PathVariable Integer replyId,
            Authentication connectedUser
    ) {
        long likeCount = likeService.getReviewReplyLikeCount(replyId);
        boolean isLiked = likeService.isUserLikedReviewReply(replyId, connectedUser);
        
        return ResponseEntity.ok(Map.of(
            "likeCount", likeCount,
            "isLiked", isLiked
        ));
    }
}