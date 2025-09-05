package com.rahil.book_nexus.book;

import com.rahil.book_nexus.book.UserBookList.ListType;
import com.rahil.book_nexus.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserBookListRepository extends JpaRepository<UserBookList, Long> {
    
    List<UserBookList> findByUserAndListTypeAndIsActiveTrue(User user, ListType listType);
    
    List<UserBookList> findByUserAndIsActiveTrue(User user);
    
    Optional<UserBookList> findByUserAndBookAndListTypeAndIsActiveTrue(User user, Book book, ListType listType);
    
    Optional<UserBookList> findByUserAndGoogleBookAndListTypeAndIsActiveTrue(User user, com.rahil.book_nexus.googlebooks.GoogleBookEntity googleBook, ListType listType);
    
    @Query("SELECT ubl FROM UserBookList ubl WHERE ubl.user = :user AND ubl.listType = :listType AND ubl.isActive = true ORDER BY ubl.createdDate DESC")
    List<UserBookList> findUserBooksByListType(@Param("user") User user, @Param("listType") ListType listType);
    
    @Query("SELECT COUNT(ubl) FROM UserBookList ubl WHERE ubl.user = :user AND ubl.listType = :listType AND ubl.isActive = true")
    Long countUserBooksByListType(@Param("user") User user, @Param("listType") ListType listType);
    
    @Query("SELECT ubl FROM UserBookList ubl WHERE ubl.user = :user AND ubl.isFavorite = true AND ubl.isActive = true ORDER BY ubl.createdDate DESC")
    List<UserBookList> findUserFavoriteBooks(@Param("user") User user);
    
    @Query("SELECT COUNT(ubl) FROM UserBookList ubl WHERE ubl.user = :user AND ubl.isFavorite = true AND ubl.isActive = true")
    Long countUserFavoriteBooks(@Param("user") User user);
    
    boolean existsByUserAndBookAndListTypeAndIsActiveTrue(User user, Book book, ListType listType);
    
    boolean existsByUserAndGoogleBookAndListTypeAndIsActiveTrue(User user, com.rahil.book_nexus.googlebooks.GoogleBookEntity googleBook, ListType listType);
}
