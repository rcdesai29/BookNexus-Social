package com.rahil.book_nexus.external;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@Service
@Slf4j
@RequiredArgsConstructor
public class GoogleBooksService {

    private static final String GOOGLE_BOOKS_API_URL = "https://www.googleapis.com/books/v1/volumes";
    private final RestTemplate restTemplate;

    public List<GoogleBookSearchResult> searchBooks(String query, int maxResults) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(GOOGLE_BOOKS_API_URL)
                    .queryParam("q", query)
                    .queryParam("maxResults", Math.min(maxResults, 40)) // Google Books API limit
                    .queryParam("printType", "books")
                    .build()
                    .toUriString();

            log.info("Searching Google Books API with URL: {}", url);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null || !response.containsKey("items")) {
                log.warn("No books found for query: {}", query);
                return new ArrayList<>();
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> items = (List<Map<String, Object>>) response.get("items");

            return items.stream()
                    .map(this::mapToGoogleBookSearchResult)
                    .toList();

        } catch (Exception e) {
            log.error("Error searching Google Books API for query: {}", query, e);
            return new ArrayList<>();
        }
    }

    public GoogleBookSearchResult getBookById(String googleId) {
        try {
            String url = GOOGLE_BOOKS_API_URL + "/" + googleId;
            log.info("Fetching Google Books API book with URL: {}", url);

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response == null) {
                log.warn("No book found for Google ID: {}", googleId);
                return null;
            }

            return mapToGoogleBookSearchResult(response);

        } catch (Exception e) {
            log.error("Error fetching Google Books API for ID: {}", googleId, e);
            return null;
        }
    }

    private GoogleBookSearchResult mapToGoogleBookSearchResult(Map<String, Object> item) {
        @SuppressWarnings("unchecked")
        Map<String, Object> volumeInfo = (Map<String, Object>) item.get("volumeInfo");

        String googleId = (String) item.get("id");
        String title = (String) volumeInfo.get("title");

        // Authors can be a list
        @SuppressWarnings("unchecked")
        List<String> authors = (List<String>) volumeInfo.get("authors");
        String authorName = authors != null && !authors.isEmpty() ? authors.get(0) : "Unknown Author";

        String description = (String) volumeInfo.get("description");
        String isbn = extractIsbn(volumeInfo);

        // Image links
        @SuppressWarnings("unchecked")
        Map<String, String> imageLinks = (Map<String, String>) volumeInfo.get("imageLinks");
        String thumbnailUrl = imageLinks != null ? imageLinks.get("thumbnail") : null;

        // Published date
        String publishedDate = (String) volumeInfo.get("publishedDate");

        // Categories
        @SuppressWarnings("unchecked")
        List<String> categories = (List<String>) volumeInfo.get("categories");
        String category = categories != null && !categories.isEmpty() ? categories.get(0) : null;

        return GoogleBookSearchResult.builder()
                .googleId(googleId)
                .title(title)
                .authorName(authorName)
                .description(description)
                .isbn(isbn)
                .thumbnailUrl(thumbnailUrl)
                .publishedDate(publishedDate)
                .category(category)
                .build();
    }

    private String extractIsbn(Map<String, Object> volumeInfo) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> industryIdentifiers = (List<Map<String, Object>>) volumeInfo
                .get("industryIdentifiers");

        if (industryIdentifiers == null) {
            return null;
        }

        // Prefer ISBN_13, fallback to ISBN_10
        for (Map<String, Object> identifier : industryIdentifiers) {
            String type = (String) identifier.get("type");
            if ("ISBN_13".equals(type)) {
                return (String) identifier.get("identifier");
            }
        }

        for (Map<String, Object> identifier : industryIdentifiers) {
            String type = (String) identifier.get("type");
            if ("ISBN_10".equals(type)) {
                return (String) identifier.get("identifier");
            }
        }

        return null;
    }
}
