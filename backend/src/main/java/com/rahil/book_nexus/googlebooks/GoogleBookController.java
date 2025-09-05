package com.rahil.book_nexus.googlebooks;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("google-books")
@RequiredArgsConstructor
@Tag(name = "Google Books")
public class GoogleBookController {

    private final GoogleBookService googleBookService;
    private final GoogleBookFeedbackService feedbackService;

    @GetMapping("/search")
    public ResponseEntity<GoogleBookResponse> searchBooks(
            @RequestParam("q") String query,
            @RequestParam(name = "maxResults", defaultValue = "20") int maxResults,
            @RequestParam(name = "startIndex", defaultValue = "0") int startIndex) {
        
        GoogleBookResponse response = googleBookService.searchBooks(query, maxResults, startIndex);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{bookId}")
    public ResponseEntity<GoogleBookDto> getBookById(@PathVariable String bookId) {
        GoogleBookDto book = googleBookService.getBookById(bookId);
        if (book != null) {
            return ResponseEntity.ok(book);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/trending")
    public ResponseEntity<GoogleBookResponse> getTrendingBooks(
            @RequestParam(name = "maxResults", defaultValue = "10") int maxResults) {
        
        GoogleBookResponse response = googleBookService.getTrendingBooks(maxResults);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/popular")
    public ResponseEntity<GoogleBookResponse> getPopularBooks(
            @RequestParam(name = "category", defaultValue = "fiction") String category,
            @RequestParam(name = "maxResults", defaultValue = "10") int maxResults) {
        
        GoogleBookResponse response = googleBookService.getPopularBooks(category, maxResults);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/feedback")
    public ResponseEntity<Integer> saveFeedback(
            @Valid @RequestBody GoogleBookFeedbackRequest request,
            Authentication connectedUser) {
        
        Integer feedbackId = feedbackService.saveFeedback(request, connectedUser);
        return ResponseEntity.ok(feedbackId);
    }

    @GetMapping("/feedback/{googleBookId}")
    public ResponseEntity<List<GoogleBookFeedbackResponse>> getFeedbackByGoogleBookId(
            @PathVariable String googleBookId) {
        
        List<GoogleBookFeedbackResponse> feedbacks = feedbackService.getFeedbackByGoogleBookId(googleBookId);
        return ResponseEntity.ok(feedbacks);
    }

    @GetMapping("/feedback/{googleBookId}/rating")
    public ResponseEntity<Double> getAverageRating(@PathVariable String googleBookId) {
        Double averageRating = feedbackService.getAverageRating(googleBookId);
        return ResponseEntity.ok(averageRating);
    }

    @GetMapping("/feedback/{googleBookId}/count")
    public ResponseEntity<Long> getRatingCount(@PathVariable String googleBookId) {
        Long ratingCount = feedbackService.getRatingCount(googleBookId);
        return ResponseEntity.ok(ratingCount);
    }

    @PutMapping("/feedback/{feedbackId}")
    public ResponseEntity<Integer> updateGoogleBookFeedback(
            @PathVariable Integer feedbackId,
            @Valid @RequestBody GoogleBookFeedbackRequest request,
            Authentication connectedUser) {
        Integer updatedId = feedbackService.updateFeedback(feedbackId, request, connectedUser);
        return ResponseEntity.ok(updatedId);
    }

    @DeleteMapping("/feedback/{feedbackId}")
    public ResponseEntity<Void> deleteGoogleBookFeedback(
            @PathVariable Integer feedbackId,
            Authentication connectedUser) {
        feedbackService.deleteFeedback(feedbackId, connectedUser);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/feedback/user/{userId}")
    public ResponseEntity<List<GoogleBookFeedbackResponse>> getFeedbackByUserId(
            @PathVariable Integer userId) {
        List<GoogleBookFeedbackResponse> feedbacks = feedbackService.getFeedbackByUserId(userId);
        return ResponseEntity.ok(feedbacks);
    }
}
