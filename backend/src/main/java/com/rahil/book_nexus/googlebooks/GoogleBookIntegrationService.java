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
        return userBookListRepository.findByUserAndListTypeAndIsActiveTrue(user, listType);
    }
    
    /**
     * Get all books across all lists for a user
     */
    public List<UserBookList> getAllUserBooks(User user) {
        return userBookListRepository.findByUserAndIsActiveTrue(user);
    }
    
    /**
     * Get count of books read by a user
     * This includes re-reads of the same book (each READ entry counts as 1)
     */
    public long getBooksReadCount(User user) {
        return userBookListRepository.countUserBooksByListType(user, UserBookList.ListType.READ);
    }
    
    /**
     * Get count of books currently being read by a user
     */
    public long getCurrentlyReadingCount(User user) {
        return userBookListRepository.countUserBooksByListType(user, UserBookList.ListType.CURRENTLY_READING);
    }
    
    /**
     * Update reading progress for a currently reading book
     * Automatically moves book to "Read" when progress reaches 100%
     */
    @Transactional
    public UserBookList updateReadingProgress(String googleBookId, User user, Integer progress) {
        if (progress < 0 || progress > 100) {
            throw new IllegalArgumentException("Progress must be between 0 and 100");
        }
        
        Optional<GoogleBookEntity> googleBookEntity = googleBookEntityRepository.findByGoogleBookId(googleBookId);
        if (googleBookEntity.isEmpty()) {
            throw new IllegalArgumentException("Google Book not found in database: " + googleBookId);
        }
        
        Optional<UserBookList> userBookList = userBookListRepository
                .findByUserAndGoogleBookAndListTypeAndIsActiveTrue(user, googleBookEntity.get(), UserBookList.ListType.CURRENTLY_READING);
        
        if (userBookList.isEmpty()) {
            throw new IllegalArgumentException("Book is not in user's Currently Reading list");
        }
        
        UserBookList entry = userBookList.get();
        entry.setReadingProgress(progress);
        
        // If progress reaches 100%, automatically move to "Read" shelf
        if (progress == 100) {
            // Check if user already has this book in "Read" list
            Optional<UserBookList> existingReadEntry = userBookListRepository
                    .findByUserAndGoogleBookAndListTypeAndIsActiveTrue(user, googleBookEntity.get(), UserBookList.ListType.READ);
            
            if (existingReadEntry.isEmpty()) {
                // Create new "Read" entry
                UserBookList readEntry = UserBookList.builder()
                        .user(user)
                        .googleBook(googleBookEntity.get())
                        .listType(UserBookList.ListType.READ)
                        .isActive(true)
                        .userRating(entry.getUserRating()) // Preserve existing rating if any
                        .userReview(entry.getUserReview()) // Preserve existing review if any
                        .createdBy(user.getId())
                        .build();
                
                userBookListRepository.save(readEntry);
                log.info("Auto-moved Google Book {} to Read list for user {} (progress reached 100%)", googleBookId, user.getEmail());
            }
            
            // Mark current "Currently Reading" entry as inactive
            entry.setIsActive(false);
            log.info("Marked Currently Reading entry as inactive for Google Book {} for user {}", googleBookId, user.getEmail());
        }
        
        log.info("Updated reading progress for Google Book {} to {}% for user {}", googleBookId, progress, user.getEmail());
        return userBookListRepository.save(entry);
    }
    
    /**
     * Save Google Book data to our database
     */
    private GoogleBookEntity saveGoogleBookToDatabase(GoogleBookDto googleBookDto, User user) {
        // Truncate description if it's too long (limit is 2000 characters)
        String description = googleBookDto.getDescription();
        if (description != null && description.length() > 2000) {
            description = description.substring(0, 1997) + "...";
        }
        
        // Truncate categories if too long (limit is 100 characters)
        String categories = googleBookDto.getCategories() != null ? String.join(", ", googleBookDto.getCategories()) : null;
        if (categories != null && categories.length() > 100) {
            categories = categories.substring(0, 97) + "...";
        }
        
        GoogleBookEntity googleBookEntity = GoogleBookEntity.builder()
                .googleBookId(googleBookDto.getId())
                .title(googleBookDto.getTitle())
                .authorName(googleBookDto.getAuthors() != null && !googleBookDto.getAuthors().isEmpty() 
                        ? googleBookDto.getAuthors().get(0) : "Unknown Author")
                .description(description)
                .coverUrl(googleBookDto.getImageLinks() != null ? googleBookDto.getImageLinks().getThumbnail() : null)
                .publishedDate(googleBookDto.getPublishedDate())
                .pageCount(googleBookDto.getPageCount())
                .categories(categories)
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
