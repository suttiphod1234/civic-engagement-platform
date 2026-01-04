-- Civic Engagement Platform Database Schema
-- PostgreSQL Version

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('CITIZEN', 'COORDINATOR', 'ADMIN')),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name_th VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Areas Table (Geographic Locations)
CREATE TABLE areas (
    id SERIAL PRIMARY KEY,
    name_th VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    province VARCHAR(100) NOT NULL,
    district VARCHAR(100),
    subdistrict VARCHAR(100),
    postal_code VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Issues Table
CREATE TABLE issues (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT NOT NULL,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    area_id INTEGER REFERENCES areas(id) ON DELETE SET NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    priority VARCHAR(20) DEFAULT 'MEDIUM' CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP
);

-- Issue Images Table
CREATE TABLE issue_images (
    id SERIAL PRIMARY KEY,
    issue_id INTEGER REFERENCES issues(id) ON DELETE CASCADE,
    image_path VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Issue Updates/Comments Table
CREATE TABLE issue_updates (
    id SERIAL PRIMARY KEY,
    issue_id INTEGER REFERENCES issues(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) CHECK (status IN ('NEW', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Area Assignments (for Coordinators)
CREATE TABLE user_area_assignments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    area_id INTEGER REFERENCES areas(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, area_id)
);

-- Create Indexes for Performance
CREATE INDEX idx_issues_status ON issues(status);
CREATE INDEX idx_issues_category ON issues(category_id);
CREATE INDEX idx_issues_area ON issues(area_id);
CREATE INDEX idx_issues_user ON issues(user_id);
CREATE INDEX idx_issues_created_at ON issues(created_at);
CREATE INDEX idx_issue_images_issue ON issue_images(issue_id);
CREATE INDEX idx_issue_updates_issue ON issue_updates(issue_id);
CREATE INDEX idx_user_area_assignments_user ON user_area_assignments(user_id);
CREATE INDEX idx_user_area_assignments_area ON user_area_assignments(area_id);

-- Create Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply Updated At Triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_areas_updated_at BEFORE UPDATE ON areas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_issues_updated_at BEFORE UPDATE ON issues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert Default Admin User (password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO users (email, password_hash, role, full_name, phone) VALUES
('admin@civic.local', '$2a$10$XqZ8J7xKjYZ9YqZ8J7xKjO9YqZ8J7xKjYZ9YqZ8J7xKjYZ9YqZ8J7', 'ADMIN', 'System Administrator', '0800000000');

-- Insert Sample Categories
INSERT INTO categories (name_th, name_en, description, icon) VALUES
('ถนนและโครงสร้างพื้นฐาน', 'Roads and Infrastructure', 'ปัญหาเกี่ยวกับถนน สะพาน ทางเท้า', 'road'),
('น้ำและสุขาภิบาล', 'Water and Sanitation', 'ปัญหาน้ำประปา ระบบระบายน้ำ', 'water'),
('ขยะและสิ่งแวดล้อม', 'Waste and Environment', 'ปัญหาขยะ มลพิษ สิ่งแวดล้อม', 'trash'),
('ไฟฟ้าและแสงสว่าง', 'Electricity and Lighting', 'ปัญหาไฟฟ้า ไฟส่องสว่างสาธารณะ', 'lightbulb'),
('ความปลอดภัย', 'Safety and Security', 'ปัญหาความปลอดภัยในชุมชน', 'shield'),
('สาธารณสุข', 'Public Health', 'ปัญหาสาธารณสุข โรคระบาด', 'health'),
('การศึกษา', 'Education', 'ปัญหาโรงเรียน การศึกษา', 'education'),
('อื่นๆ', 'Others', 'ปัญหาอื่นๆ ที่ไม่อยู่ในหมวดหมู่', 'other');

-- Insert Sample Areas
INSERT INTO areas (name_th, name_en, province, district, subdistrict, postal_code) VALUES
('เขตบางรัก', 'Bang Rak District', 'กรุงเทพมหานคร', 'บางรัก', 'สีลม', '10500'),
('เขตปทุมวัน', 'Pathum Wan District', 'กรุงเทพมหานคร', 'ปทุมวัน', 'ลุมพินี', '10330'),
('เขตดุสิต', 'Dusit District', 'กรุงเทพมหานคร', 'ดุสิต', 'ดุสิต', '10300'),
('อำเภอเมือง', 'Mueang District', 'เชียงใหม่', 'เมือง', 'ศรีภูมิ', '50200'),
('อำเภอหาดใหญ่', 'Hat Yai District', 'สงขลา', 'หาดใหญ่', 'หาดใหญ่', '90110');
