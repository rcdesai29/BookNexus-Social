package com.rahil.book_nexus.activity;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
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
     * Hide all activities from friends for a user (bulk operation)
     * Only hides activities from users they follow, not their own activities
     */
    @Modifying
    @Query(value = """
        INSERT INTO user_activity_hidden (user_id, activity_id, hidden_at, created_date, created_by)
        SELECT :userId, a.id, NOW(), NOW(), :userId
        FROM activity_feed a
        WHERE a.user_id IN (
            SELECT f.following_id FROM follow f WHERE f.follower_id = :userId
        )
        AND NOT EXISTS (
            SELECT 1 FROM user_activity_hidden uah 
            WHERE uah.user_id = :userId AND uah.activity_id = a.id
        )
    """, nativeQuery = true)
    void hideAllFriendsActivitiesForUser(@Param("userId") Integer userId);
    
    /**
     * Delete all hidden activities for a user (unhide all)
     */
    void deleteByUserId(Integer userId);
}