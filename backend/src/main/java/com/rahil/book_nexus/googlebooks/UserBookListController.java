package com.rahil.book_nexus.googlebooks;

import com.rahil.book_nexus.book.UserBookList;
import com.rahil.book_nexus.user.User;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("user-book-lists")
@RequiredArgsConstructor
@Tag(name = "User Book Lists")
public class UserBookListController {
    
    private final GoogleBookIntegrationService googleBookIntegrationService;
    
    @PostMapping("/google-books/{googleBookId}/add")
    public ResponseEntity<UserBookList> addGoogleBookToList(
            @PathVariable String googleBookId,
            @RequestParam UserBookList.ListType listType,
            Authentication connectedUser) {
        
        User user = ((User) connectedUser.getPrincipal());
        UserBookList userBookList = googleBookIntegrationService.addGoogleBookToList(googleBookId, user, listType);
        return ResponseEntity.ok(userBookList);
    }
    
    @DeleteMapping("/google-books/{googleBookId}/remove")
    public ResponseEntity<Void> removeGoogleBookFromList(
            @PathVariable String googleBookId,
            @RequestParam UserBookList.ListType listType,
            Authentication connectedUser) {
        
        User user = ((User) connectedUser.getPrincipal());
        googleBookIntegrationService.removeGoogleBookFromList(googleBookId, user, listType);
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/list-type/{listType}")
    public ResponseEntity<List<UserBookList>> getUserBooksByListType(
            @PathVariable UserBookList.ListType listType,
            Authentication connectedUser) {
        
        User user = ((User) connectedUser.getPrincipal());
        List<UserBookList> userBooks = googleBookIntegrationService.getUserBooksByListType(user, listType);
        return ResponseEntity.ok(userBooks);
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<UserBookList>> getAllUserBooks(Authentication connectedUser) {
        User user = ((User) connectedUser.getPrincipal());
        List<UserBookList> allUserBooks = googleBookIntegrationService.getAllUserBooks(user);
        return ResponseEntity.ok(allUserBooks);
    }
    
    @GetMapping("/favorites")
    public ResponseEntity<List<UserBookList>> getFavorites(Authentication connectedUser) {
        User user = ((User) connectedUser.getPrincipal());
        List<UserBookList> favorites = googleBookIntegrationService.getUserBooksByListType(user, UserBookList.ListType.FAVORITE);
        return ResponseEntity.ok(favorites);
    }
    
    @GetMapping("/currently-reading")
    public ResponseEntity<List<UserBookList>> getCurrentlyReading(Authentication connectedUser) {
        User user = ((User) connectedUser.getPrincipal());
        List<UserBookList> currentlyReading = googleBookIntegrationService.getUserBooksByListType(user, UserBookList.ListType.CURRENTLY_READING);
        return ResponseEntity.ok(currentlyReading);
    }
    
    @GetMapping("/tbr")
    public ResponseEntity<List<UserBookList>> getTBR(Authentication connectedUser) {
        User user = ((User) connectedUser.getPrincipal());
        List<UserBookList> tbr = googleBookIntegrationService.getUserBooksByListType(user, UserBookList.ListType.TBR);
        return ResponseEntity.ok(tbr);
    }
    
    @GetMapping("/read")
    public ResponseEntity<List<UserBookList>> getRead(Authentication connectedUser) {
        User user = ((User) connectedUser.getPrincipal());
        List<UserBookList> read = googleBookIntegrationService.getUserBooksByListType(user, UserBookList.ListType.READ);
        return ResponseEntity.ok(read);
    }
    
    @PutMapping("/google-books/{googleBookId}/progress")
    public ResponseEntity<UserBookList> updateReadingProgress(
            @PathVariable String googleBookId,
            @RequestParam Integer progress,
            Authentication connectedUser) {
        
        User user = ((User) connectedUser.getPrincipal());
        UserBookList updatedUserBookList = googleBookIntegrationService.updateReadingProgress(googleBookId, user, progress);
        return ResponseEntity.ok(updatedUserBookList);
    }
    
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Controller is working!");
    }
}
