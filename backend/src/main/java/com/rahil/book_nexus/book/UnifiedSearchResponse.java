package com.rahil.book_nexus.book;

import com.rahil.book_nexus.external.GoogleBookSearchResult;
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
public class UnifiedSearchResponse {

    private List<BookResponse> localBooks;
    private List<GoogleBookSearchResult> googleBooks;
    private String query;
    private int totalLocalResults;
    private int totalGoogleResults;

    public int getTotalResults() {
        return totalLocalResults + totalGoogleResults;
    }
}
