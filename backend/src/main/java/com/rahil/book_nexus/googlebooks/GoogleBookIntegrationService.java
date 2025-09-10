package com.rahil.book_nexus.googlebooks;

import com.rahil.book_nexus.activity.ActivityFeed;
import com.rahil.book_nexus.activity.ActivityFeedService;
import com.rahil.book_nexus.book.UserBookList;
import com.rahil.book_nexus.book.UserBookListRepository;
import com.rahil.book_nexus.user.User;
import com.rahil.book_nexus.websocket.NotificationService;
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
    private final ActivityFeedService activityFeedService;
    private final NotificationService notificationService;
    
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
        
        UserBookList savedUserBookList = userBookListRepository.save(userBookList);
        
        // Create activity feed entry and send notification
        createBookListActivity(user, googleBookEntity, listType, true);
        
        return savedUserBookList;
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
            
            // Don't create activity feed entries for removals - only show positive actions in friends feed
            
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
     * Get all favorite books for a user
     */
    public List<UserBookList> getFavoriteBooks(User user) {
        return userBookListRepository.findUserFavoriteBooks(user);
    }
    
    /**
     * Get count of favorite books by a user
     */
    public long getFavoriteBooksCount(User user) {
        return userBookListRepository.countUserFavoriteBooks(user);
    }
    
    /**
     * Toggle favorite status for a Google Book
     */
    @Transactional
    public UserBookList toggleGoogleBookFavorite(String googleBookId, User user) {
        Optional<GoogleBookEntity> googleBookEntity = googleBookEntityRepository.findByGoogleBookId(googleBookId);
        if (googleBookEntity.isEmpty()) {
            throw new IllegalArgumentException("Google Book not found in database: " + googleBookId);
        }
        
        // Find any existing entry for this book (regardless of list type)
        List<UserBookList> existingEntries = userBookListRepository.findByUserAndIsActiveTrue(user)
                .stream()
                .filter(entry -> entry.getGoogleBook() != null && 
                        googleBookId.equals(entry.getGoogleBook().getGoogleBookId()))
                .toList();
        
        if (existingEntries.isEmpty()) {
            throw new IllegalArgumentException("Book must be added to a list before it can be favorited");
        }
        
        // Update ALL entries for this book to have the same favorite status
        // This handles cases where there might be multiple entries from old FAVORITE list type
        boolean newFavoriteStatus = !existingEntries.get(0).getIsFavorite();
        
        for (UserBookList entry : existingEntries) {
            entry.setIsFavorite(newFavoriteStatus);
            userBookListRepository.save(entry);
        }
        
        log.info("Toggled favorite status for Google Book {} to {} for user {} ({} entries updated)", 
                googleBookId, newFavoriteStatus, user.getEmail(), existingEntries.size());
        return existingEntries.get(0); // Return the first entry
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
                
                // Create activity feed entry for marking book as read
                createBookListActivity(user, googleBookEntity.get(), UserBookList.ListType.READ, true);
                
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
    
    /**
     * Create activity feed entry and send notification for book list actions
     */
    private void createBookListActivity(User user, GoogleBookEntity googleBookEntity, UserBookList.ListType listType, boolean isAddition) {
        // Only create activities for additions, not removals
        if (!isAddition) {
            return;
        }
        
        String userDisplayName = user.getFirstName() + " " + user.getLastName();
        String bookTitle = googleBookEntity.getTitle();
        String action = getListActionMessage(listType);
        String message = userDisplayName + " " + action + " \"" + bookTitle + "\"";
        
        ActivityFeed.ActivityType activityType = getActivityType(listType);
        
        // Save to activity feed
        activityFeedService.saveActivity(
            activityType,
            message,
            user,
            userDisplayName,
            null, // Regular book ID (not used for Google Books)
            googleBookEntity.getGoogleBookId(),
            bookTitle
        );
        
        // Send real-time notification
        sendBookListNotification(userDisplayName, action, bookTitle, activityType);
        
        log.info("Created activity feed entry: {}", message);
    }
    
    /**
     * Get the appropriate activity type based on list type
     */
    private ActivityFeed.ActivityType getActivityType(UserBookList.ListType listType) {
        return switch (listType) {
            case TBR -> ActivityFeed.ActivityType.BOOK_ADDED_TO_TBR;
            case CURRENTLY_READING -> ActivityFeed.ActivityType.BOOK_ADDED_TO_CURRENTLY_READING;
            case READ -> ActivityFeed.ActivityType.BOOK_MARKED_AS_READ;
        };
    }
    
    /**
     * Get human-readable action message
     */
    private String getListActionMessage(UserBookList.ListType listType) {
        return switch (listType) {
            case TBR -> "added to TBR";
            case CURRENTLY_READING -> "is currently reading";
            case READ -> "finished reading";
        };
    }
    
    /**
     * Get display name for list type
     */
    private String getListDisplayName(UserBookList.ListType listType) {
        return switch (listType) {
            case TBR -> "TBR";
            case CURRENTLY_READING -> "Currently Reading";
            case READ -> "Read";
        };
    }
    
    /**
     * Send real-time notification for book list activity
     */
    private void sendBookListNotification(String userDisplayName, String action, String bookTitle, ActivityFeed.ActivityType activityType) {
        String notificationType = switch (activityType) {
            case BOOK_ADDED_TO_TBR -> "BOOK_ADDED_TO_TBR";
            case BOOK_ADDED_TO_CURRENTLY_READING -> "BOOK_STARTED_READING";
            case BOOK_MARKED_AS_READ -> "BOOK_FINISHED_READING";
            default -> "BOOK_LIST_UPDATE";
        };
        
        String message = userDisplayName + " " + action + " \"" + bookTitle + "\"";
        notificationService.sendBookListNotification(notificationType, message);
    }
}
