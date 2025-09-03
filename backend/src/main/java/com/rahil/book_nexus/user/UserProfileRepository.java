package com.rahil.book_nexus.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Integer> {
    Optional<UserProfile> findByUserId(Integer userId);
    boolean existsByUserId(Integer userId);
    
    Optional<UserProfile> findByDisplayNameIgnoreCase(String displayName);
    boolean existsByDisplayNameIgnoreCase(String displayName);
}
