package com.rahil.book_nexus.feedback;

import com.rahil.book_nexus.common.BaseEntity;
import com.rahil.book_nexus.user.User;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import lombok.Builder;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class ReviewReply extends BaseEntity {
    
    @Column(length = 2000, nullable = false)
    private String replyText;
    
    // Reference to parent review (now unified in Feedback table)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_feedback_id", nullable = false)
    private Feedback parentFeedback;
    
    // Reference to parent reply (for nested replies)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_reply_id")
    private ReviewReply parentReply;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Builder.Default
    @Column(name = "is_anonymous", columnDefinition = "boolean default false")
    private Boolean isAnonymous = false;
    
    // Helper method to check if it's a nested reply
    public boolean isNestedReply() {
        return parentReply != null;
    }
}