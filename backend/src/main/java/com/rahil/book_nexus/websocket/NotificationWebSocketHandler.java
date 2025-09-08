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
import java.util.Set;
import java.util.concurrent.CopyOnWriteArraySet;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationWebSocketHandler extends TextWebSocketHandler {

    private final Set<WebSocketSession> sessions = new CopyOnWriteArraySet<>();
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
        log.info("WebSocket connection closed: {} with status: {}", session.getId(), status);
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) {
        log.info("Received message from {}: {}", session.getId(), message.getPayload());
        // Handle incoming messages if needed
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
        // For now, this is a placeholder. In a real implementation, you'd need to
        // associate sessions with user IDs during authentication
        broadcast(message);
    }

    /**
     * Get the count of active connections
     */
    public int getActiveConnectionsCount() {
        return sessions.size();
    }
}