package com.rahil.book_nexus.googlebooks;

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
    
    Optional<GoogleBookFeedback> findByGoogleBookIdAndUserId(String googleBookId, Integer userId);
}
