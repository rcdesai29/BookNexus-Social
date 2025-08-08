package com.rahil.book_nexus.auth;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.List;
import java.util.HashMap;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.rahil.book_nexus.user.User;
import com.rahil.book_nexus.user.UserRepository;
import com.rahil.book_nexus.user.Token;
import com.rahil.book_nexus.user.TokenRepository;
import com.rahil.book_nexus.email.EmailService;
import com.rahil.book_nexus.email.EmailTemplateName;
import com.rahil.book_nexus.role.RoleRepository;
import com.rahil.book_nexus.role.Role;
import com.rahil.book_nexus.security.JwtService;

@Service
@RequiredArgsConstructor
public class AuthenticationService {

    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final TokenRepository tokenRepository;
    private final EmailService emailService;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Value("${application.mailing.frontend.activation-url}")
    private String activationUrl;

    public void register(RegistrationRequest request) {
        var userRole = roleRepository.findByName(Role.USER)
                .orElseThrow(() -> new RuntimeException("User role not found"));
        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .accountLocked(false)
                .enabled(false)
                .roles(List.of(userRole))
                .build();
        userRepository.save(user);
        sendValidationEmail(user);
    }

    private void sendValidationEmail(User user) {
        var newToken = generateAndSaveActivationToken(user);

        try {
            emailService.sendEmail(user.getEmail(), user.getFullName(), EmailTemplateName.ACTIVATE_ACCOUNT,
                    activationUrl,
                    newToken, "Activate your account");
        } catch (jakarta.mail.MessagingException e) {
            throw new RuntimeException("Failed to send email", e);
        }
    }

    private String generateAndSaveActivationToken(User user) {
        String generatedToken = generateActivationToken(6);
        var token = Token.builder()
                .token(generatedToken)
                .createdAt(LocalDate.now())
                .expiresAt(LocalDate.now().plusDays(1))
                .user(user)
                .build();
        tokenRepository.save(token);
        return generatedToken;
    }

    private String generateActivationToken(int length) {
        String characters = "0123456789";
        StringBuilder codeBuilder = new StringBuilder();
        SecureRandom random = new SecureRandom();
        for (int i = 0; i < length; i++) {
            int randomIndex = random.nextInt(characters.length());
            codeBuilder.append(characters.charAt(randomIndex));
        }
        return codeBuilder.toString();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        var auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        var claims = new HashMap<String, Object>();
        var user = ((User) auth.getPrincipal());
        claims.put("fullName", user.getFullName());
        claims.put("userId", user.getId());
        var jwtToken = jwtService.generateToken(claims, user);
        return AuthenticationResponse.builder().token(jwtToken).build();
    }

    @Transactional
    public void activateAccount(String token) throws Exception {
        Token savedToken = tokenRepository.findByToken(token)
                .orElseThrow(() -> new Exception("Token not found"));
        if (LocalDate.now().isAfter(savedToken.getExpiresAt())) {
            sendValidationEmail(savedToken.getUser());
            throw new Exception("Token expired");
        }
        var user = userRepository.findById(savedToken.getUser().getId())
                .orElseThrow(() -> new Exception("User not found"));
        user.setAccountLocked(false);
        user.setEnabled(true);
        userRepository.save(user);
        savedToken.setValidatedAt(LocalDate.now());
        tokenRepository.save(savedToken);
    }
}
