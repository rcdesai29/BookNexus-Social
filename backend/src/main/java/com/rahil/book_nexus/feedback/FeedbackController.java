package com.rahil.book_nexus.feedback;

import com.rahil.book_nexus.common.PageResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("feedbacks")
@RequiredArgsConstructor
@Tag(name = "Feedback")
public class FeedbackController {

    private final FeedbackService service;

    @PostMapping
    public ResponseEntity<Integer> saveFeedback(
            @Valid @RequestBody FeedbackRequest request,
            Authentication connectedUser) {
        return ResponseEntity.ok(service.save(request, connectedUser));
    }

    @GetMapping("/book/{book-id}")
    public ResponseEntity<PageResponse<FeedbackResponse>> findAllFeedbacksByBook(
            @PathVariable("book-id") Integer bookId,
            @RequestParam(name = "page", defaultValue = "0", required = false) int page,
            @RequestParam(name = "size", defaultValue = "10", required = false) int size,
            Authentication connectedUser) {
        return ResponseEntity.ok(service.findAllFeedbacksByBook(bookId, page, size, connectedUser));
    }

    @GetMapping("/user/{user-id}")
    public ResponseEntity<PageResponse<FeedbackResponse>> findAllFeedbacksByUser(
            @PathVariable("user-id") Integer userId,
            @RequestParam(name = "page", defaultValue = "0", required = false) int page,
            @RequestParam(name = "size", defaultValue = "10", required = false) int size,
            Authentication connectedUser) {
        return ResponseEntity.ok(service.findAllFeedbacksByUser(userId, page, size, connectedUser));
    }

    @PutMapping("/{feedback-id}")
    public ResponseEntity<Integer> updateFeedback(
            @PathVariable("feedback-id") Integer feedbackId,
            @Valid @RequestBody FeedbackRequest request,
            Authentication connectedUser) {
        return ResponseEntity.ok(service.update(feedbackId, request, connectedUser));
    }

    @DeleteMapping("/{feedback-id}")
    public ResponseEntity<Void> deleteFeedback(
            @PathVariable("feedback-id") Integer feedbackId,
            Authentication connectedUser) {
        service.delete(feedbackId, connectedUser);
        return ResponseEntity.noContent().build();
    }

    // Google Book endpoints
    @PostMapping("/google-book")
    public ResponseEntity<Integer> saveGoogleBookReview(
            @RequestParam("googleBookId") String googleBookId,
            @RequestParam("bookTitle") String bookTitle,
            @RequestParam("authorName") String authorName,
            @RequestParam("rating") Double rating,
            @RequestParam("review") String review,
            @RequestParam(value = "isAnonymous", defaultValue = "false") Boolean isAnonymous,
            Authentication connectedUser) {
        return ResponseEntity.ok(service.saveGoogleBookReview(googleBookId, bookTitle, authorName, rating, review, isAnonymous, connectedUser));
    }

    @GetMapping("/google-book/{google-book-id}")
    public ResponseEntity<List<FeedbackResponse>> findAllFeedbacksByGoogleBookId(
            @PathVariable("google-book-id") String googleBookId,
            Authentication connectedUser) {
        return ResponseEntity.ok(service.findAllFeedbacksByGoogleBookId(googleBookId, connectedUser));
    }

    @GetMapping("/google-book/{google-book-id}/rating")
    public ResponseEntity<Double> getAverageRatingForGoogleBook(
            @PathVariable("google-book-id") String googleBookId) {
        return ResponseEntity.ok(service.getAverageRatingForGoogleBook(googleBookId));
    }

    @GetMapping("/google-book/{google-book-id}/count")
    public ResponseEntity<Long> getRatingCountForGoogleBook(
            @PathVariable("google-book-id") String googleBookId) {
        return ResponseEntity.ok(service.getRatingCountForGoogleBook(googleBookId));
    }
}