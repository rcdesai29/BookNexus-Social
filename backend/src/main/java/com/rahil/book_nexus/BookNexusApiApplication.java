package com.rahil.book_nexus;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.context.annotation.Bean;
import com.rahil.book_nexus.role.RoleRepository;
import com.rahil.book_nexus.role.Role;

@SpringBootApplication
@EnableJpaAuditing(auditorAwareRef = "auditorAware")
@EnableAsync
public class BookNexusApiApplication {

	public static void main(String[] args) {
		SpringApplication.run(BookNexusApiApplication.class, args);
	}

	@Bean
	public CommandLineRunner runner(RoleRepository roleRepository) {
		return args -> {
			if (roleRepository.findByName(Role.USER).isEmpty()) {
				roleRepository.save(
						Role.builder().name(Role.USER).build());
			}
		};
	}
}
