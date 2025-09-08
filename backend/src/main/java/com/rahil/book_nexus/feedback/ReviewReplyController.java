package com.rahil.book_nexus.feedback;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/review-replies")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ReviewReplyController {
    
    private final ReviewReplyService reviewReplyService;
    
    @PostMapping
    public ResponseEntity<?> createReply(
            @Valid @RequestBody ReviewReplyRequest request, 
            Authentication connectedUser) {
        try {
            ReviewReplyResponse response = reviewReplyService.createReply(request, connectedUser);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", e.getMessage()));
        }
    }
    
    @GetMapping("/feedback/{feedbackId}")
    public ResponseEntity<List<ReviewReplyResponse>> getRepliesForFeedback(
            @PathVariable Integer feedbackId,
            Authentication connectedUser) {
        List<ReviewReplyResponse> replies = reviewReplyService.getRepliesForFeedback(feedbackId, connectedUser);
        return ResponseEntity.ok(replies);
    }
    
    @GetMapping("/count/{feedbackId}")
    public ResponseEntity<Long> getReplyCount(@PathVariable Integer feedbackId) {
        long count = reviewReplyService.getReplyCount(feedbackId);
        return ResponseEntity.ok(count);
    }
    
    @DeleteMapping("/{replyId}")
    public ResponseEntity<Void> deleteReply(
            @PathVariable Integer replyId, 
            Authentication connectedUser) {
        reviewReplyService.deleteReply(replyId, connectedUser);
        return ResponseEntity.noContent().build();
    }
}