package com.rahil.book_nexus.feedback;
import com.rahil.book_nexus.user.User;
import com.rahil.book_nexus.user.UserProfile;
import com.rahil.book_nexus.user.UserProfileRepository;
import com.rahil.book_nexus.websocket.NotificationService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class ReviewReplyService {
    
    private final ReviewReplyRepository reviewReplyRepository;
    private final FeedbackRepository feedbackRepository;
    private final UserProfileRepository userProfileRepository;
    private final NotificationService notificationService;
    
    public ReviewReplyResponse createReply(ReviewReplyRequest request, Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        
        // Validate the request
        validateReplyRequest(request);
        
        // Get parent feedback
        Feedback parentFeedback = feedbackRepository.findById(request.getParentFeedbackId())
                .orElseThrow(() -> new EntityNotFoundException("Parent feedback not found"));
        
        ReviewReply reply = ReviewReply.builder()
                .replyText(request.getReplyText())
                .parentFeedback(parentFeedback)
                .user(user)
                .isAnonymous(request.getIsAnonymous() != null ? request.getIsAnonymous() : false)
                .build();
        
        // Set parent reply if it's a nested reply
        if (request.getParentReplyId() != null) {
            ReviewReply parentReply = reviewReplyRepository.findById(request.getParentReplyId())
                    .orElseThrow(() -> new EntityNotFoundException("Parent reply not found"));
            reply.setParentReply(parentReply);
        }
        
        ReviewReply savedReply = reviewReplyRepository.save(reply);
        
        // Send notification to the original review author (if not replying to own review)
        sendReplyNotification(savedReply, user);
        
        return mapToResponse(savedReply, user);
    }
    
    public List<ReviewReplyResponse> getRepliesForFeedback(Integer feedbackId, Authentication connectedUser) {
        User user = connectedUser != null ? (User) connectedUser.getPrincipal() : null;
        List<ReviewReply> replies = reviewReplyRepository.findByParentFeedbackIdOrderByCreatedDateAsc(feedbackId);
        return buildThreadedReplies(replies, user);
    }
    
    public long getReplyCount(Integer feedbackId) {
        return reviewReplyRepository.countByParentFeedbackId(feedbackId);
    }
    
    public void deleteReply(Integer replyId, Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        ReviewReply reply = reviewReplyRepository.findById(replyId)
                .orElseThrow(() -> new EntityNotFoundException("Reply not found"));
        
        // Check if user owns the reply
        if (!reply.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You can only delete your own replies");
        }
        
        reviewReplyRepository.delete(reply);
    }
    
    private void validateReplyRequest(ReviewReplyRequest request) {
        log.debug("Validating reply request: parentFeedbackId={}", request.getParentFeedbackId());
        
        // Must have parentFeedbackId
        if (request.getParentFeedbackId() == null) {
            throw new IllegalArgumentException("Reply must have a parent feedback ID");
        }
        
        // Validate that the parent feedback exists
        boolean exists = feedbackRepository.existsById(request.getParentFeedbackId());
        log.debug("Feedback ID {} exists: {}", request.getParentFeedbackId(), exists);
        if (!exists) {
            throw new IllegalArgumentException("Parent feedback no longer exists");
        }
    }
    
    private void sendReplyNotification(ReviewReply reply, User replyAuthor) {
        try {
            User originalAuthor = null;
            String bookTitle = "a book";
            
            if (reply.isNestedReply()) {
                // For nested reply, notify the parent reply author
                originalAuthor = reply.getParentReply().getUser();
                bookTitle = reply.getParentReply().getParentFeedback().getBookTitle();
            } else {
                // For direct reply to review, notify the review author
                originalAuthor = reply.getParentFeedback().getUser();
                bookTitle = reply.getParentFeedback().getBookTitle();
            }
            
            // Don't send notification if replying to own review
            if (originalAuthor != null && !originalAuthor.getId().equals(replyAuthor.getId())) {
                UserProfile replyAuthorProfile = userProfileRepository.findByUserId(replyAuthor.getId()).orElse(null);
                String displayName = (replyAuthorProfile != null && replyAuthorProfile.getDisplayName() != null) 
                    ? replyAuthorProfile.getDisplayName() 
                    : replyAuthor.getFullName();
                
                String message = String.format("%s replied to your review of \"%s\"", displayName, bookTitle);
                notificationService.sendReviewReplyNotificationToUser(originalAuthor.getId(), message, replyAuthor.getId(), reply.getParentFeedback().getId());
                log.info("Sent review reply notification to user {}", originalAuthor.getId());
            }
        } catch (Exception e) {
            log.error("Failed to send review reply notification", e);
        }
    }
    
    private List<ReviewReplyResponse> buildThreadedReplies(List<ReviewReply> replies, User currentUser) {
        // Group replies by parent - top level replies have no parent reply
        List<ReviewReply> topLevelReplies = replies.stream()
                .filter(reply -> reply.getParentReply() == null)
                .collect(Collectors.toList());
        
        List<ReviewReplyResponse> result = new ArrayList<>();
        
        for (ReviewReply reply : topLevelReplies) {
            ReviewReplyResponse replyResponse = mapToResponse(reply, currentUser);
            
            // Find nested replies for this reply
            List<ReviewReply> nestedReplies = replies.stream()
                    .filter(r -> r.getParentReply() != null && r.getParentReply().getId().equals(reply.getId()))
                    .collect(Collectors.toList());
            
            List<ReviewReplyResponse> nestedResponses = nestedReplies.stream()
                    .map(nested -> mapToResponse(nested, currentUser))
                    .collect(Collectors.toList());
            
            replyResponse.setReplies(nestedResponses);
            replyResponse.setReplyCount(nestedReplies.size());
            
            result.add(replyResponse);
        }
        
        return result;
    }
    
    private ReviewReplyResponse mapToResponse(ReviewReply reply, User currentUser) {
        UserProfile userProfile = userProfileRepository.findByUserId(reply.getUser().getId()).orElse(null);
        String displayName;
        
        if (reply.getIsAnonymous()) {
            displayName = "Anonymous";
        } else {
            displayName = (userProfile != null && userProfile.getDisplayName() != null) 
                ? userProfile.getDisplayName() 
                : reply.getUser().getFullName();
        }
        
        return ReviewReplyResponse.builder()
                .id(reply.getId())
                .replyText(reply.getReplyText())
                .displayName(displayName)
                .userId(reply.getIsAnonymous() ? null : reply.getUser().getId().toString())
                .createdDate(reply.getCreatedDate().format(DateTimeFormatter.ofPattern("MMM dd, yyyy")))
                .ownReply(currentUser != null && currentUser.getId().equals(reply.getUser().getId()))
                .isAnonymous(reply.getIsAnonymous() != null ? reply.getIsAnonymous() : false)
                .parentFeedbackId(reply.getParentFeedback().getId())
                .parentGoogleFeedbackId(null) // No longer used
                .parentReplyId(reply.getParentReply() != null ? reply.getParentReply().getId() : null)
                .replies(new ArrayList<>()) // Will be populated by buildThreadedReplies
                .replyCount(0) // Will be set by buildThreadedReplies
                .build();
    }
}