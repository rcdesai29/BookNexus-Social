package com.rahil.book_nexus.activity;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ActivityFeedRepository extends JpaRepository<ActivityFeed, Integer> {
    
    /**
     * Get recent activity feed ordered by creation date
     */
    @Query("SELECT a FROM ActivityFeed a ORDER BY a.createdDate DESC")
    Page<ActivityFeed> findRecentActivity(Pageable pageable);
    
    /**
     * Get activity for a specific user
     */
    @Query("SELECT a FROM ActivityFeed a WHERE a.user.id = :userId ORDER BY a.createdDate DESC")
    Page<ActivityFeed> findByUserId(@Param("userId") Integer userId, Pageable pageable);
    
    /**
     * Get activity from users that the given user follows (excluding hidden activities and own activities)
     */
    @Query("""
        SELECT a FROM ActivityFeed a 
        WHERE a.user.id IN (
            SELECT f.following.id FROM Follow f WHERE f.follower.id = :userId
        )
        AND a.user.id != :userId
        AND NOT EXISTS (
            SELECT 1 FROM UserActivityHidden uah 
            WHERE uah.user.id = :userId AND uah.activity.id = a.id
        )
        ORDER BY a.createdDate DESC
    """)
    Page<ActivityFeed> findFriendsActivity(@Param("userId") Integer userId, Pageable pageable);
    
    /**
     * Get activity from last N hours
     */
    @Query("SELECT a FROM ActivityFeed a WHERE a.createdDate >= :since ORDER BY a.createdDate DESC")
    List<ActivityFeed> findActivitySince(@Param("since") LocalDateTime since);
    
    /**
     * Delete old activity (cleanup)
     */
    @Modifying
    @Query("DELETE FROM ActivityFeed a WHERE a.createdDate < :before")
    void deleteOldActivity(@Param("before") LocalDateTime before);
    
    /**
     * Get activity from users that the given user follows (for clearing)
     */
    @Query("""
        SELECT a FROM ActivityFeed a 
        WHERE a.user.id IN (
            SELECT f.following.id FROM Follow f WHERE f.follower.id = :userId
        )
        ORDER BY a.createdDate DESC
    """)
    List<ActivityFeed> findFriendsActivitiesForClearing(@Param("userId") Integer userId);
    
    /**
     * Get activities from specified users that aren't already hidden by the user
     */
    @Query("""
        SELECT a FROM ActivityFeed a 
        WHERE a.user.id IN :userIds
        AND NOT EXISTS (
            SELECT 1 FROM UserActivityHidden uah 
            WHERE uah.user.id = :userId AND uah.activity.id = a.id
        )
        ORDER BY a.createdDate DESC
    """)
    List<ActivityFeed> findActivitiesFromUsersNotHidden(@Param("userIds") List<Integer> userIds, @Param("userId") Integer userId);
}