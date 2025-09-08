package com.rahil.book_nexus.feedback;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ReviewReplyResponse {
    
    private Integer id;
    private String replyText;
    private String displayName;
    private String userId;
    private String createdDate;
    private boolean ownReply;
    private boolean isAnonymous;
    private Integer parentFeedbackId;
    private Integer parentGoogleFeedbackId;
    private Integer parentReplyId;
    
    // Nested replies (for threading)
    private List<ReviewReplyResponse> replies;
    private int replyCount;
}