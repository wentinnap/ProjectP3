-- Create Database
CREATE DATABASE IF NOT EXISTS temple_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE temple_db;

-- Users Table
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role ENUM('admin', 'user') DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- News Table
CREATE TABLE news (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  image_url VARCHAR(500),
  author_id INT NOT NULL,
  is_visible BOOLEAN DEFAULT TRUE,
  view_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_visible (is_visible),
  INDEX idx_created (created_at),
  FULLTEXT idx_search (title, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Booking Types Table
CREATE TABLE booking_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  duration_minutes INT DEFAULT 60,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bookings Table
CREATE TABLE bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  booking_type_id INT NOT NULL,
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  details TEXT,
  status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
  admin_response TEXT,
  admin_id INT,
  responded_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (booking_type_id) REFERENCES booking_types(id) ON DELETE CASCADE,
  FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_date (booking_date),
  INDEX idx_datetime (booking_date, booking_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert Default Admin
INSERT INTO users (username, email, password, full_name, role) VALUES
('admin', 'admin@temple.com', '$2a$10$XQZ9Z9Z9Z9Z9Z9Z9Z9Z9.eGHG8YhF7p3Q4tHxEE7wVOhFLQJvGgPe', 'ผู้ดูแลระบบ', 'admin');
-- Default password is 'admin123' (you should change this after first login)

-- Insert Sample Booking Types
INSERT INTO booking_types (name, description, duration_minutes) VALUES
('พิธีสวดพระอภิธรรม', 'พิธีสวดพระอภิธรรมถวายผู้ล่วงลับ', 120),
('พิธีทำบุญ', 'พิธีทำบุญอายุวัฒนมงคล วันเกิด', 90),
('พิธีแต่งงาน', 'พิธีสมรสตามประเพณีไทย', 180),
('พิธีบรรพชา', 'พิธีบรรพชาอุปสมบท', 240);

-- Create View for Booking Details
CREATE VIEW booking_details AS
SELECT 
  b.id,
  b.booking_date,
  b.booking_time,
  b.full_name,
  b.phone,
  b.details,
  b.status,
  b.admin_response,
  b.created_at,
  b.updated_at,
  bt.name as booking_type_name,
  bt.description as booking_type_description,
  u.full_name as user_name,
  u.email as user_email,
  admin.full_name as admin_name
FROM bookings b
JOIN booking_types bt ON b.booking_type_id = bt.id
JOIN users u ON b.user_id = u.id
LEFT JOIN users admin ON b.admin_id = admin.id;