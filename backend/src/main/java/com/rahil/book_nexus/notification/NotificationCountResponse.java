package com.rahil.book_nexus.notification;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class NotificationCountResponse {
    private long unreadCount;
    private long totalCount;
}