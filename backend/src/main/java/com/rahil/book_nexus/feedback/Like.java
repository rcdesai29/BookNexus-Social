package com.rahil.book_nexus.feedback;

import com.rahil.book_nexus.googlebooks.GoogleBookFeedback;
import com.rahil.book_nexus.user.User;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "likes")
@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@EntityListeners(AuditingEntityListener.class)
@EqualsAndHashCode
public class Like {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // For liking reviews (local feedback)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "feedback_id")
    private Feedback feedback;

    // For liking reviews (Google Book feedback)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "google_feedback_id")
    private GoogleBookFeedback googleFeedback;

    // For liking reply comments
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_reply_id")
    private ReviewReply reviewReply;

    @CreatedDate
    @Column(name = "created_date", nullable = false, updatable = false)
    private LocalDateTime createdDate;

    // Ensure only one of the three target types is set
    @PrePersist
    @PreUpdate
    private void validateSingleTarget() {
        int targetCount = 0;
        if (feedback != null) targetCount++;
        if (googleFeedback != null) targetCount++;
        if (reviewReply != null) targetCount++;
        
        if (targetCount != 1) {
            throw new IllegalStateException("Like must have exactly one target (feedback, googleFeedback, or reviewReply)");
        }
    }
}