package com.rahil.book_nexus.googlebooks;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleBookDto {
    private String id;
    private String title;
    private List<String> authors;
    private String description;
    private String publishedDate;
    private Integer pageCount;
    private List<String> categories;
    private Double averageRating;
    private Integer ratingsCount;
    private String isbn13;
    private String isbn10;
    private GoogleBookImageLinks imageLinks;
    private List<GoogleBookIndustryIdentifier> industryIdentifiers;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GoogleBookImageLinks {
        private String thumbnail;
        private String smallThumbnail;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GoogleBookIndustryIdentifier {
        private String type;
        private String identifier;
    }
}
