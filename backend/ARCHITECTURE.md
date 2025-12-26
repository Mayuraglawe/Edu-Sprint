# EduSprint Spring Boot Architecture

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│                    http://localhost:8080                        │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  Login   │  │ Faculty  │  │ Student  │  │  Admin   │       │
│  │  Page    │  │Dashboard │  │Dashboard │  │ Panel    │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST API
                              │ JWT Authentication
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SPRING BOOT BACKEND                           │
│                   http://localhost:8081                         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              API LAYER (Controllers)                    │   │
│  │                                                         │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │   │
│  │  │    Auth      │  │   Subject    │  │   Task      │  │   │
│  │  │  Controller  │  │  Controller  │  │ Controller  │  │   │
│  │  └──────────────┘  └──────────────┘  └─────────────┘  │   │
│  │                                                         │   │
│  │  ┌──────────────┐  ┌──────────────┐                   │   │
│  │  │   Grading    │  │   Health     │                   │   │
│  │  │  Controller  │  │  Controller  │                   │   │
│  │  └──────────────┘  └──────────────┘                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │           SECURITY LAYER (Spring Security)              │   │
│  │                                                         │   │
│  │  ┌──────────────────┐  ┌──────────────────────────┐   │   │
│  │  │ JWT Auth Filter  │→│  UserDetailsService     │   │   │
│  │  └──────────────────┘  └──────────────────────────┘   │   │
│  │                                                         │   │
│  │  ┌──────────────────┐  ┌──────────────────────────┐   │   │
│  │  │   JWT Util       │  │  BCrypt Encoder         │   │   │
│  │  └──────────────────┘  └──────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            SERVICE LAYER (Business Logic)               │   │
│  │                                                         │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │   │
│  │  │    Auth      │  │   Subject    │  │   Task      │  │   │
│  │  │   Service    │  │   Service    │  │  Service    │  │   │
│  │  └──────────────┘  └──────────────┘  └─────────────┘  │   │
│  │                                                         │   │
│  │  ┌──────────────┐  ┌──────────────┐                   │   │
│  │  │   Grading    │  │   Penalty    │                   │   │
│  │  │   Service    │  │   Service    │                   │   │
│  │  └──────────────┘  └──────────────┘                   │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │        REPOSITORY LAYER (Spring Data JPA)               │   │
│  │                                                         │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐         │   │
│  │  │   User     │ │  Subject   │ │   Task     │         │   │
│  │  │ Repository │ │ Repository │ │ Repository │         │   │
│  │  └────────────┘ └────────────┘ └────────────┘         │   │
│  │                                                         │   │
│  │  ┌────────────┐ ┌────────────┐ ┌────────────┐         │   │
│  │  │   Grade    │ │TaskAssign. │ │  Penalty   │         │   │
│  │  │ Repository │ │ Repository │ │ Repository │         │   │
│  │  └────────────┘ └────────────┘ └────────────┘         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │            ENTITY LAYER (JPA Entities)                  │   │
│  │                                                         │   │
│  │  ┌─────┐ ┌─────────┐ ┌──────┐ ┌──────────────┐        │   │
│  │  │User │ │ Subject │ │ Task │ │TaskDefinition│        │   │
│  │  └─────┘ └─────────┘ └──────┘ └──────────────┘        │   │
│  │                                                         │   │
│  │  ┌──────────────┐ ┌───────┐ ┌──────────────┐          │   │
│  │  │TaskAssignment│ │ Grade │ │GradeOverride │          │   │
│  │  └──────────────┘ └───────┘ └──────────────┘          │   │
│  │                                                         │   │
│  │  ┌─────────────────┐ ┌─────────┐                      │   │
│  │  │SubjectEnrollment│ │ Penalty │                      │   │
│  │  └─────────────────┘ └─────────┘                      │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ JDBC
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATABASE                                │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Development: H2 In-Memory (jdbc:h2:mem:edusprint)    │    │
│  │  Production:  PostgreSQL (localhost:5432/edusprint)   │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                 │
│  Tables: users, subjects, tasks, task_definitions,             │
│          task_assignments, grades, grade_overrides,            │
│          subject_enrollments, penalties, workload_tracking     │
└─────────────────────────────────────────────────────────────────┘


## Data Flow Example: Student Login & Task Submission

1. Student clicks "Login" → React sends POST /api/auth/login
   ↓
2. AuthController receives request → validates DTO
   ↓
3. AuthService authenticates → checks UserRepository
   ↓
4. UserRepository queries database → finds user
   ↓
5. JwtUtil generates token → includes user ID, role
   ↓
6. AuthResponse sent back → React stores token
   ↓
7. Student submits task → POST /api/tasks/{id}/submit (with JWT)
   ↓
8. JwtAuthenticationFilter intercepts → validates token
   ↓
9. TaskController receives request → authorized student
   ↓
10. TaskService processes submission → saves to database
   ↓
11. TaskAssignmentRepository updates → sets submitted_at
   ↓
12. Success response → React updates UI


## Security Flow

┌─────────────┐
│   Request   │
└──────┬──────┘
       │
       ▼
┌─────────────────────────┐
│ JwtAuthenticationFilter │ ← Extract token from Authorization header
└──────┬──────────────────┘
       │ Valid token?
       ├─── NO ──→ 401 Unauthorized
       │
       └─── YES
            │
            ▼
       ┌────────────────┐
       │ SecurityContext│ ← Set authentication
       └────────┬───────┘
                │
                ▼
       ┌────────────────┐
       │  Controller    │ ← Check role with @PreAuthorize
       └────────┬───────┘
                │
                ├─── Role mismatch ──→ 403 Forbidden
                │
                └─── Authorized
                     │
                     ▼
                ┌─────────┐
                │ Service │
                └─────────┘


## Database Relationships

users ──────────────┬──────────────────┬──────────────┐
  │                 │                  │              │
  │ faculty_id      │ student_id       │ student_id   │ graded_by
  ▼                 ▼                  ▼              ▼
subjects        task_assignments  subject_enrollments  grades
  │                 │                                   │
  │ subject_id      │ task_id                          │ grade_id
  ▼                 ▼                                   ▼
tasks ◄───────── task_definitions              grade_overrides
  │
  │ task_id
  ▼
penalties


## API Request Flow

Client Request
     │
     ├─→ /api/auth/*      → AuthController  → AuthService      → UserRepository
     ├─→ /api/subjects/*  → SubjectController → SubjectService  → SubjectRepository
     ├─→ /api/tasks/*     → TaskController  → TaskService      → TaskRepository
     ├─→ /api/grades/*    → GradingController → GradingService  → GradeRepository
     └─→ /api/ping        → HealthController (no auth required)
```

## Component Responsibilities

### Controllers (API Layer)
- Receive HTTP requests
- Validate input (Bean Validation)
- Call service methods
- Return HTTP responses
- Handle authentication headers

### Services (Business Logic)
- Implement business rules
- Coordinate between repositories
- Handle transactions
- Transform entities to DTOs
- Validate business constraints

### Repositories (Data Access)
- CRUD operations
- Custom queries
- Database interaction
- Entity management
- Transaction management (with @Transactional)

### Entities (Data Models)
- JPA entity definitions
- Relationship mappings
- Database table mappings
- Validation rules
- Lifecycle callbacks

### Security Components
- JwtUtil: Token generation/validation
- JwtAuthenticationFilter: Request interception
- CustomUserDetailsService: User loading
- SecurityConfig: Security rules

---

**Architecture Style**: Layered Architecture (Standard Spring Boot Pattern)

**Benefits**:
- ✅ Clear separation of concerns
- ✅ Easy to test each layer
- ✅ Scalable and maintainable
- ✅ Industry-standard pattern
- ✅ Flexible database support
