package com.rahil.book_nexus.googlebooks;

import com.rahil.book_nexus.book.UserBookList;
import com.rahil.book_nexus.book.UserBookListRepository;
import com.rahil.book_nexus.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class GoogleBookIntegrationService {
    
    private final GoogleBookService googleBookService;
    private final GoogleBookEntityRepository googleBookEntityRepository;
    private final UserBookListRepository userBookListRepository;
    
    /**
     * Add a Google Book to a user's list
     * If the book doesn't exist in our database, it will be saved first
     */
    @Transactional
    public UserBookList addGoogleBookToList(String googleBookId, User user, UserBookList.ListType listType) {
        // First, get the book from Google Books API
        GoogleBookDto googleBookDto = googleBookService.getBookById(googleBookId);
        if (googleBookDto == null) {
            throw new IllegalArgumentException("Google Book not found with ID: " + googleBookId);
        }
        
        // Check if we already have this book in our database
        GoogleBookEntity googleBookEntity = googleBookEntityRepository.findByGoogleBookId(googleBookId)
                .orElseGet(() -> saveGoogleBookToDatabase(googleBookDto, user));
        
        // Check if user already has this book in the specified list
        Optional<UserBookList> existingEntry = userBookListRepository
                .findByUserAndGoogleBookAndListTypeAndIsActiveTrue(user, googleBookEntity, listType);
        
        if (existingEntry.isPresent()) {
            log.info("User {} already has Google Book {} in {} list", user.getEmail(), googleBookId, listType);
            return existingEntry.get();
        }
        
        // Create new entry
        UserBookList userBookList = UserBookList.builder()
                .user(user)
                .googleBook(googleBookEntity)
                .listType(listType)
                .isActive(true)
                .createdBy(user.getId())
                .build();
        
        return userBookListRepository.save(userBookList);
    }
    
    /**
     * Remove a Google Book from a user's list
     */
    @Transactional
    public void removeGoogleBookFromList(String googleBookId, User user, UserBookList.ListType listType) {
        Optional<GoogleBookEntity> googleBookEntity = googleBookEntityRepository.findByGoogleBookId(googleBookId);
        if (googleBookEntity.isEmpty()) {
            log.warn("Google Book not found in database: {}", googleBookId);
            return;
        }
        
        Optional<UserBookList> userBookList = userBookListRepository
                .findByUserAndGoogleBookAndListTypeAndIsActiveTrue(user, googleBookEntity.get(), listType);
        
        if (userBookList.isPresent()) {
            UserBookList entry = userBookList.get();
            entry.setIsActive(false);
            userBookListRepository.save(entry);
            log.info("Removed Google Book {} from {} list for user {}", googleBookId, listType, user.getEmail());
        }
    }
    
    /**
     * Get all books in a specific list for a user
     */
    public List<UserBookList> getUserBooksByListType(User user, UserBookList.ListType listType) {
        return userBookListRepository.findUserBooksByListType(user, listType);
    }
    
    /**
     * Get all books across all lists for a user
     */
    public List<UserBookList> getAllUserBooks(User user) {
        return userBookListRepository.findByUserAndIsActiveTrue(user);
    }
    
    /**
     * Save Google Book data to our database
     */
    private GoogleBookEntity saveGoogleBookToDatabase(GoogleBookDto googleBookDto, User user) {
        GoogleBookEntity googleBookEntity = GoogleBookEntity.builder()
                .googleBookId(googleBookDto.getId())
                .title(googleBookDto.getTitle())
                .authorName(googleBookDto.getAuthors() != null && !googleBookDto.getAuthors().isEmpty() 
                        ? googleBookDto.getAuthors().get(0) : "Unknown Author")
                .description(googleBookDto.getDescription())
                .coverUrl(googleBookDto.getImageLinks() != null ? googleBookDto.getImageLinks().getThumbnail() : null)
                .publishedDate(googleBookDto.getPublishedDate())
                .pageCount(googleBookDto.getPageCount())
                .categories(googleBookDto.getCategories() != null ? String.join(", ", googleBookDto.getCategories()) : null)
                .averageRating(googleBookDto.getAverageRating())
                .ratingsCount(googleBookDto.getRatingsCount())
                .isbn13(googleBookDto.getIsbn13())
                .isbn10(googleBookDto.getIsbn10())
                .discoveredBy(user)
                .isActive(true)
                .createdBy(user.getId())
                .build();
        
        return googleBookEntityRepository.save(googleBookEntity);
    }
}
