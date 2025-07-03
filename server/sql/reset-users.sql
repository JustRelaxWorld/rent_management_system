-- User Data Reset SQL Script
-- WARNING: This script deletes ALL user-related data from the database!
-- ONLY use in development environments, NEVER in production!

-- Disable foreign key checks temporarily to allow cascading deletes
SET FOREIGN_KEY_CHECKS = 0;

-- Delete data from all user-related tables in the correct order
-- Notifications
DELETE FROM notifications;
SELECT 'Deleted all notifications' AS 'Status';

-- Payments
DELETE FROM payments;
SELECT 'Deleted all payments' AS 'Status';

-- Invoices
DELETE FROM invoices;
SELECT 'Deleted all invoices' AS 'Status';

-- Maintenance comments (if exists)
-- Uncomment if your database has this table
-- DELETE FROM maintenance_comments;
-- SELECT 'Deleted all maintenance comments' AS 'Status';

-- Maintenance requests
DELETE FROM maintenance_requests;
SELECT 'Deleted all maintenance requests' AS 'Status';

-- Rental applications
DELETE FROM rental_applications;
SELECT 'Deleted all rental applications' AS 'Status';

-- Properties
DELETE FROM properties;
SELECT 'Deleted all properties' AS 'Status';

-- Tenant details
DELETE FROM tenant_details;
SELECT 'Deleted all tenant details' AS 'Status';

-- Landlord details
DELETE FROM landlord_details;
SELECT 'Deleted all landlord details' AS 'Status';

-- Users (main table we're resetting)
DELETE FROM users;
SELECT 'Deleted all users' AS 'Status';

-- Reset auto-increment counters
ALTER TABLE users AUTO_INCREMENT = 1;
ALTER TABLE landlord_details AUTO_INCREMENT = 1;
ALTER TABLE tenant_details AUTO_INCREMENT = 1;
ALTER TABLE properties AUTO_INCREMENT = 1;
ALTER TABLE rental_applications AUTO_INCREMENT = 1;
ALTER TABLE maintenance_requests AUTO_INCREMENT = 1;
ALTER TABLE invoices AUTO_INCREMENT = 1;
ALTER TABLE payments AUTO_INCREMENT = 1;
ALTER TABLE notifications AUTO_INCREMENT = 1;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

SELECT 'User data reset complete!' AS 'Status';

-- Optional: Create default admin user
-- Uncomment the lines below to create a default admin user
/*
INSERT INTO users (name, email, password, role, phone)
VALUES (
    'Admin User', 
    'admin@example.com', 
    -- This is the hashed version of 'admin123' - you may want to generate a fresh hash
    '$2a$10$yCz/z8JzQBRVN8kNy3Kh9eVQRTVXmHJxDQRFUTwYKJZ3VNxCTg9Vy', 
    'admin', 
    '1234567890'
);
SELECT 'Default admin user created' AS 'Status';

-- Create default landlord user
INSERT INTO users (name, email, password, role, phone)
VALUES (
    'Landlord User', 
    'landlord@example.com', 
    -- This is the hashed version of 'landlord123' - you may want to generate a fresh hash
    '$2a$10$yCz/z8JzQBRVN8kNy3Kh9eVQRTVXmHJxDQRFUTwYKJZ3VNxCTg9Vy', 
    'landlord', 
    '9876543210'
);

-- Get the last inserted ID
SET @landlord_id = LAST_INSERT_ID();

-- Create landlord details
INSERT INTO landlord_details (user_id, mpesa_number)
VALUES (@landlord_id, '9876543210');

SELECT 'Default landlord user created' AS 'Status';
*/ 