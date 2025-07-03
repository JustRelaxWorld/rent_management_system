# Rent Management System - Backend

This document outlines the backend implementation for the Rent Management System, focusing on the recent schema changes and API endpoints.

## Schema Changes

The following schema changes have been implemented:

### 1. Property Images
- Added `image_url` column to the `properties` table:
  ```sql
  ALTER TABLE properties ADD COLUMN image_url VARCHAR(255);
  ```
- This field stores the path to the main property image.
- The existing `images` JSON field continues to store an array of additional image paths.

### 2. Maintenance Request Images
- Added `image_url` column to the `maintenance_requests` table:
  ```sql
  ALTER TABLE maintenance_requests ADD COLUMN image_url VARCHAR(255);
  ```
- This field stores the path to the maintenance request image.

### 3. User Theme Preference
- Added `theme_preference` column to the `users` table:
  ```sql
  ALTER TABLE users ADD COLUMN theme_preference ENUM('light', 'dark') NULL;
  ```
- This field stores the user's preference for light or dark mode.

## API Endpoints

### Property Endpoints

#### Get All Properties
- `GET /api/properties`
- Returns all properties with their images.
- Response includes `image_url` for each property.

#### Get Single Property
- `GET /api/properties/:id`
- Returns a single property with its images.
- Response includes `image_url`.

#### Create Property with Image
- `POST /api/properties`
- Content-Type: multipart/form-data
- Accepts property data and an optional image file.
- Image is stored in the `uploads/properties` directory.

#### Update Property with Image
- `PUT /api/properties/:id`
- Content-Type: multipart/form-data
- Updates property data and optionally replaces the image.

#### Upload Additional Property Images
- `POST /api/properties/:id/images`
- Content-Type: multipart/form-data
- Allows uploading multiple images for a property.
- Images are stored in the `uploads/properties` directory.

### Maintenance Request Endpoints

#### Create Maintenance Request with Image
- `POST /api/maintenance`
- Content-Type: multipart/form-data
- Accepts maintenance request data and an optional image file.
- Image is stored in the `uploads/maintenance` directory.

#### Update Maintenance Request with Image
- `PUT /api/maintenance/:id`
- Content-Type: multipart/form-data
- Updates maintenance request data and optionally replaces the image.

#### Get Available Properties for Maintenance (Tenant Only)
- `GET /api/maintenance/available-properties`
- Returns only properties that the tenant is currently renting.
- Used to populate the property dropdown in the maintenance request form.

### Rental Application Endpoints

#### Get Tenant Applications
- `GET /api/applications/tenant`
- Returns applications submitted by the tenant.
- Response includes property details with `image_url`.

#### Get Landlord Applications
- `GET /api/applications/landlord`
- Returns applications received by the landlord.
- Response includes property details with `image_url`.

#### Get Application Details
- `GET /api/applications/:id`
- Returns detailed information about a specific application.
- Response includes property details with `image_url`.

### User Endpoints

#### Update Theme Preference
- `PUT /api/users/:id/theme`
- Updates the user's theme preference (light/dark).
- Request body: `{ "theme_preference": "light" | "dark" }`

#### Get User Profile
- `GET /api/users/:id`
- Returns user profile data including theme preference.

#### Login
- `POST /api/auth/login`
- Returns user data including theme preference.

#### Get Current User
- `GET /api/auth/me`
- Returns current user data including theme preference.

## File Upload Middleware

The system uses Multer middleware for handling file uploads:

- `uploadPropertyImageMiddleware`: Handles property image uploads.
- `uploadMaintenanceImageMiddleware`: Handles maintenance request image uploads.

Files are validated to ensure they are valid images (JPEG, PNG, JPG) and within size limits (2MB for images).

## Security Considerations

- All file uploads are sanitized to prevent malicious files.
- Access control ensures users can only access their own data.
- Tenants can only submit maintenance requests for properties they are renting.
- Landlords can only manage their own properties and related data.

## Environment Configuration

File storage paths can be configured through environment variables:
- `UPLOAD_PATH`: Base directory for uploads (default: './uploads')
- `MAX_FILE_SIZE`: Maximum file size in bytes (default: 2MB for images)

For detailed API examples, see [API-EXAMPLES.md](../API-EXAMPLES.md). 