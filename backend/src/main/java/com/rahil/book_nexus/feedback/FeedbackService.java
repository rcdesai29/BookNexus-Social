package com.rahil.book_nexus.feedback;

import com.rahil.book_nexus.book.Book;
import com.rahil.book_nexus.book.BookRepository;
import com.rahil.book_nexus.common.PageResponse;
import com.rahil.book_nexus.exception.OperationNotPermittedException;
import com.rahil.book_nexus.user.User;
import com.rahil.book_nexus.googlebooks.GoogleBookFeedback;
import com.rahil.book_nexus.googlebooks.GoogleBookFeedbackRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final BookRepository bookRepository;
    private final FeedbackMapper feedbackMapper;
    private final GoogleBookFeedbackRepository googleBookFeedbackRepository;

    public Integer save(FeedbackRequest request, Authentication connectedUser) {
        Book book = bookRepository.findById(request.bookId())
                .orElseThrow(() -> new EntityNotFoundException("No book found with ID:: " + request.bookId()));
        if (book.isArchived() || !book.isShareable()) {
            throw new OperationNotPermittedException(
                    "You cannot give a feedback for and archived or not shareable book");
        }
        User user = ((User) connectedUser.getPrincipal());
        if (Objects.equals(book.getCreatedBy(), connectedUser.getName())) {
            throw new OperationNotPermittedException("You cannot give feedback to your own book");
        }
        Feedback feedback = feedbackMapper.toFeedback(request);
        feedback.setUser(user);
        return feedbackRepository.save(feedback).getId();
    }

    @Transactional
    public PageResponse<FeedbackResponse> findAllFeedbacksByBook(Integer bookId, int page, int size,
            Authentication connectedUser) {
        Pageable pageable = PageRequest.of(page, size);
        Integer requesterIdLocal = null;
        if (connectedUser != null && connectedUser.getPrincipal() instanceof User u) {
            requesterIdLocal = u.getId();
        }
        final Integer requesterId = requesterIdLocal;
        Page<Feedback> feedbacks = feedbackRepository.findAllByBookId(bookId, pageable);
        List<FeedbackResponse> feedbackResponses = feedbacks.stream()
                .map(f -> feedbackMapper.toFeedbackResponse(f, requesterId))
                .toList();
        return new PageResponse<>(
                feedbackResponses,
                feedbacks.getNumber(),
                feedbacks.getSize(),
                feedbacks.getTotalElements(),
                feedbacks.getTotalPages(),
                feedbacks.isFirst(),
                feedbacks.isLast());

    }

    @Transactional
    public PageResponse<FeedbackResponse> findAllFeedbacksByUser(Integer userId, int page, int size,
            Authentication connectedUser) {
        Integer requesterIdLocal = null;
        if (connectedUser != null && connectedUser.getPrincipal() instanceof User u) {
            requesterIdLocal = u.getId();
        }
        final Integer requesterId = requesterIdLocal;
        
        // Get all feedback from both sources without pagination first
        List<Feedback> regularFeedbacks = feedbackRepository.findAllByUserId(userId, Pageable.unpaged()).getContent();
        List<GoogleBookFeedback> googleBookFeedbacks = googleBookFeedbackRepository.findAllByUserIdOrderByCreatedDateDesc(userId, Pageable.unpaged()).getContent();
        
        // Convert to unified response format
        List<FeedbackResponse> allFeedbacks = new ArrayList<>();
        
        // Add regular feedbacks
        allFeedbacks.addAll(regularFeedbacks.stream()
                .map(f -> feedbackMapper.toFeedbackResponse(f, requesterId))
                .collect(Collectors.toList()));
        
        // Add Google Book feedbacks
        allFeedbacks.addAll(googleBookFeedbacks.stream()
                .map(f -> feedbackMapper.toFeedbackResponse(f, requesterId))
                .collect(Collectors.toList()));
        
        // Sort by creation date (most recent first)
        allFeedbacks.sort((a, b) -> {
            if (a.getCreatedDate() == null && b.getCreatedDate() == null) return 0;
            if (a.getCreatedDate() == null) return 1;
            if (b.getCreatedDate() == null) return -1;
            return b.getCreatedDate().compareTo(a.getCreatedDate());
        });
        
        // Apply pagination manually
        int totalElements = allFeedbacks.size();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        int start = page * size;
        int end = Math.min(start + size, totalElements);
        
        List<FeedbackResponse> paginatedFeedbacks = start < totalElements ? 
            allFeedbacks.subList(start, end) : new ArrayList<>();
        
        return new PageResponse<>(
                paginatedFeedbacks,
                page,
                size,
                totalElements,
                totalPages,
                page == 0,
                page >= totalPages - 1);
    }

    @Transactional
    public Integer update(Integer feedbackId, FeedbackRequest request, Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new EntityNotFoundException("Feedback not found"));
        
        if (!feedback.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You can only update your own feedback");
        }
        
        feedback.setRating(request.rating());
        feedback.setReview(request.review());
        feedback.setAnonymous(request.isAnonymous() != null ? request.isAnonymous() : false);
        
        return feedbackRepository.save(feedback).getId();
    }

    @Transactional
    public void delete(Integer feedbackId, Authentication connectedUser) {
        User user = (User) connectedUser.getPrincipal();
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new EntityNotFoundException("Feedback not found"));
        
        if (!feedback.getUser().getId().equals(user.getId())) {
            throw new IllegalArgumentException("You can only delete your own feedback");
        }
        
        feedbackRepository.delete(feedback);
    }
}