package com.personalweb.app.repository;

import com.personalweb.app.entity.Task;
import com.personalweb.app.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByAssignedTo(User user);

    List<Task> findByCreatedBy(User user);

    List<Task> findByStatus(Task.TaskStatus status);

    List<Task> findByPriority(Task.Priority priority);

    @Query("SELECT t FROM Task t WHERE t.assignedTo = :user OR t.createdBy = :user")
    List<Task> findByAssignedToOrCreatedBy(@Param("user") User user);

    List<Task> findByAssignedToId(Long userId);

    @Query("SELECT t FROM Task t LEFT JOIN FETCH t.assignedTo LEFT JOIN FETCH t.createdBy ORDER BY t.createdAt DESC")
    List<Task> findAllWithUsers();

    @Query("SELECT t FROM Task t LEFT JOIN FETCH t.assignedTo LEFT JOIN FETCH t.createdBy WHERE t.assignedTo.id = :userId OR t.createdBy.id = :userId ORDER BY t.createdAt DESC")
    List<Task> findByUserWithDetails(@Param("userId") Long userId);
}
