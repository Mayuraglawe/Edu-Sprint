-- EduSprint Core Schema - Flyway Migration V1
-- Description: Initial schema creation for EduSprint platform

-- Enable UUID extension (PostgreSQL)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'faculty', 'admin')),
    institution VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subjects table
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

-- Tasks table
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

-- Task definitions table
CREATE TABLE task_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    requirement TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task assignments table
CREATE TABLE task_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    submission_content TEXT,
    UNIQUE(task_id, student_id)
);

-- Grades table
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

-- Grade overrides table
CREATE TABLE grade_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade_id UUID NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_score DECIMAL(5,2),
    override_score DECIMAL(5,2),
    reason TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subject enrollments table
CREATE TABLE subject_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(subject_id, student_id)
);

-- Penalties table
CREATE TABLE penalties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    penalty_percent INTEGER NOT NULL,
    reason VARCHAR(255),
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Workload tracking table
CREATE TABLE workload_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    tasks_created INTEGER DEFAULT 0,
    tasks_graded INTEGER DEFAULT 0,
    average_grading_time INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
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
CREATE INDEX idx_grades_task ON grades(task_id);
CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_grades_status ON grades(status);
CREATE INDEX idx_grade_overrides_grade ON grade_overrides(grade_id);
CREATE INDEX idx_enrollments_subject ON subject_enrollments(subject_id);
CREATE INDEX idx_enrollments_student ON subject_enrollments(student_id);
CREATE INDEX idx_penalties_task_student ON penalties(task_id, student_id);
CREATE INDEX idx_workload_faculty ON workload_tracking(faculty_id, week_start);
