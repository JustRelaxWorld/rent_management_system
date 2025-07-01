# User Data Reset Script

This document explains how to use the reset scripts to clear all user-related data from the database and reset auto-increment counters. This is useful for development and testing purposes when you want to start with a clean slate.

## ⚠️ WARNING

**These scripts delete ALL user data from the database!** They should ONLY be used in development environments, never in production.

## What These Scripts Do

The scripts perform the following operations:

1. Delete all data from the following tables (in this order):
   - `notifications`
   - `payments`
   - `invoices`
   - `maintenance_comments` (if exists)
   - `maintenance_requests`
   - `rental_applications`
   - `properties`
   - `tenant_details`
   - `landlord_details`
   - `users`

2. Reset the auto-increment counters for all these tables back to 1

3. Optionally create default admin and landlord accounts for testing

## Usage Options

### Option 1: Node.js Script

#### Basic Reset (Delete All User Data)

```bash
# Set NODE_ENV to development for safety
NODE_ENV=development node server/reset-users.js
```

#### Reset and Create Default Users

```bash
# Reset and create default admin and landlord accounts
NODE_ENV=development node server/reset-users.js --seed-admin
```

### Option 2: SQL Script

If you prefer to run the reset directly in your database management tool (like MySQL Workbench, phpMyAdmin, etc.):

1. Open your database management tool
2. Connect to your database
3. Open the SQL script file: `server/sql/reset-users.sql`
4. Execute the script

Note: The SQL script has the user creation section commented out by default. Uncomment those lines if you want to create default users.

## Default Users

When using the Node.js script with `--seed-admin` flag or uncommenting the relevant section in the SQL script, these default users are created:

### Admin User
- **Email:** admin@example.com
- **Password:** admin123
- **Role:** admin

### Landlord User
- **Email:** landlord@example.com
- **Password:** landlord123
- **Role:** landlord

## Safety Features

The scripts include the following safety features:

1. **Environment Check** (Node.js script): Only runs if `NODE_ENV` is not set to "production"
2. **Transaction Support**: All operations are wrapped in a transaction for atomicity
3. **Error Handling**: Rolls back the transaction if any operation fails
4. **Foreign Key Handling**: Temporarily disables foreign key checks to allow proper deletion order

## Database Tables Affected

These scripts affect all user-related tables in the system. If you've added new tables that reference `users` or any of the other tables listed above, you may need to update the scripts to include those tables.

## Troubleshooting

If you encounter errors:

1. Make sure your database connection settings are correct
2. Ensure you have the necessary permissions to modify the database
3. Check if all tables exist as expected
4. Look for any custom foreign key constraints that might prevent deletion 