-- EduSprint Sample Data - Flyway Migration V2
-- Description: Insert demo users and subjects for testing

-- Insert demo users (password: password123, BCrypt hashed)
-- Use INSERT ... ON CONFLICT to handle duplicates
INSERT INTO users (name, email, password_hash, role, institution) VALUES
    ('Dr. Sarah Johnson', 'faculty@edusprint.com', '$2a$10$rOzJgZxvfq7H8Ln/VQJjVeKNwYv5vKH3d8FgRxP2LmN9QwErTyBiC', 'faculty', 'MIT'),
    ('John Smith', 'student@edusprint.com', '$2a$10$rOzJgZxvfq7H8Ln/VQJjVeKNwYv5vKH3d8FgRxP2LmN9QwErTyBiC', 'student', 'MIT'),
    ('Admin User', 'admin@edusprint.com', '$2a$10$rOzJgZxvfq7H8Ln/VQJjVeKNwYv5vKH3d8FgRxP2LmN9QwErTyBiC', 'admin', 'MIT')
ON CONFLICT (email) DO NOTHING;

-- Insert demo subjects
INSERT INTO subjects (name, code, description, faculty_id, student_count) VALUES
    (
        'Data Structures and Algorithms', 
        'CS101', 
        'Fundamental data structures and algorithms', 
        (SELECT id FROM users WHERE email = 'faculty@edusprint.com'), 
        45
    ),
    (
        'Database Management Systems', 
        'CS201', 
        'Relational databases, SQL, and NoSQL', 
        (SELECT id FROM users WHERE email = 'faculty@edusprint.com'), 
        38
    ),
    (
        'Web Development', 
        'CS301', 
        'Full-stack web development with modern frameworks', 
        (SELECT id FROM users WHERE email = 'faculty@edusprint.com'), 
        52
    )
ON CONFLICT (code) DO NOTHING;
