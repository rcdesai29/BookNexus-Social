package com.rahil.book_nexus.user;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("profiles")
@RequiredArgsConstructor
@Tag(name = "User Profile")
public class UserProfileController {

    private final UserProfileService userProfileService;

    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileResponse> getUserProfile(
            @PathVariable Integer userId,
            Authentication connectedUser) {
        return ResponseEntity.ok(userProfileService.getUserProfile(userId, connectedUser));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserProfileResponse> updateUserProfile(
            @PathVariable Integer userId,
            @Valid @RequestBody UserProfileRequest request,
            Authentication connectedUser) {
        return ResponseEntity.ok(userProfileService.updateUserProfile(userId, request, connectedUser));
    }

    @PostMapping("/{userId}/follow")
    public ResponseEntity<String> followUser(
            @PathVariable Integer userId,
            Authentication connectedUser) {
        userProfileService.followUser(userId, connectedUser);
        return ResponseEntity.ok("Successfully followed user");
    }

    @DeleteMapping("/{userId}/follow")
    public ResponseEntity<String> unfollowUser(
            @PathVariable Integer userId,
            Authentication connectedUser) {
        userProfileService.unfollowUser(userId, connectedUser);
        return ResponseEntity.ok("Successfully unfollowed user");
    }

    @GetMapping("/{userId}/followers")
    public ResponseEntity<List<User>> getFollowers(
            @PathVariable Integer userId,
            Authentication connectedUser) {
        return ResponseEntity.ok(userProfileService.getFollowers(userId, connectedUser));
    }

    @GetMapping("/{userId}/following")
    public ResponseEntity<List<User>> getFollowing(
            @PathVariable Integer userId,
            Authentication connectedUser) {
        return ResponseEntity.ok(userProfileService.getFollowing(userId, connectedUser));
    }
}
