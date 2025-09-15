package com.rahil.book_nexus.notification;

import com.rahil.book_nexus.common.BaseEntity;
import com.rahil.book_nexus.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "persistent_notifications")
public class PersistentNotification extends BaseEntity {
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NotificationType type;
    
    @Column(nullable = false, length = 1000)
    private String message;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "recipient_user_id", nullable = false)
    private User recipientUser;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trigger_user_id")
    private User triggerUser;
    
    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;
    
    @Column(name = "read_at")
    private LocalDateTime readAt;
    
    // Optional metadata for linking to related entities
    @Column(name = "related_entity_type")
    private String relatedEntityType;
    
    @Column(name = "related_entity_id")
    private Integer relatedEntityId;
    
    @Column(name = "book_title", length = 1000)
    private String bookTitle;
    
    @Column(name = "google_book_id", length = 100)
    private String googleBookId;
    
    public enum NotificationType {
        NEW_FOLLOWER,
        UNFOLLOWED,
        REVIEW_LIKE,
        REPLY_LIKE,
        REVIEW_REPLY
    }
}