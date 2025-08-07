package com.rahil.book_nexus.history;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.rahil.book_nexus.user.User;

import java.util.List;
import java.util.Optional;

public interface BookTransactionHistoryRepository extends JpaRepository<BookTransactionHistory, Integer> {
        /**
         * Checks if a user has already borrowed a book and hasn't returned it yet
         * Note: Uses returned = false (not returnApproved) to allow re-borrowing after
         * returning
         */
        @Query("""
                        SELECT
                        (COUNT (*) > 0) AS isBorrowed
                        FROM BookTransactionHistory bookTransactionHistory
                        WHERE bookTransactionHistory.user.id = :userId
                        AND bookTransactionHistory.book.id = :bookId
                        AND bookTransactionHistory.returned = false
                        """)
        boolean isAlreadyBorrowedByUser(@Param("bookId") Integer bookId, @Param("userId") Integer userId);

        /**
         * Checks if any user has borrowed a book (currently not used - multiple users
         * can read same book)
         * Note: This method is kept for potential future use but is not called in
         * current logic
         */
        @Query("""
                        SELECT
                        (COUNT (*) > 0) AS isBorrowed
                        FROM BookTransactionHistory bookTransactionHistory
                        WHERE bookTransactionHistory.book.id = :bookId
                        AND bookTransactionHistory.returned = false
                        """)
        boolean isAlreadyBorrowed(@Param("bookId") Integer bookId);

        @Query("""
                        SELECT transaction
                        FROM BookTransactionHistory  transaction
                        WHERE transaction.user.id = :userId
                        AND transaction.book.id = :bookId
                        ORDER BY transaction.createdDate DESC
                        """)
        Optional<BookTransactionHistory> findByBookIdAndUserId(@Param("bookId") Integer bookId,
                        @Param("userId") Integer userId);

        @Query("""
                        SELECT transaction
                        FROM BookTransactionHistory  transaction
                        WHERE transaction.book.owner.id = :userId
                        AND transaction.book.id = :bookId
                        AND transaction.returned = true
                        AND transaction.returnApproved = false
                        """)
        Optional<BookTransactionHistory> findByBookIdAndOwnerId(@Param("bookId") Integer bookId,
                        @Param("userId") Integer userId);

        @Query("""
                        SELECT transaction
                        FROM BookTransactionHistory transaction
                        WHERE transaction.user.id = :userId
                        AND transaction.read = true
                        """)
        Page<BookTransactionHistory> findAllReadBooksByUser(@Param("userId") Integer userId, Pageable pageable);

        @Query("""
                        SELECT history
                        FROM BookTransactionHistory history
                        WHERE history.user.id = :userId
                        AND history.returned = false
                        """)
        Page<BookTransactionHistory> findAllBorrowedBooks(Pageable pageable, Integer userId);

        @Query("""
                        SELECT history
                        FROM BookTransactionHistory history
                        WHERE history.book.owner.id = :userId
                        """)
        Page<BookTransactionHistory> findAllReturnedBooks(Pageable pageable, Integer userId);

        @Query("""
                        SELECT transaction
                        FROM BookTransactionHistory transaction
                        WHERE transaction.user.id = :userId
                        AND transaction.book.id = :bookId
                        ORDER BY transaction.createdDate DESC
                        """)
        List<BookTransactionHistory> findAllByBookIdAndUserIdOrderByCreatedDateDesc(@Param("bookId") Integer bookId,
                        @Param("userId") Integer userId);
}