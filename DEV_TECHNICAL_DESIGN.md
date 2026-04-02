# DEV Technical Design Document
# Project: personal-web — Task Management Application
# Author: Dev Agent
# Date: 2026-03-31
# Status: DESIGN_COMPLETE

---

## 1. System Overview

A personal task management web application with:
- **Backend**: Spring Boot 3.2, Java 17, H2 persistent DB, JWT auth
- **Frontend**: React 18, TypeScript, Vite, Ant Design 5
- **Pattern**: REST API + SPA, stateless JWT authentication

---

## 2. Database Schema

### Table: `users`
| Column     | Type         | Constraints             |
|------------|--------------|-------------------------|
| id         | BIGINT       | PK, AUTO_INCREMENT      |
| username   | VARCHAR(50)  | UNIQUE, NOT NULL        |
| email      | VARCHAR(100) | UNIQUE, NOT NULL        |
| password   | VARCHAR(255) | NOT NULL (BCrypt)       |
| role       | VARCHAR(20)  | NOT NULL (ADMIN/USER)   |
| enabled    | BOOLEAN      | NOT NULL, DEFAULT true  |
| created_at | TIMESTAMP    | NOT NULL, auto-set      |

### Table: `tasks`
| Column          | Type         | Constraints                        |
|-----------------|--------------|------------------------------------|
| id              | BIGINT       | PK, AUTO_INCREMENT                 |
| title           | VARCHAR(200) | NOT NULL                           |
| description     | TEXT         | NULLABLE                           |
| status          | VARCHAR(20)  | NOT NULL (TODO/IN_PROGRESS/DONE)   |
| priority        | VARCHAR(10)  | NOT NULL (LOW/MEDIUM/HIGH)         |
| due_date        | DATE         | NULLABLE                           |
| assigned_to_id  | BIGINT       | FK → users.id, NULLABLE            |
| created_by_id   | BIGINT       | FK → users.id, NOT NULL            |
| created_at      | TIMESTAMP    | NOT NULL, auto-set                 |
| updated_at      | TIMESTAMP    | NOT NULL, auto-updated             |

---

## 3. API Contract

### Base URL: `/api/v1`

### Auth Endpoints
```
POST /auth/login
  Request:  { username: string, password: string }
  Response: { token: string, username: string, role: string, userId: number, email: string }
  Status:   200 OK | 401 Unauthorized

POST /auth/logout
  Response: 200 OK (client removes token)
```

### Task Endpoints (requires JWT)
```
GET  /tasks               → 200 List<TaskDto>         [ADMIN only]
GET  /tasks/my-tasks      → 200 List<TaskDto>         [any auth user]
GET  /tasks/{id}          → 200 TaskDto | 404
POST /tasks               → 201 TaskDto
PUT  /tasks/{id}          → 200 TaskDto | 404
DELETE /tasks/{id}        → 204 No Content | 404
```

### User Endpoints (requires JWT)
```
GET    /users             → 200 List<UserDto>         [ADMIN only]
GET    /users/{id}        → 200 UserDto | 404
POST   /users             → 201 UserDto               [ADMIN only]
PUT    /users/{id}        → 200 UserDto | 404         [ADMIN only]
DELETE /users/{id}        → 204 No Content            [ADMIN only]
PATCH  /users/{id}/toggle-status → 200               [ADMIN only]
```

### Error Response Format
```json
{
  "status": 404,
  "message": "Task not found with id: 42",
  "timestamp": "2026-03-31T10:30:00"
}
```

---

## 4. Security Design

### JWT Token Structure
```
Header: { alg: "HS256", typ: "JWT" }
Payload: {
  sub: "username",
  role: "ADMIN",
  userId: 1,
  iat: <issued-at>,
  exp: <expiry = iat + 86400s>
}
Signature: HMAC-SHA256(base64(header) + "." + base64(payload), secret)
```

### Authorization Matrix
| Endpoint Pattern         | ROLE_USER | ROLE_ADMIN |
|--------------------------|-----------|------------|
| POST /auth/login         | Public    | Public     |
| GET /tasks/my-tasks      | Yes       | Yes        |
| POST /tasks              | Yes       | Yes        |
| PUT /tasks/{id}          | Yes       | Yes        |
| DELETE /tasks/{id}       | Yes       | Yes        |
| GET /tasks (all)         | No        | Yes        |
| GET/POST/PUT/DELETE users| No        | Yes        |

---

## 5. Frontend Component Tree

```
<App>                           # Router setup
  <LoginPage>                   # /login — gradient login form
  <AppLayout>                   # /dashboard — sidebar + header
    <DashboardPage>
      <Tabs>
        [Tab 1] <TaskManagementPage mode="my-tasks">
          <TaskForm> (modal)
        [Tab 2] <TaskManagementPage mode="all-tasks"> (ADMIN)
          <TaskForm> (modal)
        [Tab 3] <UserManagementPage> (ADMIN)
          <UserForm> (modal)
```

---

## 6. State Management

### Zustand Auth Store (`useAuthStore`)
```typescript
{
  token: string | null
  user: { userId, username, role, email } | null
  isAuthenticated: boolean
  login(response: LoginResponse): void   // stores in localStorage + state
  logout(): void                          // clears localStorage + state
  isAdmin(): boolean                      // computed from role
}
```

Storage: `localStorage['token']` + `localStorage['user']` (JSON)
Rehydration: on store initialization (page load/refresh)

---

## 7. File Structure

```
backend/src/main/java/com/personalweb/app/
├── PersonalWebApplication.java
├── DataInitializer.java
├── entity/
│   ├── User.java
│   └── Task.java
├── repository/
│   ├── UserRepository.java
│   └── TaskRepository.java
├── dto/
│   ├── LoginRequest.java
│   ├── LoginResponse.java
│   ├── UserDto.java
│   ├── TaskDto.java
│   ├── CreateUserRequest.java
│   ├── CreateTaskRequest.java
│   └── UpdateTaskRequest.java
├── security/
│   ├── JwtUtil.java
│   ├── JwtAuthFilter.java
│   ├── SecurityConfig.java
│   └── UserDetailsServiceImpl.java
├── service/
│   ├── AuthService.java
│   ├── UserService.java
│   ├── TaskService.java
│   └── impl/
│       ├── AuthServiceImpl.java
│       ├── UserServiceImpl.java
│       └── TaskServiceImpl.java
├── controller/
│   ├── AuthController.java
│   ├── UserController.java
│   └── TaskController.java
└── exception/
    ├── ResourceNotFoundException.java
    └── GlobalExceptionHandler.java

frontend/src/
├── types/index.ts
├── services/
│   ├── api.ts
│   ├── authService.ts
│   ├── taskService.ts
│   └── userService.ts
├── store/authStore.ts
├── pages/
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── tasks/TaskManagementPage.tsx
│   └── users/UserManagementPage.tsx
└── components/
    ├── Layout/AppLayout.tsx
    ├── tasks/TaskForm.tsx
    └── users/UserForm.tsx
```

---

## 8. Build & Run Instructions

### Backend
```bash
cd backend
mvn clean install -DskipTests
mvn spring-boot:run
# or
java -jar target/personal-web-backend-1.0.0.jar
```

### Frontend
```bash
cd frontend
npm install
npm run dev      # development with HMR
npm run build    # production build → dist/
npm run preview  # preview production build
```

---

## 9. Non-functional Requirements

| NFR              | Approach                                                    |
|------------------|-------------------------------------------------------------|
| Security         | JWT HS256, BCrypt passwords, CORS whitelist, CSRF disabled  |
| Persistence      | H2 file-based; `ddl-auto=update` for schema evolution       |
| Performance      | JOIN FETCH queries to prevent N+1; client-side filtering    |
| Maintainability  | Interface/impl separation, DTOs, GlobalExceptionHandler     |
| DX               | Lombok reduces boilerplate; Vite HMR for fast iteration     |
| Accessibility    | Ant Design components with ARIA support built-in            |
