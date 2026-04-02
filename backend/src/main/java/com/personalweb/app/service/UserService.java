package com.personalweb.app.service;

import com.personalweb.app.dto.CreateUserRequest;
import com.personalweb.app.dto.UserDto;

import java.util.List;

public interface UserService {

    List<UserDto> getAllUsers();

    UserDto getUserById(Long id);

    UserDto getUserByUsername(String username);

    UserDto createUser(CreateUserRequest request);

    UserDto updateUser(Long id, CreateUserRequest request);

    void deleteUser(Long id);

    void toggleUserStatus(Long id);
}
