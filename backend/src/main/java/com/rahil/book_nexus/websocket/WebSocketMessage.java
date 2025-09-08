package com.rahil.book_nexus.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebSocketMessage {
    private String type;
    private Object data;
    private String userId;
    private Long timestamp;
    
    public static WebSocketMessage notification(String type, Object data) {
        return WebSocketMessage.builder()
                .type(type)
                .data(data)
                .timestamp(System.currentTimeMillis())
                .build();
    }
    
    public static WebSocketMessage userNotification(String type, Object data, String userId) {
        return WebSocketMessage.builder()
                .type(type)
                .data(data)
                .userId(userId)
                .timestamp(System.currentTimeMillis())
                .build();
    }
}