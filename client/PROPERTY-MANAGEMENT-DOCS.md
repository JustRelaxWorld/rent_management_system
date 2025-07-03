# Property Management Workflow Documentation

This document outlines the property management workflow for landlords in the Rent Management System, focusing on the `/properties/add` and `/properties/edit/:id` pages.

## Overview

The property management workflow allows landlords to:
1. Create new property listings with images
2. Edit existing property listings
3. View all their properties
4. Ensure landlords can only manage their own properties

## Components

### 1. AddProperty.tsx

A modern, responsive form for creating new property listings with the following features:

- **Form Fields**:
  - Property Name (required)
  - Property Type (apartment, house, condo, etc.)
  - Description
  - Location (Address and City)
  - Property Details (Bedrooms, Bathrooms, Size)
  - Rent Amount (in Ksh)
  - Availability Status
  - Amenities (optional tags)

- **Image Upload**:
  - Preview before submission
  - Support for common image formats (JPEG, PNG)
  - Visual feedback during upload

- **Validation**:
  - Client-side validation for required fields
  - Proper error messages
  - Disabled submission when validation fails

- **User Experience**:
  - Loading states during submission
  - Success/error notifications
  - Redirect after successful creation

### 2. EditProperty.tsx

Similar to the AddProperty component but with these additional features:

- **Data Fetching**:
  - Loads existing property data
  - Pre-fills all form fields
  - Displays current property image

- **Access Control**:
  - Verifies the logged-in landlord owns the property
  - Shows "Access Denied" if unauthorized
  - Prevents editing of other landlords' properties

- **Image Management**:
  - Option to keep or replace existing image
  - Preview of new image before submission

## Backend Integration

### API Endpoints

The frontend components interact with these backend endpoints:

1. `GET /api/properties/:id` - Fetch property details (with access control)
2. `POST /api/properties` - Create new property with multipart/form-data for image upload
3. `PUT /api/properties/:id` - Update property with optional image replacement

### Access Control

Access control is implemented at multiple levels:

1. **Frontend**:
   - Checks user ID against property's landlord_id
   - Shows appropriate UI for unauthorized access

2. **Backend**:
   - Middleware verifies JWT token
   - Controller checks if the authenticated user is the property owner
   - Returns 403 Forbidden if unauthorized

### Image Handling

Images are handled using:

1. **Frontend**:
   - File input with preview functionality
   - FormData for multipart submission

2. **Backend**:
   - Multer middleware for file upload processing
   - Storage configuration for local file system
   - Database storage of image paths

## UI/UX Features

### Form Organization

- **Grouped Fields**: Related fields are grouped together with clear section titles
- **Visual Hierarchy**: Important fields are positioned prominently
- **Responsive Design**: Adapts to different screen sizes

### Feedback Mechanisms

- **Loading States**: Spinners and disabled buttons during API calls
- **Validation Feedback**: Inline error messages for invalid fields
- **Success Messages**: Clear indication of successful operations

### Accessibility

- **Keyboard Navigation**: All form elements are keyboard accessible
- **Screen Reader Support**: Proper labels and ARIA attributes
- **Focus Management**: Clear focus states for interactive elements

## Mobile Responsiveness

The forms are fully responsive:

- **Small Screens**: Single column layout with stacked fields
- **Medium Screens**: Two-column layout for related fields
- **Large Screens**: Two-column layout with sidebar for image upload

## Testing

Manual testing steps are provided in the `test-property-management.js` file, covering:

1. Creating new properties
2. Editing existing properties
3. Testing access control
4. Verifying image display in tenant applications

## Implementation Notes

1. **State Management**: React useState hooks for form state
2. **API Integration**: Axios for API calls
3. **Styling**: Tailwind CSS for responsive design
4. **Validation**: Custom validation logic with error state
5. **Image Preview**: FileReader API for client-side preview

## Security Considerations

1. **Access Control**: Ensures landlords can only manage their own properties
2. **Input Validation**: Prevents malicious input
3. **Image Validation**: Restricts file types and sizes
4. **CSRF Protection**: Included in API requests

## Future Improvements

1. **Multiple Image Upload**: Support for uploading multiple property images
2. **Image Gallery**: Carousel or grid view for multiple property images
3. **Drag-and-Drop**: Enhanced image upload experience
4. **Rich Text Editor**: For property descriptions
5. **Location Picker**: Map integration for selecting property location 