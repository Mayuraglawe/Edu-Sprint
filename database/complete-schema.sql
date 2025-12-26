-- ============================================================================
-- EduSprint Database Schema - Version 3
-- ============================================================================
-- Description: Comprehensive database schema for EduSprint platform
-- Features: User management, Subject & Task tracking, AI-powered grading,
--           Workload analytics, SLA penalties, Real-time notifications
-- ============================================================================

-- Enable required PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Users table (Students, Faculty, Admins)
CREATE TABLE users (
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
CREATE TABLE subjects (
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
CREATE TABLE subject_enrollments (
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
CREATE TABLE tasks (
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
CREATE TABLE task_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    requirement TEXT NOT NULL,
    points DECIMAL(5,2) DEFAULT 0,
    order_index INTEGER NOT NULL,
    is_mandatory BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task submissions/assignments
CREATE TABLE task_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in-progress', 'submitted', 'graded', 'returned')),
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    submitted_at TIMESTAMP,
    submission_content TEXT,
    file_url VARCHAR(500),
    submission_files JSONB, -- Array of file metadata
    attempt_number INTEGER DEFAULT 1,
    is_late BOOLEAN DEFAULT false,
    days_late INTEGER DEFAULT 0,
    UNIQUE(task_id, student_id, attempt_number)
);

-- ============================================================================
-- GRADING SYSTEM
-- ============================================================================

-- Grades table (AI + Manual grading)
CREATE TABLE grades (
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
    rubric_scores JSONB, -- Detailed scoring per criterion
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(task_id, student_id)
);

-- Grade overrides/adjustments
CREATE TABLE grade_overrides (
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
CREATE TABLE grade_disputes (
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
CREATE TABLE penalties (
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
CREATE TABLE workload_tracking (
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
CREATE TABLE student_analytics (
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
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    notification_type VARCHAR(30) CHECK (notification_type IN ('task-assigned', 'grade-posted', 'deadline-reminder', 'system', 'announcement')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_id UUID, -- ID of related task, grade, etc.
    related_type VARCHAR(30), -- 'task', 'grade', 'subject'
    is_read BOOLEAN DEFAULT false,
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP
);

-- Announcements
CREATE TABLE announcements (
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
CREATE TABLE ai_grading_logs (
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
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX idx_users_email_verified ON users(email_verified);

-- Subjects indexes
CREATE INDEX idx_subjects_faculty ON subjects(faculty_id);
CREATE INDEX idx_subjects_code ON subjects(code);
CREATE INDEX idx_subjects_active ON subjects(is_active) WHERE is_active = true;
CREATE INDEX idx_subjects_academic_year ON subjects(academic_year, semester);

-- Tasks indexes
CREATE INDEX idx_tasks_subject ON tasks(subject_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_type_status ON tasks(task_type, status);

-- Assignments indexes
CREATE INDEX idx_task_assignments_task ON task_assignments(task_id);
CREATE INDEX idx_task_assignments_student ON task_assignments(student_id);
CREATE INDEX idx_task_assignments_status ON task_assignments(status);
CREATE INDEX idx_task_assignments_submitted ON task_assignments(submitted_at) WHERE submitted_at IS NOT NULL;

-- Grades indexes
CREATE INDEX idx_grades_task ON grades(task_id);
CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_grades_status ON grades(status);
CREATE INDEX idx_grades_graded_by ON grades(graded_by);
CREATE INDEX idx_grades_final_score ON grades(final_score);

-- Enrollments indexes
CREATE INDEX idx_enrollments_subject ON subject_enrollments(subject_id);
CREATE INDEX idx_enrollments_student ON subject_enrollments(student_id);
CREATE INDEX idx_enrollments_status ON subject_enrollments(enrollment_status);

-- Notifications indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON notifications(notification_type);
CREATE INDEX idx_notifications_created ON notifications(created_at DESC);

-- Analytics indexes
CREATE INDEX idx_student_analytics_student ON student_analytics(student_id);
CREATE INDEX idx_student_analytics_subject ON student_analytics(subject_id);
CREATE INDEX idx_student_analytics_at_risk ON student_analytics(at_risk_flag) WHERE at_risk_flag = true;

-- Workload indexes
CREATE INDEX idx_workload_faculty ON workload_tracking(faculty_id, week_start);
CREATE INDEX idx_workload_subject ON workload_tracking(subject_id, week_start);

-- Full-text search indexes
CREATE INDEX idx_tasks_title_search ON tasks USING gin(to_tsvector('english', title));
CREATE INDEX idx_subjects_name_search ON subjects USING gin(to_tsvector('english', name));
CREATE INDEX idx_users_name_search ON users USING gin(to_tsvector('english', name));

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
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_grades_updated_at BEFORE UPDATE ON grades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_analytics_updated_at BEFORE UPDATE ON student_analytics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- VIEWS FOR COMMON QUERIES
-- ============================================================================

-- Student dashboard view
CREATE VIEW v_student_dashboard AS
SELECT 
    u.id as student_id,
    u.name as student_name,
    s.id as subject_id,
    s.name as subject_name,
    s.code as subject_code,
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT CASE WHEN ta.status = 'submitted' THEN ta.id END) as submitted_tasks,
    COUNT(DISTINCT CASE WHEN g.status = 'finalized' THEN g.id END) as graded_tasks,
    AVG(g.final_score) as average_score,
    COUNT(DISTINCT CASE WHEN ta.is_late = true THEN ta.id END) as late_submissions
FROM users u
JOIN subject_enrollments se ON u.id = se.student_id
JOIN subjects s ON se.subject_id = s.id
LEFT JOIN tasks t ON s.id = t.subject_id AND t.status IN ('published', 'active')
LEFT JOIN task_assignments ta ON t.id = ta.task_id AND u.id = ta.student_id
LEFT JOIN grades g ON t.id = g.task_id AND u.id = g.student_id
WHERE u.role = 'student' AND se.enrollment_status = 'active'
GROUP BY u.id, u.name, s.id, s.name, s.code;

-- Faculty workload view
CREATE VIEW v_faculty_workload AS
SELECT 
    u.id as faculty_id,
    u.name as faculty_name,
    s.id as subject_id,
    s.name as subject_name,
    COUNT(DISTINCT t.id) as total_tasks,
    COUNT(DISTINCT CASE WHEN t.status IN ('published', 'active') THEN t.id END) as active_tasks,
    COUNT(DISTINCT ta.id) as total_submissions,
    COUNT(DISTINCT CASE WHEN g.status = 'pending' THEN g.id END) as pending_grades,
    s.student_count
FROM users u
JOIN subjects s ON u.id = s.faculty_id
LEFT JOIN tasks t ON s.id = t.subject_id
LEFT JOIN task_assignments ta ON t.id = ta.task_id
LEFT JOIN grades g ON t.id = g.task_id
WHERE u.role = 'faculty' AND s.is_active = true
GROUP BY u.id, u.name, s.id, s.name, s.student_count;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE users IS 'Core user table for students, faculty, and administrators';
COMMENT ON TABLE subjects IS 'Academic subjects/courses offered';
COMMENT ON TABLE tasks IS 'Assignments, quizzes, exams, and projects';
COMMENT ON TABLE grades IS 'AI and manual grading results with override support';
COMMENT ON TABLE notifications IS 'Real-time notification system for users';
COMMENT ON TABLE workload_tracking IS 'Faculty workload analytics and metrics';
COMMENT ON TABLE student_analytics IS 'Student performance tracking and at-risk identification';
