package com.rahil.book_nexus.activity;

import com.rahil.book_nexus.common.BaseEntity;
import com.rahil.book_nexus.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "user_activity_hidden")
public class UserActivityHidden extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "activity_id", nullable = false)
    private ActivityFeed activity;

    @Column(name = "hidden_at", nullable = false)
    private java.time.LocalDateTime hiddenAt;
}