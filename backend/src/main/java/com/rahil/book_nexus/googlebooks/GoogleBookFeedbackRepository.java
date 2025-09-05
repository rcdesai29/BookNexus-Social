package com.rahil.book_nexus.googlebooks;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GoogleBookFeedbackRepository extends JpaRepository<GoogleBookFeedback, Integer> {
    
    List<GoogleBookFeedback> findByGoogleBookId(String googleBookId);
    
    @Query("SELECT AVG(f.rating) FROM GoogleBookFeedback f WHERE f.googleBookId = :googleBookId")
    Optional<Double> getAverageRatingByGoogleBookId(@Param("googleBookId") String googleBookId);
    
    @Query("SELECT COUNT(f) FROM GoogleBookFeedback f WHERE f.googleBookId = :googleBookId")
    Long getRatingCountByGoogleBookId(@Param("googleBookId") String googleBookId);
    
    @Query("SELECT COUNT(f) FROM GoogleBookFeedback f WHERE f.user.id = :userId")
    long countByUserId(@Param("userId") Integer userId);
    
    @Query("SELECT f FROM GoogleBookFeedback f WHERE f.user.id = :userId ORDER BY f.createdDate DESC")
    Page<GoogleBookFeedback> findAllByUserIdOrderByCreatedDateDesc(@Param("userId") Integer userId, Pageable pageable);
    
    @Query("SELECT f FROM GoogleBookFeedback f WHERE f.user.id = :userId ORDER BY f.createdDate DESC")
    List<GoogleBookFeedback> findByUserId(@Param("userId") Integer userId);
    
    Optional<GoogleBookFeedback> findByGoogleBookIdAndUserId(String googleBookId, Integer userId);
}
