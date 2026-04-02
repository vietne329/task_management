package com.personalweb.app.service;

import com.personalweb.app.dto.CreateTaskRequest;
import com.personalweb.app.dto.TaskDto;
import com.personalweb.app.dto.UpdateTaskRequest;

import java.util.List;

public interface TaskService {

    List<TaskDto> getAllTasks();

    List<TaskDto> getTasksByUser(String username);

    TaskDto getTaskById(Long id);

    TaskDto createTask(CreateTaskRequest request, String createdByUsername);

    TaskDto updateTask(Long id, UpdateTaskRequest request);

    void deleteTask(Long id);
}
