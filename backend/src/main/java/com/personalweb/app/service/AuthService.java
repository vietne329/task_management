package com.personalweb.app.service;

import com.personalweb.app.dto.LoginRequest;
import com.personalweb.app.dto.LoginResponse;

public interface AuthService {

    LoginResponse login(LoginRequest loginRequest);
}
