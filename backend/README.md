# EduSprint Backend - Spring Boot

AI-Powered Academic Workload and Assessment Ecosystem built with Spring Boot.

## 🏗️ Architecture

- **Framework**: Spring Boot 3.2.1
- **Language**: Java 17
- **Build Tool**: Maven
- **Database**: PostgreSQL / MySQL / H2 (flexible)
- **ORM**: Spring Data JPA
- **Security**: Spring Security + JWT
- **Documentation**: OpenAPI 3.0 / Swagger

## 📁 Project Structure

```
backend/
├── src/main/java/com/edusprint/
│   ├── entity/              # JPA Entities
│   │   ├── User.java
│   │   ├── Subject.java
│   │   ├── Task.java
│   │   ├── Grade.java
│   │   └── ...
│   ├── repository/          # Spring Data JPA Repositories
│   ├── service/             # Business Logic Layer
│   ├── controller/          # REST Controllers
│   ├── dto/                 # Data Transfer Objects
│   ├── security/            # JWT & Security Config
│   └── EduSprintApplication.java
├── src/main/resources/
│   ├── application.yml      # Common config
│   ├── application-dev.yml  # Development (H2)
│   ├── application-prod.yml # Production (PostgreSQL)
│   └── db/migration/        # Flyway migrations
├── database/
│   └── edusprint-core-schema.sql  # Core database schema
└── pom.xml
```

## 🚀 Quick Start

### Prerequisites
- Java 17 or higher
- Maven 3.6+
- PostgreSQL 14+ (for production) or H2 (for development)

### Development Mode (H2 In-Memory)

```bash
cd backend
mvn clean install
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

Access points:
- **API Base**: http://localhost:8081/api
- **Swagger UI**: http://localhost:8081/swagger-ui.html
- **H2 Console**: http://localhost:8081/h2-console
  - JDBC URL: `jdbc:h2:mem:edusprint`
  - Username: `sa`
  - Password: (empty)

### Production Mode (PostgreSQL)

1. **Set up PostgreSQL database**:
```sql
CREATE DATABASE edusprint;
CREATE USER edusprint_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE edusprint TO edusprint_user;
```

2. **Run database migration**:
```bash
psql -U edusprint_user -d edusprint -f database/edusprint-core-schema.sql
```

3. **Configure environment variables**:
```bash
export DATABASE_URL=jdbc:postgresql://localhost:5432/edusprint
export DB_USERNAME=edusprint_user
export DB_PASSWORD=your_password
export JWT_SECRET=your-256-bit-secret-key
```

4. **Run application**:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=prod
```

## 🔑 API Endpoints

### Authentication (`/api/auth/*`)
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/verify` - Verify JWT token

### Subjects (`/api/subjects/*`)
- `GET /api/subjects` - List all subjects
- `GET /api/subjects/{id}` - Get subject by ID
- `POST /api/subjects` - Create subject (Faculty only)
- `PUT /api/subjects/{id}` - Update subject
- `DELETE /api/subjects/{id}` - Delete subject

### Tasks (`/api/tasks/*`)
- `GET /api/tasks` - List all tasks
- `GET /api/tasks/{id}` - Get task by ID
- `POST /api/tasks` - Create task (Faculty only)
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task
- `POST /api/tasks/{id}/assign` - Assign task to student
- `POST /api/tasks/{id}/submit` - Submit task (Student only)

### Grading (`/api/grades/*`)
- `GET /api/grades` - List all grades
- `GET /api/grades/{id}` - Get grade by ID
- `POST /api/grades` - Create grade record
- `POST /api/grades/{id}/approve` - Approve grade (Faculty)
- `POST /api/grades/override` - Override grade (Faculty)

## 🗄️ Database Schema

The simplified EduSprint core schema includes 10 tables:

**Core Tables** (7):
1. `users` - Students, Faculty, Admins
2. `subjects` - Academic subjects/courses
3. `tasks` - Assignments/tickets
4. `task_definitions` - Definition of Done checklist
5. `task_assignments` - Student-task relationships
6. `grades` - Auto-grading + faculty override
7. `grade_overrides` - Override audit trail

**Enhancement Tables** (3):
8. `subject_enrollments` - Student-subject enrollments
9. `penalties` - SLA penalty tracking
10. `workload_tracking` - Faculty analytics

## 🔐 Security

- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: BCrypt
- **Authorization**: Role-based (student, faculty, admin)
- **CORS**: Configured for frontend integration
- **Session**: Stateless (JWT-based)

### Default Test Users

```
Faculty: faculty@edusprint.com / password123
Student: student@edusprint.com / password123
Admin:   admin@edusprint.com / password123
```

## 🧪 Testing

```bash
# Run all tests
mvn test

# Run specific test
mvn test -Dtest=AuthServiceTest

# Run with coverage
mvn test jacoco:report
```

## 📦 Building for Production

```bash
# Create executable JAR
mvn clean package -DskipTests

# Run the JAR
java -jar target/edusprint-backend-1.0.0.jar --spring.profiles.active=prod
```

## 🐳 Docker Support (Optional)

```dockerfile
FROM openjdk:17-jdk-slim
COPY target/edusprint-backend-1.0.0.jar app.jar
EXPOSE 8081
ENTRYPOINT ["java", "-jar", "/app.jar"]
```

## 🌐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | JDBC connection string | `jdbc:postgresql://localhost:5432/edusprint` |
| `DB_USERNAME` | Database username | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `JWT_SECRET` | JWT signing secret (256-bit) | Auto-generated (dev only) |
| `JWT_EXPIRATION` | Token expiration (ms) | `604800000` (7 days) |
| `SERVER_PORT` | Server port | `8081` |

## 📚 Documentation

- **Swagger UI**: http://localhost:8081/swagger-ui.html
- **OpenAPI JSON**: http://localhost:8081/api-docs
- **Database Schema**: `backend/database/edusprint-core-schema.sql`

## 🛠️ Development Tools

- **Lombok**: Reduces boilerplate code
- **MapStruct**: DTO mapping
- **Flyway**: Database migrations
- **Spring DevTools**: Hot reload
- **H2 Console**: In-browser SQL client

## 🔄 Migration from Express Backend

The Spring Boot backend maintains API compatibility with the existing Express/Node.js backend:

- ✅ Identical endpoint paths (`/api/auth/login`, `/api/subjects`, etc.)
- ✅ Same request/response DTOs
- ✅ Compatible authentication (JWT)
- ✅ No frontend changes required

## 📈 Next Steps

1. ✅ Core entities and repositories
2. ✅ JWT authentication
3. ✅ Basic CRUD operations
4. 🔄 Service layer implementation
5. 🔄 REST controllers
6. ⏳ AI integration (grading, syllabus parsing)
7. ⏳ File upload (S3 integration)
8. ⏳ SLA penalty engine
9. ⏳ Excel export/import
10. ⏳ Workload analytics

## 📄 License

Copyright © 2025 EduSprint Team. All rights reserved.

## 🤝 Contributing

This is part of the EduSprint project. See main repository for contribution guidelines.

---

**Built with ❤️ using Spring Boot**
