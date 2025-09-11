package com.rahil.book_nexus.activity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserActivityHiddenRepository extends JpaRepository<UserActivityHidden, Integer> {
    
    /**
     * Find all activities hidden by a specific user
     */
    @Query("SELECT uah.activity.id FROM UserActivityHidden uah WHERE uah.user.id = :userId")
    List<Integer> findHiddenActivityIdsByUserId(@Param("userId") Integer userId);
    
    /**
     * Check if a specific activity is hidden by a user
     */
    boolean existsByUserIdAndActivityId(Integer userId, Integer activityId);
    
    
    /**
     * Delete all hidden activities for a user (unhide all)
     */
    void deleteByUserId(Integer userId);
}