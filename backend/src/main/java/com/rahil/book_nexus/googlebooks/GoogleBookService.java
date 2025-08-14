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

            List<GoogleBookDto> books = new ArrayList<>();
            JsonNode itemsNode = rootNode.get("items");
            
            if (itemsNode != null && itemsNode.isArray()) {
                for (JsonNode itemNode : itemsNode) {
                    GoogleBookDto book = parseGoogleBook(itemNode);
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

    public GoogleBookDto getBookById(String bookId) {
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

    private GoogleBookDto parseGoogleBook(JsonNode itemNode) {
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
            GoogleBookDto.GoogleBookImageLinks imageLinks = null;
            JsonNode imageLinksNode = volumeInfo.get("imageLinks");
            if (imageLinksNode != null) {
                imageLinks = GoogleBookDto.GoogleBookImageLinks.builder()
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

            return GoogleBookDto.builder()
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
        // Use a mix of popular book titles and bestsellers for better discovery
        List<String> popularQueries = List.of(
            "Red Rising Pierce Brown",
            "Atomic Habits James Clear", 
            "Harry Potter Rowling",
            "A Court of Thorns and Roses Sarah J Maas",
            "The Poppy War R F Kuang",
            "Fourth Wing Rebecca Ross",
            "It Ends with Us Colleen Hoover",
            "The Seven Husbands of Evelyn Hugo",
            "Project Hail Mary Andy Weir",
            "The Silent Patient Alex Michaelides",
            "Where the Crawdads Sing Delia Owens",
            "Dune Frank Herbert",
            "The Midnight Library Matt Haig",
            "Circe Madeline Miller"
        );
        
        List<GoogleBookDto> allBooks = new ArrayList<>();
        int booksPerQuery = Math.max(1, maxResults / popularQueries.size());
        
        for (String query : popularQueries) {
            try {
                GoogleBookResponse response = searchBooks(query, booksPerQuery, 0);
                if (response.getItems() != null) {
                    allBooks.addAll(response.getItems());
                }
                // Stop if we have enough books
                if (allBooks.size() >= maxResults) {
                    break;
                }
            } catch (Exception e) {
                log.warn("Error searching for query '{}': {}", query, e.getMessage());
                // Continue with other queries
            }
        }
        
        // Shuffle for variety and limit to requested number
        java.util.Collections.shuffle(allBooks);
        List<GoogleBookDto> limitedBooks = allBooks.stream()
                .limit(maxResults)
                .collect(java.util.stream.Collectors.toList());
        
        return GoogleBookResponse.builder()
                .items(limitedBooks)
                .totalItems(limitedBooks.size())
                .kind("books#volumes")
                .build();
    }

    public GoogleBookResponse getPopularBooks(String category, int maxResults) {
        // Use specific popular books by category
        List<String> queries;
        if ("fiction".equalsIgnoreCase(category)) {
            queries = List.of(
                "The Book Thief Markus Zusak",
                "The Kite Runner Khaled Hosseini", 
                "1984 George Orwell",
                "To Kill a Mockingbird Harper Lee",
                "The Great Gatsby F Scott Fitzgerald",
                "Pride and Prejudice Jane Austen",
                "The Catcher in the Rye J D Salinger"
            );
        } else if ("fantasy".equalsIgnoreCase(category)) {
            queries = List.of(
                "The Hobbit J R R Tolkien",
                "Game of Thrones George R R Martin",
                "The Name of the Wind Patrick Rothfuss",
                "The Way of Kings Brandon Sanderson",
                "The Final Empire Brandon Sanderson"
            );
        } else if ("romance".equalsIgnoreCase(category)) {
            queries = List.of(
                "It Ends with Us Colleen Hoover",
                "Beach Read Emily Henry",
                "The Hating Game Sally Thorne",
                "Red White Royal Blue Casey McQuiston"
            );
        } else {
            // Fallback to trending books
            return getTrendingBooks(maxResults);
        }
        
        List<GoogleBookDto> allBooks = new ArrayList<>();
        int booksPerQuery = Math.max(1, maxResults / queries.size());
        
        for (String query : queries) {
            try {
                GoogleBookResponse response = searchBooks(query, booksPerQuery, 0);
                if (response.getItems() != null) {
                    allBooks.addAll(response.getItems());
                }
                if (allBooks.size() >= maxResults) {
                    break;
                }
            } catch (Exception e) {
                log.warn("Error searching for category query '{}': {}", query, e.getMessage());
            }
        }
        
        java.util.Collections.shuffle(allBooks);
        List<GoogleBookDto> limitedBooks = allBooks.stream()
                .limit(maxResults)
                .collect(java.util.stream.Collectors.toList());
        
        return GoogleBookResponse.builder()
                .items(limitedBooks)
                .totalItems(limitedBooks.size())
                .kind("books#volumes")
                .build();
    }
}
