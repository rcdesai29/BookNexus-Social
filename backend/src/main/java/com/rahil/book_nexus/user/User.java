package com.rahil.book_nexus.user;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.stereotype.Service;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.OneToMany;
import lombok.Getter;
import lombok.Setter;
import lombok.Builder;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.security.Principal;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.FetchType;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.stream.Collectors;
import com.rahil.book_nexus.role.Role;
import com.rahil.book_nexus.feedback.Feedback;
import com.rahil.book_nexus.history.BookTransactionHistory;
import com.rahil.book_nexus.book.Book;
import com.rahil.book_nexus.googlebooks.GoogleBookFeedback;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "_user")
@EntityListeners(AuditingEntityListener.class)
public class User implements UserDetails, Principal {

    @Id
    @GeneratedValue
    private Integer id;

    private String firstName;
    private String lastName;
    private LocalDate dob;

    @Column(unique = true)
    private String email;
    private String password;

    private boolean enabled;
    private boolean accountLocked;

    @ManyToMany(fetch = FetchType.EAGER)
    private List<Role> roles;

    @OneToMany(mappedBy = "owner")
    private List<Book> books;

    @OneToMany(mappedBy = "user")
    private List<BookTransactionHistory> histories;

    @OneToMany(mappedBy = "user")
    private List<Feedback> feedbacks;

    @OneToMany(mappedBy = "user")
    private List<GoogleBookFeedback> googleBookFeedbacks;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDate createdDate;
    @LastModifiedDate
    @Column(insertable = false)
    private LocalDate lastModifiedDate;

    @Override
    public String getName() {
        return email;
    }

    // UserDetails interface methods
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {

        return this.roles
                .stream()
                .map(r -> new SimpleGrantedAuthority(r.getName()))
                .collect(Collectors.toList());
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true; // NOT expired, FALSE = expired
    }

    @Override
    public boolean isAccountNonLocked() {
        return !accountLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true; // NOT expired, FALSE = expired
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    public String getFullName() {
        return firstName + " " + lastName;
    }

    public String fullName() {
        return (getFirstName() != null ? getFirstName() : "") + " " + (getLastName() != null ? getLastName() : "");
    }
}