package com.rahil.book_nexus.book;

import com.rahil.book_nexus.common.PageResponse;
import com.rahil.book_nexus.exception.OperationNotPermittedException;
import com.rahil.book_nexus.file.FileStorageService;
import com.rahil.book_nexus.history.BookTransactionHistory;
import com.rahil.book_nexus.history.BookTransactionHistoryRepository;
import com.rahil.book_nexus.user.User;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

import static com.rahil.book_nexus.book.BookSpecification.withOwnerId;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BookService {

        private final BookRepository bookRepository;
        private final BookMapper bookMapper;
        private final BookTransactionHistoryRepository transactionHistoryRepository;
        private final FileStorageService fileStorageService;

        /**
         * Saves a new book and automatically marks it as read for the owner
         * This ensures uploaded books appear in both "My Books" and "Read" sections
         */
        public Integer save(BookRequest request, Authentication connectedUser) {
                User user = ((User) connectedUser.getPrincipal());
                log.info("Saving book for user: {}", user.getFullName());

                Book book = bookMapper.toBook(request);
                book.setCreatedBy(user.getId());
                book.setOwner(user);
                Book savedBook = bookRepository.save(book);
                log.info("Book saved with ID: {}", savedBook.getId());

                // Automatically create a transaction history record marking the book as read
                // since the user is uploading it to their library
                BookTransactionHistory transactionHistory = BookTransactionHistory.builder()
                                .user(user)
                                .book(savedBook)
                                .returned(true)
                                .returnApproved(true)
                                .read(true)
                                .readCount(1)
                                .build();
                BookTransactionHistory savedTransaction = transactionHistoryRepository.save(transactionHistory);
                log.info("Transaction history created with ID: {} for book: {} (read: {})",
                                savedTransaction.getId(), savedBook.getTitle(), savedTransaction.isRead());

                // Flush to ensure the transaction is committed
                transactionHistoryRepository.flush();

                return savedBook.getId();
        }

        public BookResponse findById(Integer bookId) {
                return bookRepository.findById(bookId)
                                .map(bookMapper::toBookResponse)
                                .orElseThrow(() -> new EntityNotFoundException("No book found with ID:: " + bookId));
        }

        public PageResponse<BookResponse> findAllBooks(int page, int size, Authentication connectedUser) {
                Pageable pageable = PageRequest.of(page, size, Sort.by("createdDate").descending());
                Page<Book> books = bookRepository.findAllDisplayableBooks(pageable);
                List<BookResponse> booksResponse = books.stream()
                                .map(bookMapper::toBookResponse)
                                .toList();
                return new PageResponse<>(
                                booksResponse,
                                books.getNumber(),
                                books.getSize(),
                                books.getTotalElements(),
                                books.getTotalPages(),
                                books.isFirst(),
                                books.isLast());
        }

        public PageResponse<BookResponse> findAllBooksByOwner(int page, int size, Authentication connectedUser) {
                User user = ((User) connectedUser.getPrincipal());
                Pageable pageable = PageRequest.of(page, size, Sort.by("createdDate").descending());
                Page<Book> books = bookRepository.findAll(withOwnerId(user.getId()), pageable);
                List<BookResponse> booksResponse = books.stream()
                                .map(bookMapper::toBookResponse)
                                .toList();
                return new PageResponse<>(
                                booksResponse,
                                books.getNumber(),
                                books.getSize(),
                                books.getTotalElements(),
                                books.getTotalPages(),
                                books.isFirst(),
                                books.isLast());
        }

        public Integer updateShareableStatus(Integer bookId, Authentication connectedUser) {
                Book book = bookRepository.findById(bookId)
                                .orElseThrow(() -> new EntityNotFoundException("No book found with ID:: " + bookId));
                User user = ((User) connectedUser.getPrincipal());
                if (!Objects.equals(book.getOwner().getId(), ((User) connectedUser.getPrincipal()).getId())) {
                        throw new OperationNotPermittedException("You cannot update others books shareable status");
                }
                book.setShareable(!book.isShareable());
                bookRepository.save(book);
                return bookId;
        }

        public Integer updateArchivedStatus(Integer bookId, Authentication connectedUser) {
                Book book = bookRepository.findById(bookId)
                                .orElseThrow(() -> new EntityNotFoundException("No book found with ID:: " + bookId));
                User user = ((User) connectedUser.getPrincipal());
                if (!Objects.equals(book.getOwner().getId(), ((User) connectedUser.getPrincipal()).getId())) {
                        throw new OperationNotPermittedException("You cannot update others books archived status");
                }
                book.setArchived(!book.isArchived());
                bookRepository.save(book);
                return bookId;
        }

        /**
         * Allows a user to start reading a book (Goodreads-style - multiple users can
         * read same book)
         * Creates a transaction history record for tracking reading progress
         */
        public Integer borrowBook(Integer bookId, Authentication connectedUser) {
                log.info("borrowBook called with bookId: {} and user: {}", bookId, connectedUser.getName());

                Book book = bookRepository.findById(bookId)
                                .orElseThrow(() -> new EntityNotFoundException("No book found with ID:: " + bookId));
                log.info("Found book: {} (ID: {}), archived: {}, shareable: {}", book.getTitle(), book.getId(),
                                book.isArchived(), book.isShareable());

                if (book.isArchived() || !book.isShareable()) {
                        log.warn("Book cannot be borrowed - archived: {}, shareable: {}", book.isArchived(),
                                        book.isShareable());
                        throw new OperationNotPermittedException(
                                        "The requested book cannot be borrowed since it is archived or not shareable");
                }

                User user = ((User) connectedUser.getPrincipal());
                log.info("User: {} (ID: {}), Book owner: {} (ID: {})", user.getFullName(), user.getId(),
                                book.getOwner().getFullName(), book.getOwner().getId());

                if (Objects.equals(book.getOwner().getId(), user.getId())) {
                        log.warn("User trying to borrow their own book");
                        throw new OperationNotPermittedException("You cannot borrow your own book");
                }

                final boolean isAlreadyBorrowedByUser = transactionHistoryRepository.isAlreadyBorrowedByUser(bookId,
                                user.getId());
                log.info("Is already borrowed by user: {}", isAlreadyBorrowedByUser);
                if (isAlreadyBorrowedByUser) {
                        log.warn("User already started reading this book");
                        throw new OperationNotPermittedException(
                                        "You are already reading this book. Check your 'Currently Reading' list.");
                }

                // Note: Multiple users can read the same book simultaneously (like Goodreads)
                // Removed the check for other users borrowing the book
                log.info("Allowing multiple users to read the same book");

                BookTransactionHistory bookTransactionHistory = BookTransactionHistory.builder()
                                .user(user)
                                .book(book)
                                .returned(false)
                                .returnApproved(false)
                                .read(false)
                                .readCount(0)
                                .build();
                BookTransactionHistory saved = transactionHistoryRepository.save(bookTransactionHistory);
                log.info("Book borrowed successfully. Transaction ID: {}", saved.getId());
                return saved.getId();
        }

        public Integer returnBorrowedBook(Integer bookId, Authentication connectedUser) {
                log.info("returnBorrowedBook called with bookId: {} and user: {}", bookId, connectedUser.getName());

                Book book = bookRepository.findById(bookId)
                                .orElseThrow(() -> new EntityNotFoundException("No book found with ID:: " + bookId));
                User user = ((User) connectedUser.getPrincipal());
                log.info("Found book: {} and user: {}", book.getTitle(), user.getFullName());

                // Find the transaction history for this book and user
                BookTransactionHistory bookTransactionHistory = transactionHistoryRepository
                                .findByBookIdAndUserId(bookId, user.getId())
                                .orElseThrow(() -> new OperationNotPermittedException("You did not borrow this book"));

                log.info("Found transaction history: {}", bookTransactionHistory.getId());

                // Mark as returned
                bookTransactionHistory.setReturned(true);
                BookTransactionHistory saved = transactionHistoryRepository.save(bookTransactionHistory);
                log.info("Book returned successfully. Transaction ID: {}", saved.getId());
                return saved.getId();
        }

        public Integer approveReturnBorrowedBook(Integer bookId, Authentication connectedUser) {
                Book book = bookRepository.findById(bookId)
                                .orElseThrow(() -> new EntityNotFoundException("No book found with ID:: " + bookId));
                if (book.isArchived() || !book.isShareable()) {
                        throw new OperationNotPermittedException("The requested book is archived or not shareable");
                }
                User user = ((User) connectedUser.getPrincipal());
                if (!Objects.equals(book.getOwner().getId(), ((User) connectedUser.getPrincipal()).getId())) {
                        throw new OperationNotPermittedException(
                                        "You cannot approve the return of a book you do not own");
                }

                BookTransactionHistory bookTransactionHistory = transactionHistoryRepository
                                .findByBookIdAndOwnerId(bookId, user.getId())
                                .orElseThrow(() -> new OperationNotPermittedException(
                                                "The book is not returned yet. You cannot approve its return"));

                bookTransactionHistory.setReturnApproved(true);
                return transactionHistoryRepository.save(bookTransactionHistory).getId();
        }

        public void uploadBookCoverPicture(MultipartFile file, Authentication connectedUser, Integer bookId) {
                Book book = bookRepository.findById(bookId)
                                .orElseThrow(() -> new EntityNotFoundException("No book found with ID:: " + bookId));
                User user = ((User) connectedUser.getPrincipal());
                var profilePicture = fileStorageService.saveFile(file, connectedUser.getName());
                book.setBookCover(profilePicture);
                bookRepository.save(book);
        }

        public PageResponse<BorrowedBookResponse> findAllBorrowedBooks(int page, int size,
                        Authentication connectedUser) {
                User user = ((User) connectedUser.getPrincipal());
                Pageable pageable = PageRequest.of(page, size, Sort.by("createdDate").descending());
                Page<BookTransactionHistory> allBorrowedBooks = transactionHistoryRepository.findAllBorrowedBooks(
                                pageable,
                                user.getId());
                List<BorrowedBookResponse> booksResponse = allBorrowedBooks.stream()
                                .map(bookMapper::toBorrowedBookResponse)
                                .toList();
                return new PageResponse<>(
                                booksResponse,
                                allBorrowedBooks.getNumber(),
                                allBorrowedBooks.getSize(),
                                allBorrowedBooks.getTotalElements(),
                                allBorrowedBooks.getTotalPages(),
                                allBorrowedBooks.isFirst(),
                                allBorrowedBooks.isLast());
        }

        public PageResponse<BorrowedBookResponse> findAllReturnedBooks(int page, int size,
                        Authentication connectedUser) {
                User user = ((User) connectedUser.getPrincipal());
                Pageable pageable = PageRequest.of(page, size, Sort.by("createdDate").descending());
                Page<BookTransactionHistory> allBorrowedBooks = transactionHistoryRepository.findAllReturnedBooks(
                                pageable,
                                user.getId());
                List<BorrowedBookResponse> booksResponse = allBorrowedBooks.stream()
                                .map(bookMapper::toBorrowedBookResponse)
                                .toList();
                return new PageResponse<>(
                                booksResponse,
                                allBorrowedBooks.getNumber(),
                                allBorrowedBooks.getSize(),
                                allBorrowedBooks.getTotalElements(),
                                allBorrowedBooks.getTotalPages(),
                                allBorrowedBooks.isFirst(),
                                allBorrowedBooks.isLast());
        }

        public Integer markBookAsRead(Integer bookId, Authentication connectedUser) {
                log.info("markBookAsRead called with bookId: {} and user: {}", bookId, connectedUser.getName());

                Book book = bookRepository.findById(bookId)
                                .orElseThrow(() -> new EntityNotFoundException("No book found with ID:: " + bookId));
                User user = ((User) connectedUser.getPrincipal());
                log.info("Found book: {} and user: {}", book.getTitle(), user.getFullName());

                // Check if user owns the book
                boolean isOwner = Objects.equals(book.getOwner().getId(), user.getId());

                BookTransactionHistory bookTransactionHistory;

                if (isOwner) {
                        // If user owns the book, find or create a transaction history
                        bookTransactionHistory = transactionHistoryRepository
                                        .findByBookIdAndUserId(bookId, user.getId())
                                        .orElseGet(() -> {
                                                // Create a new transaction history for owned book
                                                BookTransactionHistory newHistory = BookTransactionHistory.builder()
                                                                .user(user)
                                                                .book(book)
                                                                .returned(true)
                                                                .returnApproved(true)
                                                                .read(false)
                                                                .build();
                                                return transactionHistoryRepository.save(newHistory);
                                        });
                } else {
                        // For non-owners, find any existing transaction history for this user/book
                        List<BookTransactionHistory> histories = transactionHistoryRepository
                                        .findAllByBookIdAndUserIdOrderByCreatedDateDesc(bookId, user.getId());
                        
                        if (histories.isEmpty()) {
                                // No existing transaction, create a new one (user is "borrowing" to read)
                                log.info("No existing transaction found, creating new one for user to read");
                                bookTransactionHistory = BookTransactionHistory.builder()
                                                .user(user)
                                                .book(book)
                                                .returned(true) // Mark as returned since they're just reading
                                                .returnApproved(true)
                                                .read(false)
                                                .readCount(0)
                                                .build();
                                bookTransactionHistory = transactionHistoryRepository.save(bookTransactionHistory);
                        } else {
                                // Use the latest transaction history
                                bookTransactionHistory = histories.get(0);
                                log.info("Found existing transaction: {}", bookTransactionHistory.getId());
                        }
                }

                log.info("Found/created transaction history: {}", bookTransactionHistory.getId());

                // Mark as read and increment read count
                bookTransactionHistory.setRead(true);
                Integer currentCount = bookTransactionHistory.getReadCount();
                if (currentCount == null) {
                        currentCount = 0;
                }
                bookTransactionHistory.setReadCount(currentCount + 1);
                BookTransactionHistory saved = transactionHistoryRepository.save(bookTransactionHistory);
                log.info("Marked book as read successfully. Transaction ID: {}, Read count: {}", saved.getId(),
                                saved.getReadCount());
                return saved.getId();
        }

        public Integer unmarkBookAsRead(Integer bookId, Authentication connectedUser) {
                log.info("unmarkBookAsRead called with bookId: {} and user: {}", bookId, connectedUser.getName());

                Book book = bookRepository.findById(bookId)
                                .orElseThrow(() -> new EntityNotFoundException("No book found with ID:: " + bookId));
                User user = ((User) connectedUser.getPrincipal());
                log.info("Found book: {} and user: {}", book.getTitle(), user.getFullName());

                // Check if user owns the book
                boolean isOwner = Objects.equals(book.getOwner().getId(), user.getId());

                BookTransactionHistory bookTransactionHistory;

                if (isOwner) {
                        // If user owns the book, find or create a transaction history
                        bookTransactionHistory = transactionHistoryRepository
                                        .findByBookIdAndUserId(bookId, user.getId())
                                        .orElseGet(() -> {
                                                // Create a new transaction history for owned book
                                                BookTransactionHistory newHistory = BookTransactionHistory.builder()
                                                                .user(user)
                                                                .book(book)
                                                                .returned(true)
                                                                .returnApproved(true)
                                                                .read(false)
                                                                .build();
                                                return transactionHistoryRepository.save(newHistory);
                                        });
                } else {
                        // For non-owners, find any existing transaction history for this user/book
                        List<BookTransactionHistory> histories = transactionHistoryRepository
                                        .findAllByBookIdAndUserIdOrderByCreatedDateDesc(bookId, user.getId());
                        
                        if (histories.isEmpty()) {
                                throw new OperationNotPermittedException("You have not read this book yet");
                        } else {
                                // Use the latest transaction history
                                bookTransactionHistory = histories.get(0);
                                log.info("Found existing transaction: {}", bookTransactionHistory.getId());
                        }
                }

                log.info("Found transaction history: {}", bookTransactionHistory.getId());

                // Unmark as read without affecting return status
                bookTransactionHistory.setRead(false);
                BookTransactionHistory saved = transactionHistoryRepository.save(bookTransactionHistory);
                log.info("Unmarked book as read successfully. Transaction ID: {}", saved.getId());
                return saved.getId();
        }

        public PageResponse<BorrowedBookResponse> findAllReadBooks(int page, int size, Authentication connectedUser) {
                User user = ((User) connectedUser.getPrincipal());
                log.info("Finding read books for user: {} (ID: {})", user.getFullName(), user.getId());

                Pageable pageable = PageRequest.of(page, size, Sort.by("createdDate").descending());

                // Find all transaction histories where the user has returned the book (read
                // books)
                Page<BookTransactionHistory> readBooks = transactionHistoryRepository
                                .findAllReadBooksByUser(user.getId(), pageable);

                log.info("Found {} read books for user {}", readBooks.getTotalElements(), user.getFullName());
                readBooks.getContent().forEach(transaction -> log.info("Read book: {} (Transaction ID: {}, Read: {})",
                                transaction.getBook().getTitle(),
                                transaction.getId(),
                                transaction.isRead()));

                List<BorrowedBookResponse> booksResponse = readBooks.stream()
                                .map(bookMapper::toBorrowedBookResponse)
                                .toList();

                return new PageResponse<>(
                                booksResponse,
                                readBooks.getNumber(),
                                readBooks.getSize(),
                                readBooks.getTotalElements(),
                                readBooks.getTotalPages(),
                                readBooks.isFirst(),
                                readBooks.isLast());
        }

        public void createTestTransaction(Integer bookId, Authentication connectedUser) {
                User user = ((User) connectedUser.getPrincipal());
                Book book = bookRepository.findById(bookId)
                                .orElseThrow(() -> new EntityNotFoundException("No book found with ID:: " + bookId));

                log.info("Creating test transaction for book: {} and user: {}", book.getTitle(), user.getFullName());

                // Check if transaction already exists
                Optional<BookTransactionHistory> existingTransaction = transactionHistoryRepository
                                .findByBookIdAndUserId(bookId, user.getId());

                if (existingTransaction.isPresent()) {
                        log.info("Transaction already exists with ID: {}", existingTransaction.get().getId());
                        return;
                }

                // Create new transaction
                BookTransactionHistory transactionHistory = BookTransactionHistory.builder()
                                .user(user)
                                .book(book)
                                .returned(true)
                                .returnApproved(true)
                                .read(true)
                                .build();
                BookTransactionHistory savedTransaction = transactionHistoryRepository.save(transactionHistory);
                log.info("Test transaction created with ID: {} for book: {} (read: {})",
                                savedTransaction.getId(), book.getTitle(), savedTransaction.isRead());
        }
}