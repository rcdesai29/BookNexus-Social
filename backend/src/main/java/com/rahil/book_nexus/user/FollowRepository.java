package com.rahil.book_nexus.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Integer> {
    
    boolean existsByFollowerIdAndFollowingId(Integer followerId, Integer followingId);
    
    Optional<Follow> findByFollowerIdAndFollowingId(Integer followerId, Integer followingId);
    
    @Query("SELECT COUNT(f) FROM Follow f WHERE f.following.id = :userId")
    long countFollowersByUserId(@Param("userId") Integer userId);
    
    @Query("SELECT COUNT(f) FROM Follow f WHERE f.follower.id = :userId")
    long countFollowingByUserId(@Param("userId") Integer userId);
    
    @Query("SELECT f.following FROM Follow f WHERE f.follower.id = :userId")
    List<User> findFollowingByUserId(@Param("userId") Integer userId);
    
    @Query("SELECT f.follower FROM Follow f WHERE f.following.id = :userId")
    List<User> findFollowersByUserId(@Param("userId") Integer userId);
    
    void deleteByFollowerIdAndFollowingId(Integer followerId, Integer followingId);
}
