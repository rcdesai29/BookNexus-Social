package com.rahil.book_nexus.feedback;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReviewReplyRequest {
    
    @NotBlank(message = "Reply text is required")
    @Size(max = 2000, message = "Reply text cannot exceed 2000 characters")
    private String replyText;
    
    private Integer parentFeedbackId; // For unified Feedback table
    private Integer parentReplyId; // For nested replies
    
    @Builder.Default
    private Boolean isAnonymous = false;
}