package com.rahil.book_nexus.book;

import com.rahil.book_nexus.common.PageResponse;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import jakarta.persistence.EntityNotFoundException;

@RestController
@RequestMapping("books")
@RequiredArgsConstructor
@Tag(name = "Book")
public class BookController {
    
    private final RestTemplate restTemplate;

    private final BookService service;

    @PostMapping
    public ResponseEntity<Integer> saveBook(
            @Valid @RequestBody BookRequest request,
            Authentication connectedUser) {
        return ResponseEntity.ok(service.save(request, connectedUser));
    }

    @GetMapping("/{book-id}")
    public ResponseEntity<BookResponse> findBookById(
            @PathVariable("book-id") Integer bookId) {
        return ResponseEntity.ok(service.findById(bookId));
    }

    @GetMapping
    public ResponseEntity<PageResponse<BookResponse>> findAllBooks(
            @RequestParam(name = "page", defaultValue = "0", required = false) int page,
            @RequestParam(name = "size", defaultValue = "10", required = false) int size,
            Authentication connectedUser) {
        return ResponseEntity.ok(service.findAllBooks(page, size, connectedUser));
    }

    @GetMapping("/import/google")
    public ResponseEntity<Integer> importFromGoogle(
            @RequestParam("q") String query,
            @RequestParam(name = "max", defaultValue = "10") int max,
            Authentication connectedUser) {
        int imported = service.importFromGoogle(query, Math.min(Math.max(max, 1), 40), connectedUser);
        return ResponseEntity.ok(imported);
    }

    @GetMapping("/owner")
    public ResponseEntity<PageResponse<BookResponse>> findAllBooksByOwner(
            @RequestParam(name = "page", defaultValue = "0", required = false) int page,
            @RequestParam(name = "size", defaultValue = "10", required = false) int size,
            Authentication connectedUser) {
        return ResponseEntity.ok(service.findAllBooksByOwner(page, size, connectedUser));
    }

    @GetMapping("/borrowed")
    public ResponseEntity<PageResponse<BorrowedBookResponse>> findAllBorrowedBooks(
            @RequestParam(name = "page", defaultValue = "0", required = false) int page,
            @RequestParam(name = "size", defaultValue = "10", required = false) int size,
            Authentication connectedUser) {
        return ResponseEntity.ok(service.findAllBorrowedBooks(page, size, connectedUser));
    }

    @GetMapping("/returned")
    public ResponseEntity<PageResponse<BorrowedBookResponse>> findAllReturnedBooks(
            @RequestParam(name = "page", defaultValue = "0", required = false) int page,
            @RequestParam(name = "size", defaultValue = "10", required = false) int size,
            Authentication connectedUser) {
        return ResponseEntity.ok(service.findAllReturnedBooks(page, size, connectedUser));
    }

    @GetMapping("/read")
    public ResponseEntity<PageResponse<BorrowedBookResponse>> findAllReadBooks(
            @RequestParam(name = "page", defaultValue = "0", required = false) int page,
            @RequestParam(name = "size", defaultValue = "10", required = false) int size,
            Authentication connectedUser) {
        return ResponseEntity.ok(service.findAllReadBooks(page, size, connectedUser));
    }

    @PatchMapping("/shareable/{book-id}")
    public ResponseEntity<Integer> updateShareableStatus(
            @PathVariable("book-id") Integer bookId,
            Authentication connectedUser) {
        return ResponseEntity.ok(service.updateShareableStatus(bookId, connectedUser));
    }

    @PatchMapping("/archived/{book-id}")
    public ResponseEntity<Integer> updateArchivedStatus(
            @PathVariable("book-id") Integer bookId,
            Authentication connectedUser) {
        return ResponseEntity.ok(service.updateArchivedStatus(bookId, connectedUser));
    }

    @PostMapping("borrow/{book-id}")
    public ResponseEntity<Integer> borrowBook(
            @PathVariable("book-id") Integer bookId,
            Authentication connectedUser) {
        return ResponseEntity.ok(service.borrowBook(bookId, connectedUser));
    }

    @PatchMapping("borrow/return/{book-id}")
    public ResponseEntity<Integer> returnBorrowBook(
            @PathVariable("book-id") Integer bookId,
            Authentication connectedUser) {
        return ResponseEntity.ok(service.returnBorrowedBook(bookId, connectedUser));
    }

    @PatchMapping("borrow/return/approve/{book-id}")
    public ResponseEntity<Integer> approveReturnBorrowBook(
            @PathVariable("book-id") Integer bookId,
            Authentication connectedUser) {
        return ResponseEntity.ok(service.approveReturnBorrowedBook(bookId, connectedUser));
    }

    @PatchMapping("borrow/mark-read/{book-id}")
    public ResponseEntity<Integer> markBookAsRead(
            @PathVariable("book-id") Integer bookId,
            Authentication connectedUser) {
        return ResponseEntity.ok(service.markBookAsRead(bookId, connectedUser));
    }

    @PatchMapping("borrow/mark-read/{book-id}/unmark")
    public ResponseEntity<Integer> unmarkBookAsRead(
            @PathVariable("book-id") Integer bookId,
            Authentication connectedUser) {
        return ResponseEntity.ok(service.unmarkBookAsRead(bookId, connectedUser));
    }

    @PostMapping(value = "/cover/{book-id}", consumes = "multipart/form-data")
    public ResponseEntity<?> uploadBookCoverPicture(
            @PathVariable("book-id") Integer bookId,
            @Parameter() @RequestPart("file") MultipartFile file,
            Authentication connectedUser) {
        service.uploadBookCoverPicture(file, connectedUser, bookId);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/test-create-transaction/{book-id}")
    public ResponseEntity<String> createTestTransaction(
            @PathVariable("book-id") Integer bookId,
            Authentication connectedUser) {
        try {
            service.createTestTransaction(bookId, connectedUser);
            return ResponseEntity.ok("Transaction created successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

        @GetMapping("/cover/{book-id}")
    public ResponseEntity<byte[]> getBookCover(@PathVariable("book-id") Integer bookId) {
        try {
            BookResponse book = service.findById(bookId);
            
            if (book.getCover() != null && book.getCover() instanceof String
                    && ((String) book.getCover()).startsWith("http")) {
                // Proxy Google Books image
                ResponseEntity<byte[]> response = restTemplate.getForEntity((String) book.getCover(), byte[].class);
                return ResponseEntity.ok()
                        .contentType(MediaType.IMAGE_JPEG)
                        .body(response.getBody());
            }
            
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/all")
    public ResponseEntity<String> deleteAllBooks(Authentication connectedUser) {
        try {
            service.deleteAllBooks();
            return ResponseEntity.ok("All books deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }
}