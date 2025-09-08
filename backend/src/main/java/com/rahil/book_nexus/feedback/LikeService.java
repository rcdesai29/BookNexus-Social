package com.rahil.book_nexus.feedback;

import com.rahil.book_nexus.googlebooks.GoogleBookFeedback;
import com.rahil.book_nexus.googlebooks.GoogleBookFeedbackRepository;
import com.rahil.book_nexus.user.User;
import com.rahil.book_nexus.user.UserProfile;
import com.rahil.book_nexus.user.UserProfileRepository;
import com.rahil.book_nexus.websocket.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class LikeService {
    
    private final LikeRepository likeRepository;
    private final FeedbackRepository feedbackRepository;
    private final GoogleBookFeedbackRepository googleFeedbackRepository;
    private final ReviewReplyRepository reviewReplyRepository;
    private final UserProfileRepository userProfileRepository;
    private final NotificationService notificationService;
    
    public void toggleFeedbackLike(Integer feedbackId, Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        Feedback feedback = feedbackRepository.findById(feedbackId)
            .orElse(null);
        
        if (feedback == null) {
            return; // Silently ignore if feedback doesn't exist
        }
        
        var existingLike = likeRepository.findByUserAndFeedback(user, feedback);
        
        if (existingLike.isPresent()) {
            // Unlike - remove the like
            likeRepository.delete(existingLike.get());
        } else {
            // Like - add the like
            Like newLike = Like.builder()
                .user(user)
                .feedback(feedback)
                .build();
            likeRepository.save(newLike);
            
            // Send notification to the feedback author (if not liking own feedback)
            if (!feedback.getUser().getId().equals(user.getId())) {
                UserProfile userProfile = userProfileRepository.findByUserId(user.getId()).orElse(null);
                String displayName = (userProfile != null && userProfile.getDisplayName() != null) 
                    ? userProfile.getDisplayName() 
                    : user.getFullName();
                String message = String.format("%s liked your review", displayName);
                notificationService.sendReviewLikeNotification(feedback.getUser().getId().toString(), message);
            }
        }
    }
    
    public void toggleGoogleFeedbackLike(Integer googleFeedbackId, Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        GoogleBookFeedback googleFeedback = googleFeedbackRepository.findById(googleFeedbackId)
            .orElse(null);
        
        if (googleFeedback == null) {
            return; // Silently ignore if google feedback doesn't exist
        }
        
        var existingLike = likeRepository.findByUserAndGoogleFeedback(user, googleFeedback);
        
        if (existingLike.isPresent()) {
            // Unlike - remove the like
            likeRepository.delete(existingLike.get());
        } else {
            // Like - add the like
            Like newLike = Like.builder()
                .user(user)
                .googleFeedback(googleFeedback)
                .build();
            likeRepository.save(newLike);
            
            // Send notification to the feedback author (if not liking own feedback)
            if (!googleFeedback.getUser().getId().equals(user.getId())) {
                UserProfile userProfile = userProfileRepository.findByUserId(user.getId()).orElse(null);
                String displayName = (userProfile != null && userProfile.getDisplayName() != null) 
                    ? userProfile.getDisplayName() 
                    : user.getFullName();
                String message = String.format("%s liked your review of \"%s\"", displayName, googleFeedback.getBookTitle());
                notificationService.sendReviewLikeNotification(googleFeedback.getUser().getId().toString(), message);
            }
        }
    }
    
    public void toggleReviewReplyLike(Integer replyId, Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        ReviewReply reply = reviewReplyRepository.findById(replyId)
            .orElse(null);
        
        if (reply == null) {
            return; // Silently ignore if reply doesn't exist
        }
        
        var existingLike = likeRepository.findByUserAndReviewReply(user, reply);
        
        if (existingLike.isPresent()) {
            // Unlike - remove the like
            likeRepository.delete(existingLike.get());
        } else {
            // Like - add the like
            Like newLike = Like.builder()
                .user(user)
                .reviewReply(reply)
                .build();
            likeRepository.save(newLike);
            
            // Send notification to the reply author (if not liking own reply)
            if (!reply.getUser().getId().equals(user.getId())) {
                UserProfile userProfile = userProfileRepository.findByUserId(user.getId()).orElse(null);
                String displayName = (userProfile != null && userProfile.getDisplayName() != null) 
                    ? userProfile.getDisplayName() 
                    : user.getFullName();
                String message = String.format("%s liked your comment", displayName);
                notificationService.sendReplyLikeNotification(reply.getUser().getId().toString(), message);
            }
        }
    }
    
    public long getFeedbackLikeCount(Integer feedbackId) {
        return feedbackRepository.findById(feedbackId)
            .map(feedback -> likeRepository.countByFeedback(feedback))
            .orElse(0L);
    }
    
    public long getGoogleFeedbackLikeCount(Integer googleFeedbackId) {
        return googleFeedbackRepository.findById(googleFeedbackId)
            .map(googleFeedback -> likeRepository.countByGoogleFeedback(googleFeedback))
            .orElse(0L);
    }
    
    public long getReviewReplyLikeCount(Integer replyId) {
        return reviewReplyRepository.findById(replyId)
            .map(reply -> likeRepository.countByReviewReply(reply))
            .orElse(0L);
    }
    
    public boolean isUserLikedFeedback(Integer feedbackId, Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        return feedbackRepository.findById(feedbackId)
            .map(feedback -> likeRepository.existsByUserAndFeedback(user, feedback))
            .orElse(false);
    }
    
    public boolean isUserLikedGoogleFeedback(Integer googleFeedbackId, Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        return googleFeedbackRepository.findById(googleFeedbackId)
            .map(googleFeedback -> likeRepository.existsByUserAndGoogleFeedback(user, googleFeedback))
            .orElse(false);
    }
    
    public boolean isUserLikedReviewReply(Integer replyId, Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        return reviewReplyRepository.findById(replyId)
            .map(reply -> likeRepository.existsByUserAndReviewReply(user, reply))
            .orElse(false);
    }
}