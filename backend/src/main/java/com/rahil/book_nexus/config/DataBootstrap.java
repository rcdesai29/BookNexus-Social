package com.rahil.book_nexus.config;

import com.rahil.book_nexus.book.BookRepository;
import com.rahil.book_nexus.book.BookService;
import com.rahil.book_nexus.user.User;
import com.rahil.book_nexus.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class DataBootstrap implements ApplicationRunner {

    private final BookService bookService;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    @Value("${application.external.googlebooks.enabled:false}")
    private boolean googleBooksEnabled;

    @Override
    public void run(ApplicationArguments args) {
        try {
            if (!googleBooksEnabled) {
                log.info("Google Books import disabled; skipping bootstrap import");
                return;
            }
            if (bookRepository.count() > 0) {
                log.info("Books already present; skipping bootstrap import");
                return;
            }
            User owner = userRepository.findAll().stream().findFirst().orElse(null);
            if (owner == null) {
                log.info("No users found; skip bootstrap import until a user registers");
                return;
            }
            var auth = new UsernamePasswordAuthenticationToken(owner, null, owner.getAuthorities());
            List<String> queries = List.of("bestsellers fiction", "fantasy", "science", "history", "self help");
            int total = 0;
            for (String q : queries) {
                total += bookService.importFromGoogle(q, 5, auth);
            }
            log.info("Bootstrap import added {} books from Google Books", total);
        } catch (Exception e) {
            log.warn("Bootstrap import failed: {}", e.getMessage());
        }
    }
}
