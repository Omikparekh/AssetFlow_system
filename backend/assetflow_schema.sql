-- ==========================================
-- ASSETFLOW DATABASE SCHEMA
-- Complete PostgreSQL Schema with 20+ Tables
-- ==========================================

-- Create Database Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ==========================================
-- ENUMS & TYPES
-- ==========================================

CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
CREATE TYPE asset_status AS ENUM ('AVAILABLE', 'ALLOCATED', 'RESERVED', 'UNDER_MAINTENANCE', 'LOST', 'RETIRED', 'DISPOSED');
CREATE TYPE allocation_status AS ENUM ('PENDING', 'ACTIVE', 'RETURNED', 'OVERDUE');
CREATE TYPE request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');
CREATE TYPE booking_status AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');
CREATE TYPE maintenance_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
CREATE TYPE maintenance_priority AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE audit_status AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CLOSED');
CREATE TYPE audit_item_condition AS ENUM ('VERIFIED', 'MISSING', 'DAMAGED');
CREATE TYPE issue_type AS ENUM ('MISSING_ASSET', 'DAMAGED_ASSET', 'LOCATION_DISCREPANCY', 'UNAUTHORIZED_HOLDER');
CREATE TYPE depreciation_type AS ENUM ('STRAIGHT_LINE', 'DOUBLE_DECLINING', 'SUM_OF_YEARS');
CREATE TYPE asset_condition AS ENUM ('NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED');

-- ==========================================
-- 1. AUTHENTICATION & ORGANIZATION
-- ==========================================

-- Table 1: Roles
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_roles_name ON roles(name);

-- Table 2: Permissions
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_permissions_name ON permissions(name);

-- Table 3: Role Permissions (Many-to-Many)
CREATE TABLE role_permissions (
  role_id UUID NOT NULL,
  permission_id UUID NOT NULL,
  PRIMARY KEY (role_id, permission_id),
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);

-- Table 4: Departments
CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  department_code VARCHAR(20) UNIQUE NOT NULL,
  description TEXT,
  status user_status DEFAULT 'ACTIVE',
  parent_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
  head_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_departments_code ON departments(department_code);
CREATE INDEX idx_departments_parent_id ON departments(parent_id);
CREATE INDEX idx_departments_head_id ON departments(head_id);

-- Table 5: Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  employee_code VARCHAR(20) UNIQUE NOT NULL,
  phone VARCHAR(20),
  profile_image VARCHAR(500),
  status user_status DEFAULT 'ACTIVE',
  last_login TIMESTAMP,
  mfa_ready BOOLEAN DEFAULT FALSE,
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
  department_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_employee_code ON users(employee_code);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_department_id ON users(department_id);

-- Add foreign key for department head after users table is created
ALTER TABLE departments 
ADD CONSTRAINT fk_departments_head_id 
FOREIGN KEY (head_id) REFERENCES users(id) ON DELETE SET NULL;

-- Table 6: Refresh Tokens
CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token VARCHAR(500) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  is_revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);

-- ==========================================
-- 2. ASSET MANAGEMENT
-- ==========================================

-- Table 7: Asset Categories
CREATE TABLE asset_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  default_warranty INT,
  depreciation_type depreciation_type DEFAULT 'STRAIGHT_LINE',
  metadata_schema JSONB,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_asset_categories_name ON asset_categories(name);

-- Table 8: Asset Brands
CREATE TABLE asset_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_asset_brands_name ON asset_brands(name);

-- Table 9: Asset Models
CREATE TABLE asset_models (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  category_id UUID NOT NULL REFERENCES asset_categories(id) ON DELETE RESTRICT,
  brand_id UUID NOT NULL REFERENCES asset_brands(id) ON DELETE RESTRICT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP,
  UNIQUE(brand_id, name)
);

CREATE INDEX idx_asset_models_brand_id ON asset_models(brand_id);
CREATE INDEX idx_asset_models_category_id ON asset_models(category_id);

-- Table 10: Assets
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_tag VARCHAR(50) UNIQUE NOT NULL,
  qr_code VARCHAR(100) UNIQUE,
  barcode VARCHAR(100) UNIQUE,
  serial_number VARCHAR(100) UNIQUE,
  purchase_date DATE,
  purchase_cost DECIMAL(12, 2),
  warranty_expiry DATE,
  current_status asset_status DEFAULT 'AVAILABLE',
  location VARCHAR(255),
  condition asset_condition,
  description TEXT,
  metadata JSONB,
  category_id UUID NOT NULL REFERENCES asset_categories(id) ON DELETE RESTRICT,
  brand_id UUID NOT NULL REFERENCES asset_brands(id) ON DELETE RESTRICT,
  model_id UUID NOT NULL REFERENCES asset_models(id) ON DELETE RESTRICT,
  department_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_assets_tag ON assets(asset_tag);
CREATE INDEX idx_assets_serial_number ON assets(serial_number);
CREATE INDEX idx_assets_status ON assets(current_status);
CREATE INDEX idx_assets_department_id ON assets(department_id);
CREATE INDEX idx_assets_category_id ON assets(category_id);

-- Table 11: Asset Images
CREATE TABLE asset_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_asset_images_asset_id ON asset_images(asset_id);

-- Table 12: Asset Documents
CREATE TABLE asset_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  doc_url VARCHAR(500) NOT NULL,
  doc_name VARCHAR(255) NOT NULL,
  doc_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_asset_documents_asset_id ON asset_documents(asset_id);

-- Table 13: Asset Status History
CREATE TABLE asset_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  old_status asset_status,
  new_status asset_status NOT NULL,
  changed_by UUID NOT NULL,
  reason TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_asset_status_history_asset_id ON asset_status_history(asset_id);
CREATE INDEX idx_asset_status_history_timestamp ON asset_status_history(timestamp);

-- ==========================================
-- 3. ALLOCATION & TRANSFERS
-- ==========================================

-- Table 14: Asset Allocations
CREATE TABLE asset_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  employee_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  department_id UUID REFERENCES departments(id) ON DELETE RESTRICT,
  allocated_by UUID NOT NULL,
  allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expected_return TIMESTAMP,
  actual_return TIMESTAMP,
  return_condition asset_condition,
  notes TEXT,
  status allocation_status DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_allocations_asset_id ON asset_allocations(asset_id);
CREATE INDEX idx_allocations_employee_id ON asset_allocations(employee_id);
CREATE INDEX idx_allocations_department_id ON asset_allocations(department_id);
CREATE INDEX idx_allocations_status ON asset_allocations(status);

-- Table 15: Transfer Requests
CREATE TABLE transfer_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  from_dept_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  to_dept_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
  requested_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reason TEXT,
  status request_status DEFAULT 'PENDING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transfer_requests_asset_id ON transfer_requests(asset_id);
CREATE INDEX idx_transfer_requests_from_dept ON transfer_requests(from_dept_id);
CREATE INDEX idx_transfer_requests_to_dept ON transfer_requests(to_dept_id);

-- Table 16: Return Requests
CREATE TABLE return_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  employee_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  requested_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reason TEXT,
  status request_status DEFAULT 'PENDING',
  expected_return_date TIMESTAMP,
  actual_return_date TIMESTAMP,
  return_condition asset_condition,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_return_requests_asset_id ON return_requests(asset_id);
CREATE INDEX idx_return_requests_employee_id ON return_requests(employee_id);

-- ==========================================
-- 4. BOOKINGS & RESOURCES
-- ==========================================

-- Table 17: Bookable Resources
CREATE TABLE bookable_resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID UNIQUE REFERENCES assets(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by UUID,
  updated_by UUID,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_bookable_resources_name ON bookable_resources(name);

-- Table 18: Bookings
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_id UUID NOT NULL REFERENCES bookable_resources(id) ON DELETE RESTRICT,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  start_date_time TIMESTAMP NOT NULL,
  end_date_time TIMESTAMP NOT NULL,
  purpose TEXT,
  status booking_status DEFAULT 'UPCOMING',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_bookings_resource_id ON bookings(resource_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_datetime ON bookings(start_date_time, end_date_time);
CREATE INDEX idx_bookings_resource_datetime ON bookings(resource_id, start_date_time, end_date_time);

-- ==========================================
-- 5. MAINTENANCE
-- ==========================================

-- Table 19: Technicians
CREATE TABLE technicians (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  specialty VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 20: Vendors
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  contact_email VARCHAR(100),
  contact_phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 21: Maintenance Requests
CREATE TABLE maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  requested_by_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  priority maintenance_priority DEFAULT 'MEDIUM',
  description TEXT NOT NULL,
  status maintenance_status DEFAULT 'PENDING',
  approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  technician_id UUID REFERENCES technicians(id) ON DELETE SET NULL,
  vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
  estimated_cost DECIMAL(12, 2),
  actual_cost DECIMAL(12, 2),
  timeline JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_maintenance_requests_asset_id ON maintenance_requests(asset_id);
CREATE INDEX idx_maintenance_requests_status ON maintenance_requests(status);
CREATE INDEX idx_maintenance_requests_priority ON maintenance_requests(priority);

-- Table 22: Maintenance Logs
CREATE TABLE maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  added_by UUID NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_maintenance_logs_request_id ON maintenance_logs(request_id);

-- ==========================================
-- 6. AUDITS
-- ==========================================

-- Table 23: Audit Cycles
CREATE TABLE audit_cycles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  auditor_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  status audit_status DEFAULT 'DRAFT',
  lock_flag BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_cycles_status ON audit_cycles(status);
CREATE INDEX idx_audit_cycles_department_id ON audit_cycles(department_id);
CREATE INDEX idx_audit_cycles_auditor_id ON audit_cycles(auditor_id);

-- Table 24: Audit Items
CREATE TABLE audit_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_cycle_id UUID NOT NULL REFERENCES audit_cycles(id) ON DELETE RESTRICT,
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  expected_location VARCHAR(255),
  actual_location VARCHAR(255),
  condition audit_item_condition,
  verified BOOLEAN DEFAULT FALSE,
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verification_time TIMESTAMP
);

CREATE INDEX idx_audit_items_audit_cycle_id ON audit_items(audit_cycle_id);
CREATE INDEX idx_audit_items_asset_id ON audit_items(asset_id);

-- Table 25: Discrepancy Reports
CREATE TABLE discrepancy_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id UUID NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  issue_type issue_type NOT NULL,
  description TEXT,
  resolved BOOLEAN DEFAULT FALSE,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_discrepancy_reports_asset_id ON discrepancy_reports(asset_id);
CREATE INDEX idx_discrepancy_reports_resolved ON discrepancy_reports(resolved);

-- ==========================================
-- 7. SYSTEM TRACKING
-- ==========================================

-- Table 26: Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(50),
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);

-- Table 27: Notification Preferences
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_on_allocation BOOLEAN DEFAULT TRUE,
  email_on_transfer BOOLEAN DEFAULT TRUE,
  email_on_maintenance BOOLEAN DEFAULT TRUE,
  email_on_audit BOOLEAN DEFAULT TRUE,
  sms_on_urgent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Table 28: Activity Logs
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  role VARCHAR(50),
  module VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  before_json JSONB,
  after_json JSONB,
  ip_address VARCHAR(45),
  user_agent TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity, entity_id);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(timestamp);
CREATE INDEX idx_activity_logs_module ON activity_logs(module);

-- Table 29: System Settings
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key VARCHAR(100) UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_system_settings_key ON system_settings(setting_key);

-- ==========================================
-- CONSTRAINTS & TRIGGERS
-- ==========================================

-- Trigger: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_refresh_tokens_updated_at BEFORE UPDATE ON refresh_tokens
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_categories_updated_at BEFORE UPDATE ON asset_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_brands_updated_at BEFORE UPDATE ON asset_brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_models_updated_at BEFORE UPDATE ON asset_models
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assets_updated_at BEFORE UPDATE ON assets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_images_updated_at BEFORE UPDATE ON asset_images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_documents_updated_at BEFORE UPDATE ON asset_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_asset_allocations_updated_at BEFORE UPDATE ON asset_allocations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transfer_requests_updated_at BEFORE UPDATE ON transfer_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_return_requests_updated_at BEFORE UPDATE ON return_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookable_resources_updated_at BEFORE UPDATE ON bookable_resources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON maintenance_requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_audit_cycles_updated_at BEFORE UPDATE ON audit_cycles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discrepancy_reports_updated_at BEFORE UPDATE ON discrepancy_reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notification_preferences_updated_at BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- SEED DATA (OPTIONAL)
-- ==========================================

-- Insert Default Roles
INSERT INTO roles (name, description) VALUES
  ('ADMIN', 'System Administrator - Full system access'),
  ('ASSET_MANAGER', 'Asset Manager - Manages asset lifecycle'),
  ('DEPARTMENT_HEAD', 'Department Head - Oversees department assets'),
  ('EMPLOYEE', 'Standard Employee - Can use allocated assets')
ON CONFLICT (name) DO NOTHING;

-- Insert Default Permissions
INSERT INTO permissions (name, description) VALUES
  ('CREATE_ASSET', 'Permission to create new assets'),
  ('EDIT_ASSET', 'Permission to edit asset details'),
  ('DELETE_ASSET', 'Permission to delete assets'),
  ('ALLOCATE_ASSET', 'Permission to allocate assets'),
  ('APPROVE_TRANSFER', 'Permission to approve asset transfers'),
  ('CREATE_AUDIT', 'Permission to create audit cycles'),
  ('VIEW_REPORTS', 'Permission to view system reports'),
  ('MANAGE_USERS', 'Permission to manage user accounts'),
  ('MANAGE_DEPARTMENTS', 'Permission to manage departments'),
  ('BOOK_RESOURCE', 'Permission to book shared resources')
ON CONFLICT (name) DO NOTHING;

-- Link Admin Role with All Permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p WHERE r.name = 'ADMIN'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Insert Sample Department
INSERT INTO departments (name, department_code, description) VALUES
  ('Headquarters', 'HQ', 'Main office headquarters')
ON CONFLICT (department_code) DO NOTHING;

-- ==========================================
-- DATABASE SCHEMA SUMMARY
-- ==========================================
/*
Total Tables: 29

AUTHENTICATION & ORGANIZATION (6 tables):
  1. roles
  2. permissions
  3. role_permissions
  4. departments
  5. users
  6. refresh_tokens

ASSET MANAGEMENT (7 tables):
  7. asset_categories
  8. asset_brands
  9. asset_models
  10. assets
  11. asset_images
  12. asset_documents
  13. asset_status_history

ALLOCATION & TRANSFERS (3 tables):
  14. asset_allocations
  15. transfer_requests
  16. return_requests

BOOKINGS & RESOURCES (2 tables):
  17. bookable_resources
  18. bookings

MAINTENANCE (4 tables):
  19. technicians
  20. vendors
  21. maintenance_requests
  22. maintenance_logs

AUDITS (3 tables):
  23. audit_cycles
  24. audit_items
  25. discrepancy_reports

SYSTEM TRACKING (4 tables):
  26. notifications
  27. notification_preferences
  28. activity_logs
  29. system_settings
*/

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- List all tables
-- SELECT table_name FROM information_schema.tables WHERE table_schema='public';

-- Count total tables
-- SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public';

-- List all indexes
-- SELECT schemaname, tablename, indexname FROM pg_indexes WHERE schemaname='public';

-- Check table sizes
-- SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
-- FROM pg_tables WHERE schemaname='public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
