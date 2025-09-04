package com.rahil.book_nexus.googlebooks;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.DecimalMax;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleBookFeedbackRequest {
    @NotBlank(message = "Google Book ID is required")
    private String googleBookId;
    
    @NotBlank(message = "Book title is required")
    private String bookTitle;
    
    @NotBlank(message = "Author name is required")
    private String authorName;
    
    @NotNull(message = "Rating is required")
    @DecimalMin(value = "1.0", message = "Rating must be at least 1.0")
    @DecimalMax(value = "5.0", message = "Rating must be at most 5.0")
    private Double rating;
    
    @NotBlank(message = "Review is required")
    private String review;
    
    private Boolean isAnonymous;
}
