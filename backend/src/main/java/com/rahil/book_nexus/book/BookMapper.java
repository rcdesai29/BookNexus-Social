package com.rahil.book_nexus.book;

import org.springframework.stereotype.Service;

import com.rahil.book_nexus.file.FileUtils;
import com.rahil.book_nexus.history.BookTransactionHistory;

@Service
public class BookMapper {
    public Book toBook(BookRequest request) {
        return Book.builder()
                .id(request.id())
                .title(request.title())
                .isbn(request.isbn())
                .authorName(request.authorName())
                .synopsis(request.synopsis())
                .archived(false)
                .shareable(request.shareable())
                .bookCover(request.bookCover())
                .build();
    }

    public BookResponse toBookResponse(Book book) {
        return BookResponse.builder()
                .id(book.getId())
                .title(book.getTitle())
                .authorName(book.getAuthorName())
                .isbn(book.getIsbn())
                .synopsis(book.getSynopsis())
                .rate(book.getRate())
                .archived(book.isArchived())
                .shareable(book.isShareable())
                .owner(book.getOwner().fullName())
                .cover(book.getBookCover() != null && book.getBookCover().startsWith("http") ? book.getBookCover()
                        : FileUtils.readFileFromLocation(book.getBookCover()))
                .build();
    }

    public BorrowedBookResponse toBorrowedBookResponse(BookTransactionHistory history) {
        return BorrowedBookResponse.builder()
                .id(history.getBook().getId())
                .title(history.getBook().getTitle())
                .authorName(history.getBook().getAuthorName())
                .isbn(history.getBook().getIsbn())
                .rate(history.getBook().getRate())
                .returned(history.isReturned())
                .returnApproved(history.isReturnApproved())
                .read(history.isRead())
                .readCount(history.getReadCount() != null ? history.getReadCount() : 0)
                .cover(history.getBook().getBookCover() != null && history.getBook().getBookCover().startsWith("http")
                        ? history.getBook().getBookCover()
                        : FileUtils.readFileFromLocation(history.getBook().getBookCover()))
                .build();
    }
}