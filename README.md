# Personal Web Application - Task Manager

A full-stack task management application built with Spring Boot 3 + React 18 + Ant Design.

## Tech Stack

### Backend
- Java 17+ / Spring Boot 3.2
- Spring Security + JWT (stateless)
- Spring Data JPA + H2 (file-based, persistent)
- Lombok, SpringDoc OpenAPI (Swagger)

### Frontend
- React 18 + TypeScript + Vite
- Ant Design 5
- React Router v6
- Zustand (state management)
- Axios (HTTP client)
- Day.js (date handling)

## Quick Start

### Prerequisites
- Java 17+
- Maven 3.8+
- Node.js 18+

### 1. Start Backend

```bash
cd backend
mvn spring-boot:run
```

Backend runs on: http://localhost:8080

- Swagger UI: http://localhost:8080/swagger-ui/index.html
- H2 Console: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:file:./data/personalwebdb`
  - Username: `sa` / Password: (empty)

### 2. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:5173

## Default Accounts

| Username | Password | Role  |
|----------|----------|-------|
| admin    | admin123 | ADMIN |
| user1    | user123  | USER  |

## Features

### For All Users
- Login / Logout with JWT authentication
- View & manage own tasks (assigned to or created by)
- Create, edit, delete tasks
- Filter tasks by status and priority
- Search tasks by title/description

### For Admins Only
- View all tasks in the system
- User management (create, edit, delete, enable/disable)
- Assign tasks to any user

## API Endpoints

### Auth
- `POST /api/v1/auth/login` - Login

### Tasks
- `GET /api/v1/tasks` - All tasks (ADMIN)
- `GET /api/v1/tasks/my-tasks` - Current user's tasks
- `GET /api/v1/tasks/{id}` - Task by ID
- `POST /api/v1/tasks` - Create task
- `PUT /api/v1/tasks/{id}` - Update task
- `DELETE /api/v1/tasks/{id}` - Delete task

### Users
- `GET /api/v1/users` - All users (ADMIN)
- `GET /api/v1/users/{id}` - User by ID
- `POST /api/v1/users` - Create user (ADMIN)
- `PUT /api/v1/users/{id}` - Update user (ADMIN)
- `DELETE /api/v1/users/{id}` - Delete user (ADMIN)
- `PATCH /api/v1/users/{id}/toggle-status` - Toggle enabled (ADMIN)

## Project Structure

```
personal-web/
├── backend/
│   ├── pom.xml
│   └── src/main/java/com/personalweb/app/
│       ├── PersonalWebApplication.java
│       ├── DataInitializer.java
│       ├── entity/          # User, Task
│       ├── repository/      # UserRepository, TaskRepository
│       ├── dto/             # DTOs (request/response)
│       ├── security/        # JWT, Filter, SecurityConfig
│       ├── service/         # Service interfaces + impls
│       ├── controller/      # REST controllers
│       └── exception/       # Global exception handler
└── frontend/
    └── src/
        ├── types/           # TypeScript types
        ├── services/        # API service layer
        ├── store/           # Zustand auth store
        ├── pages/           # Page components
        └── components/      # Reusable components
```
