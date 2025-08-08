package com.rahil.book_nexus.book;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

public interface BookRepository extends JpaRepository<Book, Integer>, JpaSpecificationExecutor<Book> {
    /**
     * Finds all books that should be displayed in the main library
     * Note: Removed owner exclusion so user's own books also appear in main library
     */
    @Query("""
            SELECT book
            FROM Book book
            WHERE book.archived = false
            AND book.shareable = true
            """)
    Page<Book> findAllDisplayableBooks(Pageable pageable);

    boolean existsByIsbn(String isbn);
}