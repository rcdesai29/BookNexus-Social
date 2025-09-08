package com.rahil.book_nexus.feedback;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {
    @Query("""
                        SELECT feedback
                        FROM Feedback  feedback
                        WHERE feedback.book.id = :bookId
            """)
    Page<Feedback> findAllByBookId(@Param("bookId") Integer bookId, Pageable pageable);

    @Query("""
                        SELECT feedback
                        FROM Feedback  feedback
                        WHERE feedback.user.id = :userId
                        ORDER BY feedback.createdDate DESC
            """)
    Page<Feedback> findAllByUserId(@Param("userId") Integer userId, Pageable pageable);

    @Query("SELECT COUNT(f) FROM Feedback f WHERE f.user.id = :userId")
    long countByUserId(@Param("userId") Integer userId);

    @Query("SELECT AVG(f.rating) FROM Feedback f WHERE f.user.id = :userId")
    Double findAverageRatingByUserId(@Param("userId") Integer userId);
    
    // Google Book ID queries
    @Query("""
                        SELECT feedback
                        FROM Feedback feedback
                        WHERE feedback.googleBookId = :googleBookId
                        ORDER BY feedback.createdDate DESC
            """)
    Page<Feedback> findAllByGoogleBookId(@Param("googleBookId") String googleBookId, Pageable pageable);
    
    // Migration helper method
    boolean existsByGoogleBookIdAndUserIdAndReviewAndRating(
        String googleBookId, 
        Integer userId, 
        String review, 
        Double rating
    );
}