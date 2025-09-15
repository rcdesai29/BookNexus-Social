package com.rahil.book_nexus.notification;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class NotificationResponse {
    private Integer id;
    private PersistentNotification.NotificationType type;
    private String message;
    private String triggerUserDisplayName;
    private Integer triggerUserId;
    private Boolean isRead;
    private LocalDateTime createdDate;
    private LocalDateTime readAt;
    private String relatedEntityType;
    private Integer relatedEntityId;
    private String bookTitle;
    private String googleBookId;
}