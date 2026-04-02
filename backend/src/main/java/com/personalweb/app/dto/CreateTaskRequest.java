package com.personalweb.app.dto;

import com.personalweb.app.entity.Task;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateTaskRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    private String description;

    private Task.TaskStatus status = Task.TaskStatus.TODO;

    private Task.Priority priority = Task.Priority.MEDIUM;

    private LocalDate dueDate;

    private Long assignedToId;
}
