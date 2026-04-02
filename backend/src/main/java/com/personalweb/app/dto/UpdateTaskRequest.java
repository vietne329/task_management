package com.personalweb.app.dto;

import com.personalweb.app.entity.Task;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UpdateTaskRequest {

    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    private String description;

    private Task.TaskStatus status;

    private Task.Priority priority;

    private LocalDate dueDate;

    private Long assignedToId;
}
