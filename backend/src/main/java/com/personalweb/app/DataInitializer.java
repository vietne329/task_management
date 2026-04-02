package com.personalweb.app;

import com.personalweb.app.entity.Task;
import com.personalweb.app.entity.User;
import com.personalweb.app.repository.TaskRepository;
import com.personalweb.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        createDefaultAdminIfAbsent();
        createDemoUserIfAbsent();
        createSampleTasksIfAbsent();
    }

    private void createDefaultAdminIfAbsent() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .email("admin@personalweb.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(User.Role.ADMIN)
                    .enabled(true)
                    .build();
            userRepository.save(admin);
            log.info("Default admin user created: username=admin, password=admin123");
        }
    }

    private void createDemoUserIfAbsent() {
        if (!userRepository.existsByUsername("user1")) {
            User user = User.builder()
                    .username("user1")
                    .email("user1@personalweb.com")
                    .password(passwordEncoder.encode("user123"))
                    .role(User.Role.USER)
                    .enabled(true)
                    .build();
            userRepository.save(user);
            log.info("Demo user created: username=user1, password=user123");
        }
    }

    private void createSampleTasksIfAbsent() {
        if (taskRepository.count() == 0) {
            User admin = userRepository.findByUsername("admin").orElse(null);
            User user1 = userRepository.findByUsername("user1").orElse(null);

            if (admin != null) {
                Task task1 = Task.builder()
                        .title("Setup project infrastructure")
                        .description("Configure CI/CD pipeline and deployment environments")
                        .status(Task.TaskStatus.DONE)
                        .priority(Task.Priority.HIGH)
                        .dueDate(LocalDate.now().minusDays(5))
                        .assignedTo(admin)
                        .createdBy(admin)
                        .build();

                Task task2 = Task.builder()
                        .title("Design database schema")
                        .description("Create ERD and define all entity relationships")
                        .status(Task.TaskStatus.IN_PROGRESS)
                        .priority(Task.Priority.HIGH)
                        .dueDate(LocalDate.now().plusDays(3))
                        .assignedTo(admin)
                        .createdBy(admin)
                        .build();

                Task task3 = Task.builder()
                        .title("Implement authentication module")
                        .description("JWT-based login and role management")
                        .status(Task.TaskStatus.IN_PROGRESS)
                        .priority(Task.Priority.HIGH)
                        .dueDate(LocalDate.now().plusDays(7))
                        .assignedTo(user1 != null ? user1 : admin)
                        .createdBy(admin)
                        .build();

                Task task4 = Task.builder()
                        .title("Write API documentation")
                        .description("Document all REST endpoints with Swagger/OpenAPI")
                        .status(Task.TaskStatus.TODO)
                        .priority(Task.Priority.MEDIUM)
                        .dueDate(LocalDate.now().plusDays(14))
                        .assignedTo(user1 != null ? user1 : admin)
                        .createdBy(admin)
                        .build();

                Task task5 = Task.builder()
                        .title("Frontend UI development")
                        .description("Build React components with Ant Design")
                        .status(Task.TaskStatus.TODO)
                        .priority(Task.Priority.MEDIUM)
                        .dueDate(LocalDate.now().plusDays(10))
                        .assignedTo(admin)
                        .createdBy(admin)
                        .build();

                taskRepository.save(task1);
                taskRepository.save(task2);
                taskRepository.save(task3);
                taskRepository.save(task4);
                taskRepository.save(task5);
                log.info("Sample tasks created successfully");
            }
        }
    }
}
