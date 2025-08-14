package com.rahil.book_nexus.googlebooks;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleBookService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${application.external.googlebooks.enabled:false}")
    private boolean googleBooksEnabled;

    @Value("${application.external.googlebooks.api-key:}")
    private String googleBooksApiKey;

    private static final String GOOGLE_BOOKS_BASE_URL = "https://www.googleapis.com/books/v1";

    public GoogleBookResponse searchBooks(String query, int maxResults, int startIndex) {
        if (!googleBooksEnabled) {
            log.warn("Google Books API is disabled");
            return GoogleBookResponse.builder()
                    .items(new ArrayList<>())
                    .totalItems(0)
                    .kind("books#volumes")
                    .build();
        }

        try {
            String apiKeyParam = (googleBooksApiKey != null && !googleBooksApiKey.isBlank())
                    ? "&key=" + googleBooksApiKey
                    : "";

            String url = GOOGLE_BOOKS_BASE_URL + "/volumes?q="
                    + URLEncoder.encode(query, StandardCharsets.UTF_8)
                    + "&maxResults=" + maxResults
                    + "&startIndex=" + startIndex
                    + apiKeyParam;

            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            JsonNode rootNode = objectMapper.readTree(response.getBody());

            List<GoogleBook> books = new ArrayList<>();
            JsonNode itemsNode = rootNode.get("items");
            
            if (itemsNode != null && itemsNode.isArray()) {
                for (JsonNode itemNode : itemsNode) {
                    GoogleBook book = parseGoogleBook(itemNode);
                    if (book != null) {
                        books.add(book);
                    }
                }
            }

            return GoogleBookResponse.builder()
                    .items(books)
                    .totalItems(rootNode.get("totalItems") != null ? rootNode.get("totalItems").asInt() : 0)
                    .kind(rootNode.get("kind") != null ? rootNode.get("kind").asText() : null)
                    .build();

        } catch (Exception e) {
            log.error("Error searching Google Books: {}", e.getMessage(), e);
            return GoogleBookResponse.builder()
                    .items(new ArrayList<>())
                    .totalItems(0)
                    .kind("books#volumes")
                    .build();
        }
    }

    public GoogleBook getBookById(String bookId) {
        if (!googleBooksEnabled) {
            log.warn("Google Books API is disabled");
            return null;
        }

        try {
            String apiKeyParam = (googleBooksApiKey != null && !googleBooksApiKey.isBlank())
                    ? "?key=" + googleBooksApiKey
                    : "";

            String url = GOOGLE_BOOKS_BASE_URL + "/volumes/" + bookId + apiKeyParam;
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            JsonNode rootNode = objectMapper.readTree(response.getBody());

            return parseGoogleBook(rootNode);

        } catch (Exception e) {
            log.error("Error fetching Google Book by ID: {}", e.getMessage(), e);
            return null;
        }
    }

    private GoogleBook parseGoogleBook(JsonNode itemNode) {
        try {
            JsonNode volumeInfo = itemNode.get("volumeInfo");
            if (volumeInfo == null) {
                return null;
            }

            // Parse basic info
            String title = getStringValue(volumeInfo, "title");
            if (title == null || title.isBlank()) {
                return null;
            }

            // Parse authors
            List<String> authors = new ArrayList<>();
            JsonNode authorsNode = volumeInfo.get("authors");
            if (authorsNode != null && authorsNode.isArray()) {
                for (JsonNode authorNode : authorsNode) {
                    authors.add(authorNode.asText());
                }
            }

            // Parse image links
            GoogleBook.GoogleBookImageLinks imageLinks = null;
            JsonNode imageLinksNode = volumeInfo.get("imageLinks");
            if (imageLinksNode != null) {
                imageLinks = GoogleBook.GoogleBookImageLinks.builder()
                        .thumbnail(getStringValue(imageLinksNode, "thumbnail"))
                        .smallThumbnail(getStringValue(imageLinksNode, "smallThumbnail"))
                        .build();
            }

            // Parse industry identifiers (ISBN)
            String isbn13 = null;
            String isbn10 = null;
            JsonNode industryIdentifiersNode = volumeInfo.get("industryIdentifiers");
            if (industryIdentifiersNode != null && industryIdentifiersNode.isArray()) {
                for (JsonNode identifierNode : industryIdentifiersNode) {
                    String type = getStringValue(identifierNode, "type");
                    String identifier = getStringValue(identifierNode, "identifier");
                    if ("ISBN_13".equals(type)) {
                        isbn13 = identifier;
                    } else if ("ISBN_10".equals(type)) {
                        isbn10 = identifier;
                    }
                }
            }

            // Parse categories
            List<String> categories = new ArrayList<>();
            JsonNode categoriesNode = volumeInfo.get("categories");
            if (categoriesNode != null && categoriesNode.isArray()) {
                for (JsonNode categoryNode : categoriesNode) {
                    categories.add(categoryNode.asText());
                }
            }

            return GoogleBook.builder()
                    .id(itemNode.get("id") != null ? itemNode.get("id").asText() : null)
                    .title(title)
                    .authors(authors)
                    .description(getStringValue(volumeInfo, "description"))
                    .publishedDate(getStringValue(volumeInfo, "publishedDate"))
                    .pageCount(volumeInfo.get("pageCount") != null ? volumeInfo.get("pageCount").asInt() : null)
                    .categories(categories)
                    .averageRating(volumeInfo.get("averageRating") != null ? volumeInfo.get("averageRating").asDouble() : null)
                    .ratingsCount(volumeInfo.get("ratingsCount") != null ? volumeInfo.get("ratingsCount").asInt() : null)
                    .isbn13(isbn13)
                    .isbn10(isbn10)
                    .imageLinks(imageLinks)
                    .build();

        } catch (Exception e) {
            log.error("Error parsing Google Book: {}", e.getMessage(), e);
            return null;
        }
    }

    private String getStringValue(JsonNode node, String fieldName) {
        JsonNode fieldNode = node.get(fieldName);
        return fieldNode != null ? fieldNode.asText() : null;
    }

    public GoogleBookResponse getTrendingBooks(int maxResults) {
        int currentYear = java.time.Year.now().getValue();
        String query = "publishedDate:" + currentYear + " fiction";
        return searchBooks(query, maxResults, 0);
    }

    public GoogleBookResponse getPopularBooks(String category, int maxResults) {
        String query = "subject:" + category + " bestseller";
        return searchBooks(query, maxResults, 0);
    }
}
