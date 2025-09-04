package com.rahil.book_nexus.googlebooks;

import com.rahil.book_nexus.common.BaseEntity;
import com.rahil.book_nexus.user.User;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Column;
import jakarta.persistence.EntityListeners;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import lombok.Builder;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Entity
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleBookFeedback extends BaseEntity {
    
    @Column(length = 100)
    private String googleBookId;
    
    @Column(length = 1000)
    private String bookTitle;
    
    @Column(length = 500)
    private String authorName;
    
    private Double rating;
    
    @Column(length = 2000)
    private String review;
    
    @Builder.Default
    @Column(name = "is_anonymous", columnDefinition = "boolean default false", nullable = true)  
    private Boolean isAnonymous = false;
    
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
