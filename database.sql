-- Drop database if it exists and create a new one
DROP DATABASE IF EXISTS systemm;
CREATE DATABASE systemm;
USE systemm;

-- Create users table
CREATE TABLE users (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'coordinator', 'supervisor', 'student') NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create companies table
CREATE TABLE companies (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    contact_person VARCHAR(100) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create students table
CREATE TABLE students (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    student_id VARCHAR(20) NOT NULL UNIQUE,
    course VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    section VARCHAR(20) NOT NULL,
    contact VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create coordinators table
CREATE TABLE coordinators (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    department VARCHAR(100) NOT NULL,
    contact VARCHAR(20) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create supervisors table
CREATE TABLE supervisors (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    company_id INT NOT NULL,
    position VARCHAR(100) NOT NULL,
    contact VARCHAR(20) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE
);

-- Create ojt_applications table
CREATE TABLE ojt_applications (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    company_id INT NOT NULL,
    position VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    approved_by INT,
    approved_at DATETIME,
    remarks TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create application_remarks table
CREATE TABLE application_remarks (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    application_id INT NOT NULL,
    remarks TEXT NOT NULL,
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (application_id) REFERENCES ojt_applications(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create ojt_requirements table
CREATE TABLE ojt_requirements (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    deadline DATE NOT NULL,
    created_by INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Create student_requirements table
CREATE TABLE student_requirements (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    requirement_id INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    remarks TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME,
    reviewed_by INT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (requirement_id) REFERENCES ojt_requirements(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Create daily_logs table
CREATE TABLE daily_logs (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    log_date DATE NOT NULL,
    time_in TIME NOT NULL,
    time_out TIME NOT NULL,
    activities TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    remarks TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME,
    reviewed_by INT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE (student_id, log_date)
);

-- Create evaluations table
CREATE TABLE evaluations (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    student_id INT NOT NULL,
    supervisor_id INT NOT NULL,
    evaluation_date DATE NOT NULL,
    punctuality INT NOT NULL CHECK (punctuality BETWEEN 1 AND 5),
    work_quality INT NOT NULL CHECK (work_quality BETWEEN 1 AND 5),
    initiative INT NOT NULL CHECK (initiative BETWEEN 1 AND 5),
    communication INT NOT NULL CHECK (communication BETWEEN 1 AND 5),
    teamwork INT NOT NULL CHECK (teamwork BETWEEN 1 AND 5),
    comments TEXT,
    total_score DECIMAL(5,2) GENERATED ALWAYS AS ((punctuality + work_quality + initiative + communication + teamwork)/5) STORED,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (supervisor_id) REFERENCES supervisors(id) ON DELETE CASCADE
);

-- Create activities table (for auditing and notifications)
CREATE TABLE activities (
    id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    action ENUM('create', 'update', 'delete', 'login', 'approve', 'reject') NOT NULL,
    entity VARCHAR(50) NOT NULL,
    entity_id INT,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create user_notification_checks table
CREATE TABLE user_notification_checks (
    user_id INT NOT NULL PRIMARY KEY,
    last_checked DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert default admin user
INSERT INTO users (username, password, role, email, full_name) VALUES 
('admin', '$2y$10$1J7CBb8YlRDnR4nKHfzU9uTWy5bEhG0z1Bh8XkMMeYvIFnKV8jKHm', 'admin', 'admin@csu.edu.ph', 'System Administrator');
-- Password is: admin123

-- Create indices for performance optimization
CREATE INDEX idx_daily_logs_student_date ON daily_logs(student_id, log_date);
CREATE INDEX idx_applications_student ON ojt_applications(student_id, status);
CREATE INDEX idx_applications_company ON ojt_applications(company_id, status);
CREATE INDEX idx_student_requirements_student ON student_requirements(student_id, status);
CREATE INDEX idx_activities_entity ON activities(entity, entity_id);
CREATE INDEX idx_activities_user ON activities(user_id, created_at);

-- Additional tracking views
CREATE VIEW student_hours_view AS
SELECT 
    s.id AS student_id,
    s.student_id AS student_number,
    u.full_name,
    s.course,
    s.year,
    s.section,
    COUNT(DISTINCT dl.log_date) AS total_days,
    SUM(TIME_TO_SEC(TIMEDIFF(dl.time_out, dl.time_in))) / 3600 AS total_hours
FROM 
    students s
    INNER JOIN users u ON s.user_id = u.id
    LEFT JOIN daily_logs dl ON s.id = dl.student_id AND dl.status = 'approved'
GROUP BY 
    s.id, s.student_id, u.full_name, s.course, s.year, s.section;

CREATE VIEW pending_approvals_view AS
SELECT 
    'application' AS type,
    a.id AS entity_id,
    s.student_id AS student_number,
    u.full_name AS student_name,
    c.name AS company_name,
    a.created_at AS submission_date,
    NULL AS reviewer_name
FROM 
    ojt_applications a
    INNER JOIN students s ON a.student_id = s.id
    INNER JOIN users u ON s.user_id = u.id
    INNER JOIN companies c ON a.company_id = c.id
WHERE 
    a.status = 'pending'
UNION
SELECT 
    'daily_log' AS type,
    dl.id AS entity_id,
    s.student_id AS student_number,
    u.full_name AS student_name,
    NULL AS company_name,
    dl.submitted_at AS submission_date,
    NULL AS reviewer_name
FROM 
    daily_logs dl
    INNER JOIN students s ON dl.student_id = s.id
    INNER JOIN users u ON s.user_id = u.id
WHERE 
    dl.status = 'pending'
UNION
SELECT 
    'requirement' AS type,
    sr.id AS entity_id,
    s.student_id AS student_number,
    u.full_name AS student_name,
    NULL AS company_name,
    sr.submitted_at AS submission_date,
    NULL AS reviewer_name
FROM 
    student_requirements sr
    INNER JOIN students s ON sr.student_id = s.id
    INNER JOIN users u ON s.user_id = u.id
WHERE 
    sr.status = 'pending';

-- Triggers for tracking
DELIMITER //

-- Trigger for tracking application status changes
CREATE TRIGGER after_application_update
AFTER UPDATE ON ojt_applications
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO activities (user_id, action, entity, entity_id, details)
        VALUES (
            NEW.approved_by, 
            CASE 
                WHEN NEW.status = 'approved' THEN 'approve'
                WHEN NEW.status = 'rejected' THEN 'reject'
                ELSE 'update'
            END,
            'application',
            NEW.id,
            CONCAT('Status changed from ', OLD.status, ' to ', NEW.status)
        );
    END IF;
END//

-- Trigger for tracking daily log status changes
CREATE TRIGGER after_daily_log_update
AFTER UPDATE ON daily_logs
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO activities (user_id, action, entity, entity_id, details)
        VALUES (
            NEW.reviewed_by, 
            CASE 
                WHEN NEW.status = 'approved' THEN 'approve'
                WHEN NEW.status = 'rejected' THEN 'reject'
                ELSE 'update'
            END,
            'log',
            NEW.id,
            CONCAT('Status changed from ', OLD.status, ' to ', NEW.status)
        );
    END IF;
END//

-- Trigger for tracking requirement status changes
CREATE TRIGGER after_requirement_update
AFTER UPDATE ON student_requirements
FOR EACH ROW
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO activities (user_id, action, entity, entity_id, details)
        VALUES (
            NEW.reviewed_by, 
            CASE 
                WHEN NEW.status = 'approved' THEN 'approve'
                WHEN NEW.status = 'rejected' THEN 'reject'
                ELSE 'update'
            END,
            'requirement',
            NEW.id,
            CONCAT('Status changed from ', OLD.status, ' to ', NEW.status)
        );
    END IF;
END//

DELIMITER ;
