package com.rahil.book_nexus.googlebooks;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GoogleBookEntityRepository extends JpaRepository<GoogleBookEntity, Long> {
    
    Optional<GoogleBookEntity> findByGoogleBookId(String googleBookId);
    
    Optional<GoogleBookEntity> findByGoogleBookIdAndIsActiveTrue(String googleBookId);
    
    List<GoogleBookEntity> findByIsActiveTrue();
    
    @Query("SELECT gb FROM GoogleBookEntity gb WHERE gb.isActive = true ORDER BY gb.createdDate DESC")
    List<GoogleBookEntity> findRecentActiveBooks();
    
    @Query("SELECT gb FROM GoogleBookEntity gb WHERE gb.isActive = true AND gb.averageRating >= :minRating ORDER BY gb.averageRating DESC")
    List<GoogleBookEntity> findTopRatedBooks(@Param("minRating") Double minRating);
    
    boolean existsByGoogleBookId(String googleBookId);
}
