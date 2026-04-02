DROP DATABASE IF EXISTS campushub;
CREATE DATABASE campushub;
USE campushub;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE club_coordinators (
  id INT PRIMARY KEY AUTO_INCREMENT,
  coordinator_name VARCHAR(100) NOT NULL,
  club_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  description TEXT,
  about_us TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE department_coordinators (
  id INT PRIMARY KEY AUTO_INCREMENT,
  coordinator_name VARCHAR(100) NOT NULL,
  department_name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  description TEXT,
  about_us TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE email_verifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  role ENUM('student', 'club_coordinator', 'department_coordinator') NOT NULL,
  organization_name VARCHAR(150),
  verification_code_hash VARCHAR(255) NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_pending_email (email)
);

CREATE TABLE club_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  club_coordinator_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  venue VARCHAR(150) NOT NULL,
  event_date DATETIME NOT NULL,
  registration_deadline DATETIME NOT NULL,
  seat_limit INT NOT NULL,
  volunteer_slots INT NOT NULL DEFAULT 0,
  poster VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (club_coordinator_id) REFERENCES club_coordinators(id) ON DELETE CASCADE
);

CREATE TABLE department_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  department_coordinator_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  venue VARCHAR(150) NOT NULL,
  event_date DATETIME NOT NULL,
  registration_deadline DATETIME NOT NULL,
  seat_limit INT NOT NULL,
  volunteer_slots INT NOT NULL DEFAULT 0,
  poster VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (department_coordinator_id) REFERENCES department_coordinators(id) ON DELETE CASCADE
);

CREATE TABLE club_recruitments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  club_coordinator_id INT NOT NULL,
  title VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  questions JSON,
  deadline DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (club_coordinator_id) REFERENCES club_coordinators(id) ON DELETE CASCADE
);

CREATE TABLE event_registrations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  event_source ENUM('club', 'department') NOT NULL,
  event_id INT NOT NULL,
  qr_code LONGTEXT,
  status ENUM('registered', 'cancelled', 'attended') DEFAULT 'registered',
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_event_student (student_id, event_source, event_id),
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE recruitment_applications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  club_recruitment_id INT NOT NULL,
  student_id INT NOT NULL,
  answers JSON,
  status ENUM('pending', 'shortlisted', 'accepted', 'rejected') DEFAULT 'pending',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (club_recruitment_id) REFERENCES club_recruitments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE volunteer_requests (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  event_source ENUM('club', 'department') NOT NULL,
  event_id INT NOT NULL,
  preferred_role VARCHAR(100),
  assigned_role VARCHAR(100),
  status ENUM('applied', 'assigned', 'rejected') DEFAULT 'applied',
  applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE certificates (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  department_event_id INT NOT NULL,
  certificate_name VARCHAR(150) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (department_event_id) REFERENCES department_events(id) ON DELETE CASCADE
);
