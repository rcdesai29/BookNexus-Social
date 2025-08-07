package com.rahil.book_nexus.history;

import com.rahil.book_nexus.book.Book;
import com.rahil.book_nexus.common.BaseEntity;
import com.rahil.book_nexus.user.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Builder;
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
public class BookTransactionHistory extends BaseEntity {

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @JoinColumn(name = "book_id")
    private Book book;
    private boolean returned;
    private boolean returnApproved;

    @Column(columnDefinition = "boolean default false")
    @Builder.Default
    private boolean read = false;

    @Column(columnDefinition = "int default 0")
    @Builder.Default
    private Integer readCount = 0;
}