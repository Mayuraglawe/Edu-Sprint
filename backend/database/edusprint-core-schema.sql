-- ============================================================================
-- EDUSPRINT CORE SCHEMA - Simplified Academic Workload Management
-- Version: 1.0.0
-- Description: Minimal viable schema for AI-powered task/assignment platform
-- Compatible with: PostgreSQL, MySQL, H2
-- ============================================================================

-- Enable UUID extension (PostgreSQL only)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Table 1: Users (Students, Faculty, Admins)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'faculty', 'admin')),
    institution VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+[.][A-Za-z]+$')
);

-- Table 2: Subjects (Courses/Projects)
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    faculty_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 3: Tasks (Assignments/Tickets)
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'not-started' 
        CHECK (status IN ('not-started', 'in-progress', 'submitted', 'graded')),
    due_date TIMESTAMP NOT NULL,
    weight INTEGER DEFAULT 10,
    max_score INTEGER NOT NULL,
    penalty_percent INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 4: Task Definitions (Definition of Done Checklist)
CREATE TABLE task_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    requirement TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 5: Task Assignments (Student-Task Relationships)
CREATE TABLE task_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    submission_content TEXT,
    
    UNIQUE(task_id, student_id)
);

-- Table 6: Grades (Auto-scoring + Faculty Override)
CREATE TABLE grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    auto_score DECIMAL(5,2),
    final_score DECIMAL(5,2),
    feedback TEXT,
    strictness VARCHAR(20) DEFAULT 'medium' 
        CHECK (strictness IN ('loose', 'medium', 'hard')),
    status VARCHAR(20) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'reviewed', 'approved')),
    graded_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(task_id, student_id)
);

-- Table 7: Grade Overrides (Faculty Override Audit Trail)
CREATE TABLE grade_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade_id UUID NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_score DECIMAL(5,2),
    override_score DECIMAL(5,2),
    reason TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- OPTIONAL ENHANCEMENT TABLES
-- ============================================================================

-- Table 8: Subject Enrollments (Student-Subject Relationships)
CREATE TABLE subject_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(subject_id, student_id)
);

-- Table 9: Penalties (SLA Penalty Tracking)
CREATE TABLE penalties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    penalty_percent INTEGER NOT NULL,
    reason VARCHAR(255),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 10: Workload Tracking (Faculty Analytics)
CREATE TABLE workload_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    tasks_created INTEGER DEFAULT 0,
    tasks_graded INTEGER DEFAULT 0,
    average_grading_time INTEGER, -- in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE INDEX idx_subjects_faculty ON subjects(faculty_id);
CREATE INDEX idx_subjects_code ON subjects(code);

CREATE INDEX idx_tasks_subject ON tasks(subject_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

CREATE INDEX idx_task_definitions_task ON task_definitions(task_id, order_index);

CREATE INDEX idx_task_assignments_task ON task_assignments(task_id);
CREATE INDEX idx_task_assignments_student ON task_assignments(student_id);
CREATE INDEX idx_task_assignments_status ON task_assignments(task_id, student_id);

CREATE INDEX idx_grades_task ON grades(task_id);
CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_grades_status ON grades(status);

CREATE INDEX idx_grade_overrides_grade ON grade_overrides(grade_id);

CREATE INDEX idx_enrollments_subject ON subject_enrollments(subject_id);
CREATE INDEX idx_enrollments_student ON subject_enrollments(student_id);

CREATE INDEX idx_penalties_task_student ON penalties(task_id, student_id);

CREATE INDEX idx_workload_faculty ON workload_tracking(faculty_id, week_start);

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATE TIMESTAMPS
-- ============================================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON grades 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA FOR DEVELOPMENT/TESTING
-- ============================================================================

-- Insert demo users (password: password123)
-- Note: In production, use BCrypt hashed passwords from Spring Security
INSERT INTO users (name, email, password_hash, role, institution) VALUES
    ('Dr. Sarah Johnson', 'faculty@edusprint.com', '$2a$10$XQqRvKJ7dWKJ8yNfKJ8ype8NU5KZL4xpkqKJ8ype8NU5KZL4xpkq', 'faculty', 'MIT'),
    ('John Smith', 'student@edusprint.com', '$2a$10$XQqRvKJ7dWKJ8yNfKJ8ype8NU5KZL4xpkqKJ8ype8NU5KZL4xpkq', 'student', 'MIT'),
    ('Admin User', 'admin@edusprint.com', '$2a$10$XQqRvKJ7dWKJ8yNfKJ8ype8NU5KZL4xpkqKJ8ype8NU5KZL4xpkq', 'admin', 'MIT');

-- Insert demo subjects
INSERT INTO subjects (name, code, description, faculty_id, student_count) VALUES
    ('Data Structures and Algorithms', 'CS101', 'Fundamental data structures and algorithms', 
     (SELECT id FROM users WHERE email = 'faculty@edusprint.com'), 45),
    ('Database Management Systems', 'CS201', 'Relational databases, SQL, and NoSQL', 
     (SELECT id FROM users WHERE email = 'faculty@edusprint.com'), 38),
    ('Web Development', 'CS301', 'Full-stack web development with modern frameworks', 
     (SELECT id FROM users WHERE email = 'faculty@edusprint.com'), 52);

-- Schema verification
DO $$
DECLARE
    table_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
    
    RAISE NOTICE '==============================================================';
    RAISE NOTICE 'EDUSPRINT CORE SCHEMA INITIALIZED SUCCESSFULLY';
    RAISE NOTICE '==============================================================';
    RAISE NOTICE 'Tables Created: %', table_count;
    RAISE NOTICE 'Ready for EduSprint Platform!';
    RAISE NOTICE '==============================================================';
END $$;
