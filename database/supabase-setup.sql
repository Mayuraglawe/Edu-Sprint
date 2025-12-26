-- ============================================================================
-- EduSprint Database Schema - Complete Setup for Supabase
-- ============================================================================
-- Execute this file in Supabase SQL Editor to set up the complete database
-- ============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users table (Students, Faculty, Admins)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'faculty', 'admin')),
    institution VARCHAR(255),
    profile_picture_url VARCHAR(500),
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    faculty_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    semester VARCHAR(20),
    academic_year VARCHAR(10),
    student_count INTEGER DEFAULT 0,
    max_students INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Subject enrollments (many-to-many: students <-> subjects)
CREATE TABLE IF NOT EXISTS subject_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    enrollment_status VARCHAR(20) DEFAULT 'active' CHECK (enrollment_status IN ('active', 'dropped', 'completed')),
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dropped_at TIMESTAMP,
    completed_at TIMESTAMP,
    final_grade DECIMAL(5,2),
    UNIQUE(subject_id, student_id)
);

-- Tasks/Assignments table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    task_type VARCHAR(30) DEFAULT 'assignment' CHECK (task_type IN ('assignment', 'quiz', 'exam', 'project', 'lab')),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'active', 'closed', 'archived')),
    due_date TIMESTAMP NOT NULL,
    start_date TIMESTAMP,
    weight DECIMAL(5,2) DEFAULT 10.00 CHECK (weight >= 0 AND weight <= 100),
    max_score DECIMAL(6,2) NOT NULL CHECK (max_score > 0),
    passing_score DECIMAL(6,2),
    penalty_per_day DECIMAL(5,2) DEFAULT 0,
    allow_late_submission BOOLEAN DEFAULT false,
    late_submission_deadline TIMESTAMP,
    submission_type VARCHAR(30) DEFAULT 'text' CHECK (submission_type IN ('text', 'file', 'link', 'both')),
    ai_grading_enabled BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task requirements/rubric
CREATE TABLE IF NOT EXISTS task_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    requirement TEXT NOT NULL,
    points DECIMAL(5,2) DEFAULT 0,
    order_index INTEGER NOT NULL,
    is_mandatory BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task submissions/assignments
CREATE TABLE IF NOT EXISTS task_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in-progress', 'submitted', 'graded', 'returned')),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    submitted_at TIMESTAMP,
    submission_content TEXT,
    file_url VARCHAR(500),
    submission_files JSONB,
    attempt_number INTEGER DEFAULT 1,
    is_late BOOLEAN DEFAULT false,
    days_late INTEGER DEFAULT 0,
    UNIQUE(task_id, student_id, attempt_number)
);

-- ============================================================================
-- GRADING SYSTEM
-- ============================================================================

-- Grades table (AI + Manual grading)
CREATE TABLE IF NOT EXISTS grades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES task_assignments(id) ON DELETE CASCADE,
    
    -- AI Grading
    ai_score DECIMAL(6,2),
    ai_feedback TEXT,
    ai_graded_at TIMESTAMP,
    strictness VARCHAR(20) DEFAULT 'medium' CHECK (strictness IN ('loose', 'medium', 'hard')),
    
    -- Manual Grading
    manual_score DECIMAL(6,2),
    manual_feedback TEXT,
    graded_by UUID REFERENCES users(id),
    graded_at TIMESTAMP,
    
    -- Final Grade
    final_score DECIMAL(6,2) NOT NULL,
    percentage DECIMAL(5,2),
    letter_grade VARCHAR(5),
    
    -- Status & Penalties
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'ai-graded', 'reviewed', 'finalized', 'disputed')),
    penalty_applied DECIMAL(5,2) DEFAULT 0,
    bonus_points DECIMAL(5,2) DEFAULT 0,
    
    -- Metadata
    rubric_scores JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(task_id, student_id)
);

-- Grade overrides/adjustments
CREATE TABLE IF NOT EXISTS grade_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade_id UUID NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
    faculty_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    original_score DECIMAL(6,2) NOT NULL,
    override_score DECIMAL(6,2) NOT NULL,
    reason TEXT NOT NULL,
    override_type VARCHAR(30) CHECK (override_type IN ('adjustment', 'regrade', 'bonus', 'penalty-removal')),
    approved_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grade disputes/appeals
CREATE TABLE IF NOT EXISTS grade_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade_id UUID NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'under-review', 'resolved', 'rejected')),
    resolution TEXT,
    resolved_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- ============================================================================
-- PENALTIES & SLA TRACKING
-- ============================================================================

-- Late submission penalties
CREATE TABLE IF NOT EXISTS penalties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assignment_id UUID REFERENCES task_assignments(id),
    penalty_type VARCHAR(30) CHECK (penalty_type IN ('late-submission', 'plagiarism', 'missing-requirements', 'academic-misconduct')),
    penalty_percent DECIMAL(5,2) NOT NULL,
    penalty_points DECIMAL(6,2),
    reason TEXT,
    days_late INTEGER,
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    waived_by UUID REFERENCES users(id),
    waived_at TIMESTAMP,
    waiver_reason TEXT
);

-- ============================================================================
-- WORKLOAD & ANALYTICS
-- ============================================================================

-- Faculty workload tracking
CREATE TABLE IF NOT EXISTS workload_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    faculty_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    week_start DATE NOT NULL,
    week_end DATE NOT NULL,
    
    -- Task metrics
    tasks_created INTEGER DEFAULT 0,
    tasks_graded INTEGER DEFAULT 0,
    tasks_pending INTEGER DEFAULT 0,
    
    -- Time metrics (in minutes)
    average_grading_time INTEGER,
    total_grading_time INTEGER,
    peak_workload_day VARCHAR(20),
    
    -- Student metrics
    total_students INTEGER DEFAULT 0,
    active_submissions INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(faculty_id, subject_id, week_start)
);

-- Student performance analytics
CREATE TABLE IF NOT EXISTS student_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    
    -- Overall metrics
    total_tasks INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    average_score DECIMAL(5,2),
    current_grade DECIMAL(5,2),
    
    -- Submission patterns
    on_time_submissions INTEGER DEFAULT 0,
    late_submissions INTEGER DEFAULT 0,
    missing_submissions INTEGER DEFAULT 0,
    
    -- Performance trends
    improvement_rate DECIMAL(5,2),
    at_risk_flag BOOLEAN DEFAULT false,
    last_calculated_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, subject_id)
);

-- ============================================================================
-- NOTIFICATIONS & COMMUNICATIONS
-- ============================================================================

-- Notifications system
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(30) CHECK (notification_type IN ('task-assigned', 'grade-posted', 'deadline-reminder', 'system', 'announcement')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_id UUID,
    related_type VARCHAR(30),
    is_read BOOLEAN DEFAULT false,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Announcements
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
    is_pinned BOOLEAN DEFAULT false,
    target_audience VARCHAR(20) DEFAULT 'all' CHECK (target_audience IN ('all', 'students', 'faculty')),
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- AI & AUTOMATION
-- ============================================================================

-- AI grading history/logs
CREATE TABLE IF NOT EXISTS ai_grading_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grade_id UUID NOT NULL REFERENCES grades(id) ON DELETE CASCADE,
    model_version VARCHAR(50),
    prompt_used TEXT,
    raw_response TEXT,
    confidence_score DECIMAL(5,2),
    processing_time_ms INTEGER,
    tokens_used INTEGER,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);

-- Subjects indexes
CREATE INDEX IF NOT EXISTS idx_subjects_faculty ON subjects(faculty_id);
CREATE INDEX IF NOT EXISTS idx_subjects_code ON subjects(code);
CREATE INDEX IF NOT EXISTS idx_subjects_active ON subjects(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_subjects_academic_year ON subjects(academic_year, semester);

-- Tasks indexes
CREATE INDEX IF NOT EXISTS idx_tasks_subject ON tasks(subject_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_type_status ON tasks(task_type, status);

-- Assignments indexes
CREATE INDEX IF NOT EXISTS idx_task_assignments_task ON task_assignments(task_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_student ON task_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_task_assignments_status ON task_assignments(status);
CREATE INDEX IF NOT EXISTS idx_task_assignments_submitted ON task_assignments(submitted_at) WHERE submitted_at IS NOT NULL;

-- Task definitions indexes
CREATE INDEX IF NOT EXISTS idx_task_definitions_task ON task_definitions(task_id, order_index);

-- Grades indexes
CREATE INDEX IF NOT EXISTS idx_grades_task ON grades(task_id);
CREATE INDEX IF NOT EXISTS idx_grades_student ON grades(student_id);
CREATE INDEX IF NOT EXISTS idx_grades_status ON grades(status);
CREATE INDEX IF NOT EXISTS idx_grades_graded_by ON grades(graded_by);
CREATE INDEX IF NOT EXISTS idx_grades_final_score ON grades(final_score);

-- Grade overrides indexes
CREATE INDEX IF NOT EXISTS idx_grade_overrides_grade ON grade_overrides(grade_id);

-- Enrollments indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_subject ON subject_enrollments(subject_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON subject_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON subject_enrollments(enrollment_status);

-- Penalties indexes
CREATE INDEX IF NOT EXISTS idx_penalties_task_student ON penalties(task_id, student_id);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_student_analytics_student ON student_analytics(student_id);
CREATE INDEX IF NOT EXISTS idx_student_analytics_subject ON student_analytics(subject_id);
CREATE INDEX IF NOT EXISTS idx_student_analytics_at_risk ON student_analytics(at_risk_flag) WHERE at_risk_flag = true;

-- Workload indexes
CREATE INDEX IF NOT EXISTS idx_workload_faculty ON workload_tracking(faculty_id, week_start);
CREATE INDEX IF NOT EXISTS idx_workload_subject ON workload_tracking(subject_id, week_start);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_tasks_title_search ON tasks USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_subjects_name_search ON subjects USING gin(to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS idx_users_name_search ON users USING gin(to_tsvector('english', name));

-- ============================================================================
-- TRIGGERS FOR AUTO-UPDATE
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_subjects_updated_at ON subjects;
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_grades_updated_at ON grades;
CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON grades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_student_analytics_updated_at ON student_analytics;
CREATE TRIGGER update_student_analytics_updated_at BEFORE UPDATE ON student_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA (Optional - Comment out if not needed)
-- ============================================================================

-- Insert demo users (password: password123, BCrypt hashed)
INSERT INTO users (name, email, password_hash, role, institution) VALUES
    ('Dr. Sarah Johnson', 'faculty@edusprint.com', '$2a$10$rOzJgZxvfq7H8Ln/VQJjVeKNwYv5vKH3d8FgRxP2LmN9QwErTyBiC', 'faculty', 'MIT'),
    ('John Smith', 'student@edusprint.com', '$2a$10$rOzJgZxvfq7H8Ln/VQJjVeKNwYv5vKH3d8FgRxP2LmN9QwErTyBiC', 'student', 'MIT'),
    ('Admin User', 'admin@edusprint.com', '$2a$10$rOzJgZxvfq7H8Ln/VQJjVeKNwYv5vKH3d8FgRxP2LmN9QwErTyBiC', 'admin', 'MIT')
ON CONFLICT (email) DO NOTHING;

-- Insert demo subjects
INSERT INTO subjects (name, code, description, faculty_id, student_count, semester, academic_year) VALUES
    (
        'Data Structures and Algorithms', 
        'CS101', 
        'Fundamental data structures and algorithms', 
        (SELECT id FROM users WHERE email = 'faculty@edusprint.com' LIMIT 1), 
        45,
        'Fall',
        '2024-2025'
    ),
    (
        'Database Management Systems', 
        'CS201', 
        'Relational databases, SQL, and NoSQL', 
        (SELECT id FROM users WHERE email = 'faculty@edusprint.com' LIMIT 1), 
        38,
        'Fall',
        '2024-2025'
    ),
    (
        'Web Development', 
        'CS301', 
        'Full-stack web development with modern frameworks', 
        (SELECT id FROM users WHERE email = 'faculty@edusprint.com' LIMIT 1), 
        52,
        'Fall',
        '2024-2025'
    )
ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
    RAISE NOTICE '========================================';
    RAISE NOTICE 'EduSprint Database Setup Complete!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Created Tables: 16';
    RAISE NOTICE 'Created Indexes: 40+';
    RAISE NOTICE 'Created Triggers: 5';
    RAISE NOTICE 'Sample Users: 3 (faculty, student, admin)';
    RAISE NOTICE 'Sample Subjects: 3';
    RAISE NOTICE '';
    RAISE NOTICE 'Login Credentials (password: password123):';
    RAISE NOTICE '  Faculty: faculty@edusprint.com';
    RAISE NOTICE '  Student: student@edusprint.com';
    RAISE NOTICE '  Admin: admin@edusprint.com';
    RAISE NOTICE '========================================';
END $$;
