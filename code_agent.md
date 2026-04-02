# Code Agent Implementation Notes
# Project: personal-web — Task Management Application
# Date: 2026-03-31

---

## 1. Overview

This document captures the full reasoning, implementation flows, and architecture decisions made while building the personal-web application — a full-stack task manager with Spring Boot 3 backend and React 18 / Ant Design frontend.

---

## 2. Architecture Decision Summary

### 2.1 Backend Framework: Spring Boot 3.2

**Why Spring Boot 3.2?**
- Stable LTS-class release with Jakarta EE 10 namespace (required for Java 17+ compatibility)
- Auto-configuration reduces boilerplate significantly
- Spring Security 6 integrates cleanly with JWT via filter chain customization
- Built-in validation, JPA, and web support make the full CRUD stack straightforward

**Why Java 17 (minimum)?**
- Required by Spring Boot 3.x
- LTS release; records, sealed classes, switch expressions are available
- The `record` syntax is used in `GlobalExceptionHandler.ErrorResponse` to show idiomatic Java 17 usage

### 2.2 Database: PostgreSQL

**Migration from H2 → PostgreSQL (2026-03-31)**
- Original dev DB was H2 file-based; migrated to PostgreSQL for production-ready persistence
- `localhost:5432`, database `postgres`, user `postgres`
- `ddl-auto=update` — Hibernate auto-creates/updates tables on startup
- Data migrated via custom Java PreparedStatement UPSERT program using `ON CONFLICT (id) DO NOTHING`
- `SET session_replication_role = 'replica'` used during bulk import to bypass FK constraint ordering
- Sequences synced post-import: `SELECT setval('table_id_seq', (SELECT MAX(id) FROM table))`

### 2.3 Authentication: JWT (Stateless)

**Why JWT over sessions?**
- Stateless design: no server-side session store needed; scales horizontally without sticky sessions
- Frontend stores the token in `localStorage` and attaches it to every request via Axios interceptor
- Token contains `username`, `role`, and `userId` claims — avoids extra DB lookup per request
- `JwtAuthFilter extends OncePerRequestFilter` ensures the filter runs exactly once per request

**JWT Key Approach:**
- HMAC-SHA256 with a 32-byte key derived from the configured secret
- Key is padded/trimmed to exactly 256 bits to satisfy JJWT's key-length requirement
- Secret is externalized in `application.properties` → easy to override in production via env var

**Token Expiry:** 86400000 ms = 24 hours. Configurable per environment.

**Logout:** Stateless JWT cannot be invalidated server-side without a token blocklist. Logout is handled client-side by removing the token from localStorage. The `/auth/logout` endpoint exists as a no-op to keep the API symmetric.

### 2.4 Role Model: ADMIN vs USER

Two roles cover the requirements cleanly:
- `ADMIN`: can see all tasks, manage all users, assign tasks to anyone
- `USER`: can see/manage their own tasks (assigned to them or created by them)

Role is stored as a `String` enum in the DB and loaded as `ROLE_ADMIN` / `ROLE_USER` for Spring Security's `hasRole()` checks.

---

## 3. Backend Implementation Flow

### 3.1 Request Lifecycle

```
HTTP Request
  → CORS filter (configured in SecurityConfig)
  → JwtAuthFilter.doFilterInternal()
      - Extracts "Authorization: Bearer <token>" header
      - Validates token signature + expiry
      - Loads UserDetails via UserDetailsServiceImpl
      - Sets SecurityContextHolder authentication
  → Spring Security authorization check (permitAll / hasRole)
  → Controller method
  → Service layer (business logic)
  → Repository (JPA → PostgreSQL)
  → Response (serialized by Jackson)
```

### 3.2 Entity Design

**User:**
- `id` (IDENTITY), `username` (UNIQUE), `email` (UNIQUE), `password` (BCrypt), `role` (ENUM), `enabled`, `createdAt`
- `@OneToMany` to Task (assignedTasks, createdTasks) — LAZY to avoid N+1

**Task:**
- `id`, `title`, `description`, `status` (TODO/IN_PROGRESS/DONE), `priority` (LOW/MEDIUM/HIGH)
- `dueDate` (LocalDate — date only, no time), `assignedTo` (ManyToOne → User), `createdBy` (ManyToOne → User)
- `createdAt`, `updatedAt` — managed by `@CreationTimestamp` / `@UpdateTimestamp`

**Reason for separate `assignedTo` and `createdBy`:** A task creator may assign it to another user, which is the core workflow. Both fields needed for the "my tasks" query (tasks created by me OR assigned to me).

### 3.3 Repository Custom Queries

- `findAllWithUsers()` — LEFT JOIN FETCH both `assignedTo` and `createdBy` in a single query to prevent LazyInitializationException and N+1 problem
- `findByUserWithDetails(userId)` — same join, filtered to current user's tasks

### 3.4 DTO Layer

All entities are mapped to DTOs before being serialized. Reasons:
1. **Security** — password hash never leaks to the client
2. **Decoupling** — entity changes don't break the API contract directly
3. **Flat structure** — nested `UserDto` in `TaskDto` is intentional so the frontend gets all info in one call

### 3.5 Validation

- `@Valid` on controller method parameters activates Bean Validation
- `@NotBlank`, `@Size`, `@Email` annotations on request DTOs
- `MethodArgumentNotValidException` caught by `GlobalExceptionHandler` and returned as a structured error response

### 3.6 Exception Handling

`GlobalExceptionHandler` (@RestControllerAdvice) handles:
- `ResourceNotFoundException` → 404
- `IllegalArgumentException` → 400 (used for duplicate username/email)
- `BadCredentialsException` → 401
- `AccessDeniedException` → 403
- `MethodArgumentNotValidException` → 400 with field-level errors
- Generic `Exception` → 500

All responses use the `ErrorResponse` record with `{status, message, timestamp}`.

### 3.7 DataInitializer

Implements `CommandLineRunner` → runs after application context is fully started.
- Creates `admin` (ADMIN role) and `user1` (USER role) if they don't exist
- Creates 5 sample tasks demonstrating all statuses and priorities
- Idempotent: checks before creating, safe to restart multiple times

---

## 4. Frontend Implementation Flow

### 4.1 State Management: Zustand

**Why Zustand over Redux?**
- Minimal boilerplate: a store is defined in ~50 lines
- No Provider wrapping needed — hooks work anywhere in the tree
- Persist auth state: token and user info are stored in localStorage and rehydrated in store initialization
- `isAdmin()` computed getter avoids scattered `role === 'ADMIN'` checks

### 4.2 Auth Flow

```
LoginPage
  → authService.login(credentials)
  → POST /api/v1/auth/login
  → on success: store.login(response) → writes to localStorage + Zustand
  → navigate('/dashboard')

PrivateRoute (in App.tsx)
  → checks store.isAuthenticated
  → if false: redirect to /login

Axios interceptor (api.ts)
  → attaches "Authorization: Bearer <token>" to every request
  → on 401 response: clear localStorage + redirect to /login
```

### 4.3 Routing

React Router v6 `<Routes>`:
- `/login` — public only (redirects to `/dashboard` if already authenticated)
- `/dashboard` — private (redirects to `/login` if not authenticated)
- `/` and `*` — redirect to `/dashboard`

Single dashboard page uses Ant Design `<Tabs>` to switch between views, avoiding page reloads.

### 4.4 Component Architecture

```
App.tsx
  └── AppLayout (sidebar + header)
      └── DashboardPage (Tabs — URL-driven: ?tab=xxx)
          ├── TaskManagementPage (mode=my-tasks)         — all users
          ├── TaskManagementPage (mode=all-tasks) [ADMIN]
          ├── UserManagementPage [ADMIN]
          ├── MsuiteAccountPage [ADMIN]
          └── KnowledgeNotePage                          — all users

Modal forms (portals, rendered at root):
  TaskForm          — create/edit task
  UserForm          — create/edit user
  MsuiteAccountForm — create/edit msuite account
  KnowledgeForm     — create/edit knowledge note
```

**Tab state design:** URL query param `?tab=xxx` is the single source of truth. Sidebar clicks call `navigate('/dashboard?tab=xxx')`. `DashboardPage` reads `location.search` via `useEffect` to sync `activeKey`. This prevents stale state on browser back/forward.

### 4.5 Task Management Page Design

- **Stats row** at top: total, todo, in-progress, done counts with color-coded cards
- **Filters**: text search (title/description/assignee), status filter, priority filter — all controlled and combined client-side for instant feedback
- **Table**: Ant Design `<Table>` with sortable columns (dueDate, createdAt), `scroll={{ x: 900 }}` for mobile responsiveness
- **Overdue highlighting**: tasks past due date with non-DONE status get red text
- **Due-soon warning**: tasks within 3 days get orange text with icon

### 4.6 API Service Layer

Three service modules (`authService`, `taskService`, `userService`) encapsulate all HTTP calls. The central `api.ts` Axios instance handles:
- Base URL (`/api/v1` — proxied to `localhost:8080` by Vite dev server)
- JWT header injection
- 401 auto-logout

### 4.7 Type System

`src/types/index.ts` is the single source of truth for TypeScript interfaces. Notably:
- `TASK_STATUS_LABELS`, `TASK_STATUS_COLORS`, `PRIORITY_LABELS`, `PRIORITY_COLORS` — constant maps used in both table columns and form selects, keeping display logic DRY
- All API request/response shapes are typed to catch mismatches at compile time

---

## 5. Security Approach

### 5.1 CORS Configuration

- Allowed origins: `localhost:5173` (Vite dev), `localhost:3000` (CRA fallback)
- All HTTP methods allowed
- Credentials allowed (needed for cookie-based auth if ever added)
- Max age 3600s — reduces preflight requests

### 5.2 CSRF

Disabled for the REST API. Reasoning:
- JWT in `Authorization` header is not sent automatically by browsers (unlike cookies)
- CSRF attacks exploit the browser's automatic cookie attachment; bearer tokens are immune
- Disabling CSRF removes the need for CSRF tokens in every request

### 5.3 H2 Console Security (removed)

H2 was used in early development. After migrating to PostgreSQL, the H2 console route and frame-options config were removed from `SecurityConfig`. Use pgAdmin or DBeaver to connect to `localhost:5432`.

### 5.4 Password Storage

BCrypt with default strength (10 rounds). Reasons:
- Adaptive: work factor can be increased as hardware improves
- Built-in salt: each hash is unique, resistant to rainbow tables
- Spring Security's `BCryptPasswordEncoder` is the standard choice

---

## 6. Database: PostgreSQL

PostgreSQL is the production database for this project:

1. **Connection**: `jdbc:postgresql://localhost:5432/postgres`, user `postgres`
2. **Schema management**: `ddl-auto=update` — Hibernate applies DDL changes automatically
3. **Dialect**: `org.hibernate.dialect.PostgreSQLDialect`
4. **Data seeded**: 3 users, 10 tasks, 8 msuite accounts, 4 knowledge notes (migrated from H2)
5. **Sequences**: All `*_id_seq` sequences synced to `MAX(id)` after bulk import to prevent conflicts

---

## 7. Frontend Build & Proxy

Vite configuration proxies `/api` requests to `localhost:8080`. This means:
- No CORS issues during development (same-origin from the browser's perspective)
- Production build deploys the frontend behind a reverse proxy (Nginx) that forwards `/api` to the Spring Boot service

---

---

## 8. Feature Modules

### 8.1 Msuite Account (ADMIN only)

Manages credentials for MSuite deployments across countries:
- **Entity fields**: `account`, `country` (enum: MVT/NCM/VTB/VTC/STL/MYT/VNM/VTL/VTP/VTZ), `domain`, `password`, `keyRestore` (nullable), `createdAt`, `updatedAt`
- **Backend**: `/api/v1/msuite-accounts` — full CRUD, all endpoints require `ROLE_ADMIN` via `@PreAuthorize`
- **Frontend**: Table with per-row password toggle (eye icon), country colored with Ant Design `<Tag>`, `MsuiteAccountForm` modal
- **Access**: ADMIN-only tab in sidebar and DashboardPage

### 8.2 Sổ tay kiến thức / Knowledge Notes (all users)

Personal knowledge notebook accessible to all authenticated users:
- **Entity fields**: `title`, `content` (TEXT, supports multiline), `category`, `tags` (comma-separated string), `createdBy` (ManyToOne → User), `createdAt`, `updatedAt`
- **Backend**: `/api/v1/knowledge` — CRUD; `GET /search?q=` for full-text search across title/content/tags; `GET /categories` returns distinct categories for autocomplete
- **Frontend**: Card grid layout, stats row (total/categories/tags count), detail modal with `white-space: pre-wrap` monospace display for code content, `KnowledgeForm` with category AutoComplete
- **Access**: All authenticated users (sidebar visible to all)

---

## 9. Known Limitations & Future Improvements

1. **JWT invalidation**: Currently logout is client-side only. A production app should maintain a token blocklist (Redis) or use short-lived tokens with refresh tokens.
2. **File upload**: Task attachments not implemented.
3. **Real-time updates**: No WebSocket/SSE; users must refresh to see others' changes.
4. **Pagination on backend**: Currently all tasks/users are returned; should add pageable API for large datasets.
5. **Audit log**: No history of task state changes.
6. **Tests**: Unit and integration tests not included; recommended to add with JUnit 5 + Mockito + @SpringBootTest.
