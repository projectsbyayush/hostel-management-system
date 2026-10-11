package com.hostel.config;

import com.hostel.entity.User;
import com.hostel.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Creates (or refreshes) the single administrator account at startup from
 * configuration: ADMIN_USERNAME / ADMIN_EMAIL / ADMIN_PASSWORD
 * (see backend/.env - never commit real passwords, that file is git-ignored).
 */
@Component
public class AdminSeeder implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.username}")
    private String adminUsername;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    public AdminSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (adminPassword == null || adminPassword.isBlank()) {
            log.warn("ADMIN_PASSWORD is not set - skipping admin seeding. Login will not work until it is configured.");
            return;
        }

        var existing = userRepository.findByUsername(adminUsername);
        if (existing.isEmpty()) {
            User admin = new User();
            admin.setUsername(adminUsername);
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setRole("ADMIN");
            admin.setEnabled(true);
            userRepository.save(admin);
            log.info("Admin account '{}' created from configuration.", adminUsername);
            return;
        }

        User admin = existing.get();
        boolean needsUpdate = !passwordEncoder.matches(adminPassword, admin.getPassword())
                || !adminEmail.equals(admin.getEmail());
        if (needsUpdate) {
            admin.setEmail(adminEmail);
            admin.setPassword(passwordEncoder.encode(adminPassword));
            admin.setEnabled(true);
            userRepository.save(admin);
            log.info("Admin account '{}' updated from configuration.", adminUsername);
        } else {
            log.info("Admin account '{}' already up to date.", adminUsername);
        }
    }
}
