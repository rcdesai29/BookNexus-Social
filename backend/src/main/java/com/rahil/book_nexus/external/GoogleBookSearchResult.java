package com.rahil.book_nexus.external;

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
public class GoogleBookSearchResult {

    private String googleId;
    private String title;
    private String authorName;
    private String description;
    private String isbn;
    private String thumbnailUrl;
    private String publishedDate;
    private String category;

    // Helper method to check if this is a valid book result
    public boolean isValid() {
        return title != null && !title.trim().isEmpty()
                && authorName != null && !authorName.trim().isEmpty();
    }
}
