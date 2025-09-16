# BookNexus Deduplication & Author Filtering System Design

## Table of Contents
1. [Current System Infrastructure](#1-current-system-infrastructure)
2. [Proposed Changes Overview](#2-proposed-changes-overview)
3. [Database Layer Changes](#3-database-layer-changes)
4. [Backend Service Changes](#4-backend-service-changes)
5. [Frontend Component Changes](#5-frontend-component-changes)
6. [WebSocket/Notification Updates](#6-websocketnotification-updates)
7. [Edge Cases & Considerations](#7-edge-cases--considerations)
8. [Before vs After Flow](#8-before-vs-after-flow)
9. [Migration Plan & Data Cleanup](#9-migration-plan--data-cleanup)
10. [Testing Strategy](#10-testing-strategy)
11. [Risks & Mitigation](#11-risks--mitigation)

---

## 1. Current System Infrastructure

### Database Structure (Spring Boot/JPA)
```
Books Table:
- id (Primary Key)
- title
- authorName
- isbn
- synopsis
- cover (Base64/URL)
- publishedDate
- pageCount
- categories
- averageRating
- ratingsCount
- googleBookId (varchar - stores Google Books volumeId)

UserBookList Table:
- id (Primary Key)
- userId (Foreign Key)
- bookId (Foreign Key to Books table)
- listType (ENUM: TBR, CURRENTLY_READING, READ)
- dateAdded
- isFavorite

GoogleBookFeedback Table:
- id (Primary Key)
- userId
- googleBookId (varchar)
- bookTitle
- authorName
- rating
- review
- isAnonymous
- createdDate
```

### Backend Services
- **UserBookListService**: Manages user's book shelves
- **GoogleBookFeedbackService**: Handles ratings/reviews
- **DirectApiService**: Interfaces with Google Books API
- **AuthenticationService**: User management
- **NotificationService**: Manages notifications

### Frontend Components
- **DiscoveryBookCard**: Shows books from Google API
- **LibraryBookCard**: Shows user's personal books
- **HomePage**: Discovery section with pagination
- **Book list pages**: TBR, Currently Reading, Read, Search, etc.
- **UnifiedBookDetailsModal**: Book details popup

### WebSocket Events
- **ACTIVITY_UPDATE**: When users add/move books between shelves
- **NEW_REVIEW**: When users write reviews
- **NEW_FOLLOWER**: Follow notifications
- Real-time updates for follower feeds

---

## 2. Proposed Changes Overview

### Primary Goals
1. **Deduplication**: Prevent duplicate books based on Google Books `volumeId`
2. **Author Filtering**: Exclude books without valid author information
3. **System-wide Consistency**: Apply changes across all layers

### Success Criteria
- No duplicate books in database or user lists
- No books with missing/empty authors displayed or stored
- Existing user data preserved during migration
- Real-time updates continue working correctly

---

## 3. Database Layer Changes

### 3.1 Schema Modifications

#### Books Table Updates (Backward-Compatible Approach)
```sql
-- Add unique constraint on googleBookId (deferrable for migration safety)
ALTER TABLE books ADD CONSTRAINT uk_books_google_book_id 
  UNIQUE (google_book_id) DEFERRABLE INITIALLY DEFERRED;

-- Add soft delete and data quality fields for migration safety
ALTER TABLE books ADD COLUMN is_visible BOOLEAN DEFAULT TRUE;
ALTER TABLE books ADD COLUMN data_quality VARCHAR(50) DEFAULT 'VALID';

-- Add source tracking for future enhancements
ALTER TABLE books ADD COLUMN source VARCHAR(20) DEFAULT 'GOOGLE';

-- Add enhanced author storage (backward compatible)
ALTER TABLE books ADD COLUMN authors_json JSONB;
-- Keep authorName as primary display field for existing components

-- Add index for performance
CREATE INDEX idx_books_google_book_id ON books(google_book_id);
CREATE INDEX idx_books_author_name ON books(author_name);
CREATE INDEX idx_books_visible ON books(is_visible);
```

#### Enhanced Validation Rules
- `googleBookId`: Must be unique, not null
- `authorName`: Validated at application level for new entries
- `is_visible`: Controls whether books appear in queries (soft delete)
- `data_quality`: Tracks validation status ('VALID', 'MISSING_AUTHOR', 'DUPLICATE')
- `authors_json`: Optional enhanced author information for future features

### 3.2 Data Integrity Constraints
```sql
-- Prevent duplicate GoogleBookFeedback entries for same user/book
ALTER TABLE google_book_feedback 
ADD CONSTRAINT uk_feedback_user_book UNIQUE (user_id, google_book_id);

-- Multi-shelf support: users can have same book in multiple shelves
ALTER TABLE user_book_list 
ADD CONSTRAINT uk_user_book_shelf UNIQUE (user_id, book_id, list_type);

```

---

## 4. Backend Service Changes

### 4.1 Books/GoogleBooks Service Layer

#### Enhanced BookValidationService
```java
@Service
public class BookValidationService {
    
    private static final Set<String> VALID_AUTHOR_PATTERNS = Set.of(
        "various authors",
        "edited by",
        "compiled by",
        "anonymous"
    );
    
    public boolean isValidBook(GoogleBookApiResponse book) {
        return hasValidAuthor(book) && hasValidVolumeId(book);
    }
    
    private boolean hasValidAuthor(GoogleBookApiResponse book) {
        String author = extractAuthorName(book);
        if (author == null || author.trim().isEmpty()) {
            return false;
        }
        
        String lowerAuthor = author.toLowerCase();
        if (lowerAuthor.equals("unknown author") || lowerAuthor.equals("unknown")) {
            return false;
        }
        
        // Allow certain valid patterns for multi-author works
        return VALID_AUTHOR_PATTERNS.stream()
            .anyMatch(pattern -> lowerAuthor.contains(pattern)) || 
            !lowerAuthor.contains("unknown");
    }
    
    private boolean hasValidVolumeId(GoogleBookApiResponse book) {
        return book.getId() != null && !book.getId().trim().isEmpty();
    }
    
    private String extractAuthorName(GoogleBookApiResponse book) {
        if (book.getAuthors() != null && !book.getAuthors().isEmpty()) {
            return String.join(", ", book.getAuthors());
        }
        return null;
    }
}
```

#### Updated DirectApiService
**File**: `DirectApiService.java`
```java
// Modify getGoogleBooks method
public GoogleBooksResponse getGoogleBooks(String query, int maxResults) {
    // Fetch from Google API
    GoogleBooksResponse response = fetchFromGoogleApi(query, maxResults);
    
    // Filter out invalid books
    List<GoogleBookApiResponse> validBooks = response.getItems().stream()
        .filter(bookValidationService::isValidBook)
        .collect(toList());
    
    response.setItems(validBooks);
    return response;
}
```

### 4.2 UserBookListService Updates

#### Deduplication Logic
**File**: `UserBookListService.java`
```java
@Transactional
public void addGoogleBookToList(String googleBookId, ListType listType) {
    // Check if book already exists in database
    Optional<Book> existingBook = bookRepository.findByGoogleBookId(googleBookId);
    
    Book book;
    if (existingBook.isPresent()) {
        book = existingBook.get();
    } else {
        // Fetch from Google API and validate
        GoogleBookApiResponse googleBook = directApiService.getBookById(googleBookId);
        if (!bookValidationService.isValidBook(googleBook)) {
            throw new InvalidBookException("Book does not meet quality standards");
        }
        book = createBookFromGoogleApi(googleBook);
        book = bookRepository.save(book);
    }
    
    // Check if user already has this book in this specific list
    Optional<UserBookList> existingUserBook = 
        userBookListRepository.findByUserIdAndBookIdAndListType(getCurrentUserId(), book.getId(), listType);
    
    if (existingUserBook.isPresent()) {
        // Book already in this shelf - this is a no-op or could show message
        throw new DuplicateBookException("Book is already in " + listType + " shelf");
    } else {
        // Add book to new shelf (user can have same book in multiple shelves)
        UserBookList newUserBook = new UserBookList();
        newUserBook.setUserId(getCurrentUserId());
        newUserBook.setBook(book);
        newUserBook.setListType(listType);
        userBookListRepository.save(newUserBook);
    }
}
```

### 4.3 New Repository Methods

#### BookRepository (Aligned with Current Patterns)
**File**: `BookRepository.java`
```java
@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    Optional<Book> findByGoogleBookId(String googleBookId);
    List<Book> findByGoogleBookIdIn(List<String> googleBookIds); // For migration
    
    @Query("SELECT COUNT(b) > 0 FROM Book b WHERE b.googleBookId = :googleBookId")
    boolean existsByGoogleBookId(String googleBookId);
    
    @Query("SELECT b FROM Book b WHERE b.isVisible = true AND " +
           "(b.authorName IS NOT NULL AND TRIM(b.authorName) <> '')")
    Page<Book> findAllValidBooks(Pageable pageable);
    
    @Query("SELECT COUNT(b) FROM Book b WHERE b.authorName IS NULL OR TRIM(b.authorName) = ''")
    long countInvalidBooks();
    
    @Modifying
    @Query("UPDATE Book b SET b.isVisible = false, b.dataQuality = 'MISSING_AUTHOR' " +
           "WHERE b.authorName IS NULL OR TRIM(b.authorName) = ''")
    int hideInvalidBooks();
}
```

#### UserBookListRepository
**File**: `UserBookListRepository.java`
```java
@Repository
public interface UserBookListRepository extends JpaRepository<UserBookList, Long> {
    Optional<UserBookList> findByUserIdAndBookIdAndListType(Long userId, Long bookId, ListType listType);
    
    List<UserBookList> findByUserIdAndBookId(Long userId, Long bookId); // All shelves for a book
    
    @Query("SELECT ubl FROM UserBookList ubl WHERE ubl.userId = :userId " +
           "AND ubl.book.googleBookId = :googleBookId AND ubl.listType = :listType")
    Optional<UserBookList> findByUserIdAndGoogleBookIdAndListType(Long userId, String googleBookId, ListType listType);
}
```

### 4.4 Feature Flags Integration

#### Feature Flag Configuration
```java
@ConfigurationProperties(prefix = "booknexus.features")
@Component
public class FeatureFlags {
    
    private boolean enableBookDeduplication = false;
    private boolean enableAuthorValidation = false;
    private boolean enableSoftMigration = true;
    
    // getters and setters
}

@Service
public class BookDeduplicationService {
    
    @Autowired
    private FeatureFlags featureFlags;
    
    public void addBookToList(String googleBookId, ListType listType) {
        if (featureFlags.isEnableBookDeduplication()) {
            // Use new deduplication logic
            addBookWithDeduplication(googleBookId, listType);
        } else {
            // Use legacy logic
            addBookLegacy(googleBookId, listType);
        }
    }
}
```

#### Application Properties
```properties
# Feature flags for gradual rollout
booknexus.features.enable-book-deduplication=false
booknexus.features.enable-author-validation=false
booknexus.features.enable-soft-migration=true
```

### 4.5 Exception Handling

#### Structured Error Handling (Current Codebase Style)
```java
// Enhanced error response matching current patterns
@ControllerAdvice
public class BookExceptionHandler {
    
    @ExceptionHandler(InvalidBookException.class)
    public ResponseEntity<ErrorResponse> handleInvalidBook(InvalidBookException e) {
        return ResponseEntity.badRequest()
            .body(new ErrorResponse("MISSING_AUTHOR", e.getMessage()));
    }
    
    @ExceptionHandler(DuplicateBookException.class)
    public ResponseEntity<ErrorResponse> handleDuplicateBook(DuplicateBookException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
            .body(new ErrorResponse("DUPLICATE_BOOK", e.getMessage()));
    }
}

public class ErrorResponse {
    private String code;
    private String message;
    private long timestamp;
    
    public ErrorResponse(String code, String message) {
        this.code = code;
        this.message = message;
        this.timestamp = System.currentTimeMillis();
    }
    
    // getters and setters
}

public class InvalidBookException extends RuntimeException {
    public InvalidBookException(String message) {
        super(message);
    }
}

public class DuplicateBookException extends RuntimeException {
    public DuplicateBookException(String message) {
        super(message);
    }
}
```

---

## 5. Frontend Component Changes

### 5.1 Book Addition Flow Updates

#### DiscoveryBookCard Component
**File**: `DiscoveryBookCard.tsx`
```typescript
// Enhanced error handling with structured responses
const handleAddToShelf = async (shelfType: string) => {
    try {
        setLoading(true);
        await UserBookListService.addGoogleBookToList(book.id, shelfType);
        setSuccessMessage(`Book added to ${shelfType}!`);
    } catch (error: any) {
        // Handle structured error codes
        const errorCode = error?.body?.code;
        const errorMessage = error?.body?.message;
        
        switch (errorCode) {
            case 'DUPLICATE_BOOK':
                setErrorMessage('Book is already in this shelf.');
                break;
            case 'MISSING_AUTHOR':
                setErrorMessage('This book cannot be added due to incomplete information.');
                break;
            default:
                setErrorMessage(errorMessage || 'Failed to add book. Please try again.');
        }
    } finally {
        setLoading(false);
    }
};
```

#### UnifiedBookDetailsModal Component
**File**: `UnifiedBookDetailsModal.tsx`
```typescript
const handleAddToShelf = async (shelfType: string) => {
    try {
        await UserBookListService.addGoogleBookToList(book.googleBookId, shelfType);
        setAlertMessage(`Book added to ${shelfType} successfully!`);
    } catch (error: any) {
        // Handle structured error responses
        if (error?.body?.code === 'DUPLICATE_BOOK') {
            setAlertMessage('This book is already in this shelf.');
        } else if (error?.body?.code === 'MISSING_AUTHOR') {
            setAlertMessage('This book cannot be added due to missing information.');
        } else {
            setAlertMessage(error?.body?.message || 'Failed to add book. Please try again.');
        }
    }
};
```

### 5.2 Search and Discovery Updates

#### HomePage Discovery Section
**File**: `HomePage.tsx`
- Books from Google API are already filtered server-side
- No additional client-side filtering needed
- May see fewer books per page, adjust pagination accordingly

#### SearchPage Component
**File**: `SearchPage.tsx`
- Update to handle fewer search results due to filtering
- Add messaging when no valid books found: "No books with complete information found"

### 5.3 User Library Components

#### All Book List Pages (TBR, Currently Reading, Read)
- Support multi-shelf book display (same book can appear in multiple lists)
- Show "Book is already in this shelf" messages for duplicate attempts
- Update book count displays to reflect deduplicated counts
- Add visual indicators when a book exists in multiple shelves
- Consider "View all shelves" option for books that appear in multiple lists

---

## 6. WebSocket/Notification Updates

### 6.1 Activity Notifications

#### Enhanced WebSocket Events (Backward Compatible)
```typescript
// Extends current notification structure from NotificationBell.tsx
interface BookActivityNotification extends WebSocketMessage {
    version: 1;
    type: 'BOOK_ADDED' | 'BOOK_MOVED' | 'BOOK_REMOVED';
    userId: string;
    userDisplayName: string;
    bookId: string;
    bookTitle: string;
    bookAuthor: string; // Always present due to validation
    action: string;
    fromShelf?: string;
    toShelf?: string;
    timestamp: number;
}

// Backward compatible with current WebSocketMessage interface
interface WebSocketMessage {
    type: string;
    data?: any;
    timestamp?: number;
}
```

#### NotificationService (Keeping Current Patterns)
**File**: `NotificationService.java`
```java
@Service
public class NotificationService {
    
    @Autowired
    private WebSocketService webSocketService;
    
    public void notifyBookAdded(Long userId, Book book, ListType listType) {
        // Only create notifications for books with valid authors
        if (book.getAuthorName() == null || book.getAuthorName().trim().isEmpty()) {
            return; // Skip notification for invalid books
        }
        
        // Use existing notification structure - no changes to current system
        ActivityUpdateEvent event = new ActivityUpdateEvent();
        event.setAction(determineAction(listType));
        event.setBookTitle(book.getTitle());
        event.setBookAuthor(book.getAuthorName()); // Guaranteed not null
        event.setUserId(userId.toString());
        event.setTimestamp(System.currentTimeMillis());
        
        // Send real-time notification using existing WebSocket system
        webSocketService.sendToFollowers(userId, event);
    }
    
    public void notifyBookAddedToShelf(Long userId, Book book, ListType listType) {
        // New method for multi-shelf support
        notifyBookAdded(userId, book, listType);
    }
    
    private String determineAction(ListType listType) {
        switch (listType) {
            case TBR: return "ADDED_TO_TBR";
            case CURRENTLY_READING: return "STARTED_READING";
            case READ: return "FINISHED_READING";
            default: return "ADDED_TO_LIBRARY";
        }
    }
}
```

---

## 7. Edge Cases & Considerations

### 7.1 Data Quality Edge Cases

#### Missing ISBN Scenarios
- **Problem**: Some books may lack ISBN but have valid volumeId
- **Solution**: Use volumeId as primary deduplication key, ISBN as secondary
- **Implementation**: Unique constraint on googleBookId, not ISBN

#### Anthology/Collection Books
- **Problem**: Anthologies might have "Various Authors" or editor names
- **Solution**: Accept "Various Authors" and "Edited by [Name]" as valid
- **Implementation**: Update validation logic to allow these patterns

#### Multiple Editions
- **Problem**: Same book, different editions, different volumeIds
- **Solution**: Treat as separate books (expected behavior)
- **Note**: Users can add multiple editions if desired

### 7.2 API Rate Limiting
- **Problem**: Validation requires additional Google API calls
- **Solution**: Cache validation results, batch requests where possible
- **Implementation**: Add Redis cache for book validation status

### 7.3 Migration of Existing Data
- **Problem**: Existing database may have duplicates and books without authors
- **Solution**: Create migration service to clean existing data
- **Process**: 
  1. Identify duplicates by googleBookId
  2. Merge user lists pointing to duplicates
  3. Remove books without authors
  4. Update foreign key references

---

## 8. Before vs After Flow

### 8.1 Current Flow (Before)
```
User searches for book → Google API returns results → 
Frontend displays all books → User adds book → 
Backend creates new Book record → UserBookList entry created →
WebSocket notification sent → Followers see activity
```

**Problems**:
- Duplicate books can be created
- Books without authors stored and displayed
- Same book can be added multiple times to user's library

### 8.2 New Flow (After)
```
User searches for book → Google API returns results → 
Backend filters out books without authors → 
Frontend displays only valid books → User adds book → 
Backend checks if book exists (by googleBookId) → 
If exists: reuse existing Book record → 
If not exists: validate and create new Book record → 
Check if user already has book → 
If exists: move between shelves → 
If not exists: create new UserBookList entry → 
WebSocket notification sent with action type → 
Followers see activity (guaranteed valid author info)
```

**Improvements**:
- No duplicate books possible
- No books without authors displayed or stored
- Intelligent shelf management (move vs add)
- Clear user feedback for all scenarios

---

## 9. Migration Plan & Data Cleanup

### 9.1 Pre-Migration Analysis
```sql
-- Identify books without authors
SELECT COUNT(*) FROM books 
WHERE authorName IS NULL OR TRIM(authorName) = '' OR authorName = 'Unknown Author';

-- Identify duplicate googleBookIds
SELECT googleBookId, COUNT(*) 
FROM books 
WHERE googleBookId IS NOT NULL 
GROUP BY googleBookId 
HAVING COUNT(*) > 1;

-- Identify affected user book lists
SELECT COUNT(*) FROM user_book_list ubl
JOIN books b ON ubl.book_id = b.id
WHERE b.authorName IS NULL OR TRIM(b.authorName) = '';
```

### 9.2 Migration Steps

#### Step 1: Data Backup
```sql
-- Create backup tables
CREATE TABLE books_backup AS SELECT * FROM books;
CREATE TABLE user_book_list_backup AS SELECT * FROM user_book_list;
```

#### Step 2: Soft Hide Invalid Books (Migration Safety)
```sql
-- Mark UserBookList entries for books without authors as hidden
UPDATE user_book_list ubl
JOIN books b ON ubl.book_id = b.id
SET ubl.is_active = false
WHERE b.author_name IS NULL OR TRIM(b.author_name) = '' OR b.author_name = 'Unknown Author';

-- Mark books without authors as hidden instead of deleting
UPDATE books 
SET is_visible = false, data_quality = 'MISSING_AUTHOR'
WHERE author_name IS NULL OR TRIM(author_name) = '' OR author_name = 'Unknown Author';
```

#### Step 3: Migration Service (Current Service Patterns)
```java
@Service
@Transactional
public class BookMigrationService {
    
    @Autowired
    private BookRepository bookRepository;
    
    @Autowired
    private UserBookListRepository userBookListRepository;
    
    public MigrationReport analyzeBooksForMigration() {
        // Count issues without making changes
        long booksWithoutAuthors = bookRepository.countInvalidBooks();
        long duplicateBooks = findDuplicateGoogleBookIdCount();
        long affectedUserLists = countAffectedUserBookLists();
        
        return new MigrationReport(booksWithoutAuthors, duplicateBooks, affectedUserLists);
    }
    
    public void softHideInvalidBooks() {
        // Mark as hidden instead of deleting
        int hiddenCount = bookRepository.hideInvalidBooks();
        log.info("Marked {} books as hidden due to missing authors", hiddenCount);
    }
    
    public void mergeDuplicateBooks() {
        List<String> duplicateGoogleBookIds = findDuplicateGoogleBookIds();
        
        for (String googleBookId : duplicateGoogleBookIds) {
            List<Book> duplicates = bookRepository.findByGoogleBookIdIn(List.of(googleBookId));
            Book primaryBook = selectMostCompleteBook(duplicates);
            
            // Update UserBookList references
            for (Book duplicate : duplicates) {
                if (!duplicate.getId().equals(primaryBook.getId())) {
                    userBookListRepository.updateBookReferences(duplicate.getId(), primaryBook.getId());
                    bookRepository.delete(duplicate);
                }
            }
        }
    }
    
    private Book selectMostCompleteBook(List<Book> books) {
        // Select book with most complete information
        return books.stream()
            .max(Comparator.comparing(this::calculateCompletenessScore))
            .orElse(books.get(0));
    }
    
    private int calculateCompletenessScore(Book book) {
        int score = 0;
        if (book.getCover() != null) score += 2;
        if (book.getSynopsis() != null && !book.getSynopsis().trim().isEmpty()) score += 2;
        if (book.getIsbn() != null && !book.getIsbn().trim().isEmpty()) score += 1;
        if (book.getPublishedDate() != null) score += 1;
        return score;
    }
}

public class MigrationReport {
    private long booksWithoutAuthors;
    private long duplicateBooks;
    private long affectedUserLists;
    
    // constructors, getters, setters
}
```

#### Step 4: Apply New Constraints
```sql
-- Add unique constraint
ALTER TABLE books ADD CONSTRAINT uk_books_google_book_id UNIQUE (googleBookId);

-- Add not null constraint
ALTER TABLE books ALTER COLUMN authorName SET NOT NULL;
ALTER TABLE books ADD CONSTRAINT chk_books_author_not_empty 
    CHECK (authorName IS NOT NULL AND TRIM(authorName) <> '');
```

### 9.3 Rollback Plan
- Keep backup tables for 30 days
- Document all changes made during migration
- Create rollback scripts to restore original state if needed

---

## 10. Testing Strategy

### 10.1 Unit Tests
- **BookValidationService**: Test all validation scenarios
- **UserBookListService**: Test deduplication logic
- **Repository methods**: Test new query methods
- **WebSocket events**: Test notification generation

### 10.2 Integration Tests
- **End-to-end book addition flow**: From API to database
- **Duplicate handling**: Attempt to add same book twice
- **Author filtering**: Verify books without authors are rejected
- **Migration scripts**: Test on copy of production data

### 10.3 Performance Tests
- **Search performance**: With author filtering enabled
- **Database queries**: New indexes perform well
- **API response times**: Validation doesn't slow requests significantly

### 10.4 User Acceptance Tests
- **Book discovery**: Users can find and add books normally
- **Error handling**: Clear messages for duplicate/invalid books
- **Shelf management**: Books move between shelves correctly
- **Notifications**: Real-time updates work as expected

---

## 11. Risks & Mitigation

### 11.1 High Risk Items

#### Data Loss During Migration
- **Risk**: Accidental deletion of user data during cleanup
- **Mitigation**: 
  - Complete database backup before migration
  - Test migration on copy of production data
  - Implement rollback procedures
  - Gradual rollout with monitoring

#### Performance Impact
- **Risk**: Additional validation may slow down book searches
- **Mitigation**:
  - Implement caching for validation results
  - Add database indexes for new queries
  - Monitor API response times
  - Consider async processing for non-critical validations

#### User Experience Disruption
- **Risk**: Users may see fewer books in search results
- **Mitigation**:
  - Communicate changes to users in advance
  - Improve messaging when no results found
  - Consider showing filtered count: "Showing X books (Y filtered out)"

### 11.2 Medium Risk Items

#### Google API Changes
- **Risk**: Google Books API structure changes could break validation
- **Mitigation**:
  - Implement robust error handling
  - Add monitoring for API response structure
  - Create fallback validation methods

#### WebSocket Message Format Changes
- **Risk**: Existing clients may not handle new notification format
- **Mitigation**:
  - Version WebSocket message formats
  - Gradual rollout of new message structure
  - Backward compatibility for transition period

### 11.3 Phased Implementation Strategy

#### Phase 1: Foundation (Week 1)
- **Low Risk Items**: 
  - Add structured error responses
  - Add soft delete fields to Books table
  - Implement feature flags infrastructure
- **Deliverables**: 
  - Enhanced error handling
  - Migration safety mechanisms

#### Phase 2: Data Quality (Week 2)
- **Medium Risk Items**:
  - Implement book validation service
  - Add author JSON field (keeping existing authorName)
  - Create migration analysis tools
- **Deliverables**:
  - Book quality validation
  - Migration readiness assessment

#### Phase 3: Deduplication Core (Week 3)
- **Core Features**:
  - Implement deduplication logic
  - Add unique constraints on googleBookId
  - Run soft migration (hide invalid books)
- **Deliverables**:
  - Working deduplication system
  - Clean book dataset

#### Phase 4: Notifications Enhancement (Week 4)
- **Enhancement Features**:
  - Add persistent notifications table
  - Update WebSocket payload structure
  - Implement notification management UI
- **Deliverables**:
  - Enhanced notification system
  - Complete feature rollout

#### Phase 5: Advanced Features (Future)
- **Future Enhancements**:
  - Multi-author table structure
  - GoogleBookFeedback FK migration
  - Performance optimizations
- **Deliverables**:
  - Advanced data model
  - Performance improvements

---

---

## 12. Business Decisions Required

### 12.1 Shelf Management Model ✅ **CONFIRMED**
**Decision**: Users CAN have the same book in multiple shelves - this is a major part of the project
- **Implementation**: Use `UNIQUE(user_id, book_id, list_type)` constraint
- **Impact**: Remove existing `moveToShelf()` logic, implement `addToShelf()` logic
- **UI Changes**: Change "Move to" buttons to "Add to" buttons
- **Database**: Allow multiple UserBookList entries for same user/book combination

### 12.2 Migration Approach Preference ✅ **CONFIRMED**
**Decision**: Soft hide first (`is_visible=false`), clean later
- **Implementation**: Mark invalid books as hidden, preserve data for recovery
- **Timeline**: Clean up hidden data after 30+ days of successful operation
- **Safety**: Full backup before migration, rollback procedures documented

### 12.3 Multi-Author Display Priority ✅ **CONFIRMED**
**Decision**: Truncate multiple authors with option to see full list
- **Implementation**: Show "Author 1 et al." or "Author 1 +2 others" in cards
- **Interaction**: Clicking shows full author list (modal/tooltip/expandable)
- **Responsive**: Maintains clean book card layouts on mobile
- **Storage**: Keep full author list in `authors_json` field

### 12.4 Notification System ✅ **CONFIRMED**
**Decision**: Keep notification system as-is, no changes
- **Implementation**: Remove persistent notifications table from design
- **WebSocket**: Keep existing real-time WebSocket notifications only
- **Impact**: Remove NotificationRepository and persistence logic
- **Simplification**: Focus on deduplication and author filtering only

---

## Summary

This design implements comprehensive deduplication and author filtering across the entire BookNexus system. The changes ensure data quality while maintaining system performance and user experience. The phased rollout approach minimizes risk while allowing for monitoring and adjustments throughout the implementation process.

**Key Benefits**:
- Eliminates duplicate books system-wide
- Ensures all books have valid author information
- Improves data quality and user experience
- Maintains backward compatibility during transition
- Incorporates codebase-aligned patterns and safety mechanisms

**Implementation Timeline**: 4 weeks with careful testing and monitoring at each phase.

**Ready for Implementation**: All business decisions have been confirmed. This design is ready to proceed to implementation phase.

**Confirmed Decisions**:
- ✅ Multi-shelf support: Users can have same book in multiple shelves
- ✅ Soft migration: Hide invalid books first, clean later  
- ✅ Author truncation: Show "Author et al." with click to expand
- ✅ Notification system: Keep existing WebSocket-only system unchanged