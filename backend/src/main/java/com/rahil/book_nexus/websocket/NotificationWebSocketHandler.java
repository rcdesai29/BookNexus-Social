package com.rahil.book_nexus.websocket;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationWebSocketHandler extends TextWebSocketHandler {

    private final Set<WebSocketSession> sessions = new CopyOnWriteArraySet<>();
    private final Map<String, WebSocketSession> userSessions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.add(session);
        log.info("WebSocket connection established: {}", session.getId());
        
        // Send welcome message
        try {
            WebSocketMessage welcomeMessage = WebSocketMessage.builder()
                    .type("CONNECTION_ESTABLISHED")
                    .data("Connected to BookNexus notifications")
                    .build();
            
            session.sendMessage(new TextMessage(objectMapper.writeValueAsString(welcomeMessage)));
        } catch (Exception e) {
            log.error("Error sending welcome message", e);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session);
        
        // Remove from user sessions map
        String userId = (String) session.getAttributes().get("userId");
        if (userId != null) {
            userSessions.remove(userId);
            log.info("User {} disconnected from WebSocket", userId);
        }
        
        log.info("WebSocket connection closed: {} with status: {}", session.getId(), status);
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) {
        log.info("Received message from {}: {}", session.getId(), message.getPayload());
        
        try {
            // Parse the message to see if it's a user identification message
            WebSocketMessage wsMessage = objectMapper.readValue(message.getPayload(), WebSocketMessage.class);
            
            if ("IDENTIFY_USER".equals(wsMessage.getType()) && wsMessage.getData() instanceof String) {
                String userId = (String) wsMessage.getData();
                session.getAttributes().put("userId", userId);
                userSessions.put(userId, session);
                log.info("User {} identified for WebSocket session {}", userId, session.getId());
                
                // Send confirmation
                WebSocketMessage confirmation = WebSocketMessage.builder()
                    .type("USER_IDENTIFIED")
                    .data("User " + userId + " identified successfully")
                    .build();
                session.sendMessage(new TextMessage(objectMapper.writeValueAsString(confirmation)));
            }
        } catch (Exception e) {
            log.error("Error processing WebSocket message", e);
        }
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.error("Transport error for session {}: {}", session.getId(), exception.getMessage());
        sessions.remove(session);
    }

    /**
     * Broadcast a message to all connected sessions
     */
    public void broadcast(WebSocketMessage message) {
        String messageJson;
        try {
            messageJson = objectMapper.writeValueAsString(message);
        } catch (Exception e) {
            log.error("Error serializing message", e);
            return;
        }

        sessions.removeIf(session -> {
            try {
                if (session.isOpen()) {
                    session.sendMessage(new TextMessage(messageJson));
                    return false;
                } else {
                    return true; // Remove closed sessions
                }
            } catch (IOException e) {
                log.error("Error sending message to session {}: {}", session.getId(), e.getMessage());
                return true; // Remove sessions that can't receive messages
            }
        });
    }

    /**
     * Send message to a specific user (if we can identify them by session)
     */
    public void sendToUser(String userId, WebSocketMessage message) {
        WebSocketSession userSession = userSessions.get(userId);
        
        if (userSession != null && userSession.isOpen()) {
            try {
                String messageJson = objectMapper.writeValueAsString(message);
                userSession.sendMessage(new TextMessage(messageJson));
                log.info("Sent targeted message to user {}: {}", userId, message.getType());
            } catch (IOException e) {
                log.error("Error sending message to user {}: {}", userId, e.getMessage());
                // Remove dead session
                userSessions.remove(userId);
                sessions.remove(userSession);
            }
        } else {
            log.debug("User {} not connected or session closed, message not sent: {}", userId, message.getType());
        }
    }

    /**
     * Get the count of active connections
     */
    public int getActiveConnectionsCount() {
        return sessions.size();
    }
}