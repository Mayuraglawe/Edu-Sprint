-- EduSprint Schema Enhancement - Flyway Migration V3
-- Description: Add enhanced features for production use

-- Add new columns to existing tables
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS profile_picture_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP;

ALTER TABLE subjects
ADD COLUMN IF NOT EXISTS semester VARCHAR(20),
ADD COLUMN IF NOT EXISTS academic_year VARCHAR(10),
ADD COLUMN IF NOT EXISTS max_students INTEGER,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS task_type VARCHAR(30) DEFAULT 'assignment' CHECK (task_type IN ('assignment', 'quiz', 'exam', 'project', 'lab')),
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS passing_score DECIMAL(6,2),
ADD COLUMN IF NOT EXISTS penalty_per_day DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS allow_late_submission BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS late_submission_deadline TIMESTAMP,
ADD COLUMN IF NOT EXISTS submission_type VARCHAR(30) DEFAULT 'text' CHECK (submission_type IN ('text', 'file', 'link', 'both')),
ADD COLUMN IF NOT EXISTS ai_grading_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id);

-- Update status column to include new statuses
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_status_check;
ALTER TABLE tasks ADD CONSTRAINT tasks_status_check 
CHECK (status IN ('draft', 'published', 'active', 'closed', 'archived'));

ALTER TABLE task_definitions
ADD COLUMN IF NOT EXISTS points DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_mandatory BOOLEAN DEFAULT true;

ALTER TABLE task_assignments
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in-progress', 'submitted', 'graded', 'returned')),
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS file_url VARCHAR(500),
ADD COLUMN IF NOT EXISTS submission_files JSONB,
ADD COLUMN IF NOT EXISTS attempt_number INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS is_late BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS days_late INTEGER DEFAULT 0;

-- Update grades table with new columns
ALTER TABLE grades
RENAME COLUMN auto_score TO ai_score;

ALTER TABLE grades
ADD COLUMN IF NOT EXISTS assignment_id UUID REFERENCES task_assignments(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS ai_feedback TEXT,
ADD COLUMN IF NOT EXISTS ai_graded_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS manual_score DECIMAL(6,2),
ADD COLUMN IF NOT EXISTS manual_feedback TEXT,
ADD COLUMN IF NOT EXISTS graded_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS percentage DECIMAL(5,2),
ADD COLUMN IF NOT EXISTS letter_grade VARCHAR(5),
ADD COLUMN IF NOT EXISTS penalty_applied DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS bonus_points DECIMAL(5,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS rubric_scores JSONB;

-- Rename graded_by column if needed
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='grades' AND column_name='graded_by') THEN
        ALTER TABLE grades RENAME COLUMN faculty_id TO graded_by;
    END IF;
END $$;

ALTER TABLE grade_overrides
ADD COLUMN IF NOT EXISTS override_type VARCHAR(30) CHECK (override_type IN ('adjustment', 'regrade', 'bonus', 'penalty-removal')),
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES users(id);

ALTER TABLE subject_enrollments
ADD COLUMN IF NOT EXISTS enrollment_status VARCHAR(20) DEFAULT 'active' CHECK (enrollment_status IN ('active', 'dropped', 'completed')),
ADD COLUMN IF NOT EXISTS dropped_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS final_grade DECIMAL(5,2);

ALTER TABLE penalties
ADD COLUMN IF NOT EXISTS assignment_id UUID REFERENCES task_assignments(id),
ADD COLUMN IF NOT EXISTS penalty_type VARCHAR(30) CHECK (penalty_type IN ('late-submission', 'plagiarism', 'missing-requirements', 'academic-misconduct')),
ADD COLUMN IF NOT EXISTS penalty_points DECIMAL(6,2),
ADD COLUMN IF NOT EXISTS days_late INTEGER,
ADD COLUMN IF NOT EXISTS waived_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS waived_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS waiver_reason TEXT;

ALTER TABLE workload_tracking
ADD COLUMN IF NOT EXISTS week_end DATE,
ADD COLUMN IF NOT EXISTS tasks_pending INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_grading_time INTEGER,
ADD COLUMN IF NOT EXISTS peak_workload_day VARCHAR(20),
ADD COLUMN IF NOT EXISTS total_students INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS active_submissions INTEGER DEFAULT 0;

-- Create new tables
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

CREATE TABLE IF NOT EXISTS student_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES subjects(id) ON DELETE CASCADE,
    total_tasks INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    average_score DECIMAL(5,2),
    current_grade DECIMAL(5,2),
    on_time_submissions INTEGER DEFAULT 0,
    late_submissions INTEGER DEFAULT 0,
    missing_submissions INTEGER DEFAULT 0,
    improvement_rate DECIMAL(5,2),
    at_risk_flag BOOLEAN DEFAULT false,
    last_calculated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, subject_id)
);

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

-- Create additional indexes
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_users_email_verified ON users(email_verified);
CREATE INDEX IF NOT EXISTS idx_subjects_active ON subjects(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_subjects_academic_year ON subjects(academic_year, semester);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_type_status ON tasks(task_type, status);
CREATE INDEX IF NOT EXISTS idx_task_assignments_status ON task_assignments(status);
CREATE INDEX IF NOT EXISTS idx_task_assignments_submitted ON task_assignments(submitted_at) WHERE submitted_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_grades_graded_by ON grades(graded_by);
CREATE INDEX IF NOT EXISTS idx_grades_final_score ON grades(final_score);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON subject_enrollments(enrollment_status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(notification_type);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_student_analytics_student ON student_analytics(student_id);
CREATE INDEX IF NOT EXISTS idx_student_analytics_subject ON student_analytics(subject_id);
CREATE INDEX IF NOT EXISTS idx_student_analytics_at_risk ON student_analytics(at_risk_flag) WHERE at_risk_flag = true;
CREATE INDEX IF NOT EXISTS idx_workload_subject ON workload_tracking(subject_id, week_start);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
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
