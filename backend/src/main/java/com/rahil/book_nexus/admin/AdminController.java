package com.rahil.book_nexus.admin;

import com.rahil.book_nexus.activity.ActivityFeedRepository;
import com.rahil.book_nexus.book.BookRepository;
import com.rahil.book_nexus.book.UserBookListRepository;
import com.rahil.book_nexus.feedback.FeedbackRepository;
import com.rahil.book_nexus.feedback.LikeRepository;
import com.rahil.book_nexus.feedback.ReviewReplyRepository;
import com.rahil.book_nexus.googlebooks.GoogleBookEntityRepository;
import com.rahil.book_nexus.googlebooks.GoogleBookFeedbackRepository;
import com.rahil.book_nexus.history.BookTransactionHistoryRepository;
import com.rahil.book_nexus.user.FollowRepository;
import com.rahil.book_nexus.user.TokenRepository;
import com.rahil.book_nexus.user.UserRepository;
import com.rahil.book_nexus.user.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final TokenRepository tokenRepository;
    private final FeedbackRepository feedbackRepository;
    private final GoogleBookFeedbackRepository googleBookFeedbackRepository;
    private final BookRepository bookRepository;
    private final BookTransactionHistoryRepository bookTransactionHistoryRepository;
    private final FollowRepository followRepository;
    private final ReviewReplyRepository reviewReplyRepository;
    private final LikeRepository likeRepository;
    private final ActivityFeedRepository activityFeedRepository;
    private final UserBookListRepository userBookListRepository;
    private final GoogleBookEntityRepository googleBookEntityRepository;

    @DeleteMapping("/cleanup-test-data")
    @Transactional
    public ResponseEntity<String> cleanupTestData() {
        try {
            log.info("Starting cleanup of all test data...");

            // Delete in order to respect foreign key constraints
            int likeCount = (int) likeRepository.count();
            int reviewReplyCount = (int) reviewReplyRepository.count();
            int feedbackCount = (int) feedbackRepository.count();
            int googleFeedbackCount = (int) googleBookFeedbackRepository.count();
            int activityCount = (int) activityFeedRepository.count();
            int userBookListCount = (int) userBookListRepository.count();
            int historyCount = (int) bookTransactionHistoryRepository.count();
            int followCount = (int) followRepository.count();
            int bookCount = (int) bookRepository.count();
            int googleBookEntityCount = (int) googleBookEntityRepository.count();
            int tokenCount = (int) tokenRepository.count();
            int profileCount = (int) userProfileRepository.count();
            int userCount = (int) userRepository.count();

            // Delete in order to respect foreign key constraints
            // 1. Delete likes first (they depend on feedback, google feedback, and review replies)
            likeRepository.deleteAll();
            
            // 2. Delete review replies (they depend on feedback)
            reviewReplyRepository.deleteAll();
            
            // 3. Delete activity feeds
            activityFeedRepository.deleteAll();
            
            // 4. Delete feedback and related data
            feedbackRepository.deleteAll();
            googleBookFeedbackRepository.deleteAll();
            
            // 5. Delete user book lists and transaction history
            userBookListRepository.deleteAll();
            bookTransactionHistoryRepository.deleteAll();
            
            // 6. Delete follows
            followRepository.deleteAll();

            // 7. Delete books and Google book entities
            bookRepository.deleteAll();
            googleBookEntityRepository.deleteAll();

            // 8. Delete user-related data
            tokenRepository.deleteAll();
            userProfileRepository.deleteAll();

            // 9. Finally delete users
            userRepository.deleteAll();

            String message = String.format(
                "Successfully cleaned up test data: %d users, %d profiles, %d tokens, %d books, " +
                "%d google book entities, %d feedback, %d google feedback, %d review replies, " +
                "%d likes, %d activity feeds, %d user book lists, %d history records, %d follows",
                userCount, profileCount, tokenCount, bookCount, googleBookEntityCount,
                feedbackCount, googleFeedbackCount, reviewReplyCount, likeCount, 
                activityCount, userBookListCount, historyCount, followCount);
            
            log.info(message);
            return ResponseEntity.ok(message);

        } catch (Exception e) {
            log.error("Failed to cleanup test data", e);
            return ResponseEntity.internalServerError()
                .body("Failed to cleanup test data: " + e.getMessage());
        }
    }
}