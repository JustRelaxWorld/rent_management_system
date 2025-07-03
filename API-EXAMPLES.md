# Rent Management System API Examples

This document provides examples for the new API endpoints related to property images, maintenance requests, and theme preferences.

## Authentication

All protected endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Property Images

### 1. Create Property with Image

**Endpoint:** `POST /api/properties`

**Headers:**
- Authorization: Bearer <your_jwt_token>
- Content-Type: multipart/form-data

**Form Data:**
- title: Luxury Apartment
- description: Beautiful apartment with great views
- address: 123 Main St
- city: New York
- type: apartment
- bedrooms: 2
- bathrooms: 1
- size: 1200
- rent_amount: 2500
- image: [file upload]

**cURL Example:**
```bash
curl -X POST "http://localhost:5000/api/properties" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -F "title=Luxury Apartment" \
  -F "description=Beautiful apartment with great views" \
  -F "address=123 Main St" \
  -F "city=New York" \
  -F "type=apartment" \
  -F "bedrooms=2" \
  -F "bathrooms=1" \
  -F "size=1200" \
  -F "rent_amount=2500" \
  -F "image=@/path/to/property-image.jpg"
```

### 2. Update Property with Image

**Endpoint:** `PUT /api/properties/:id`

**Headers:**
- Authorization: Bearer <your_jwt_token>
- Content-Type: multipart/form-data

**Form Data:**
- title: Updated Luxury Apartment
- description: Updated description
- image: [file upload]

**cURL Example:**
```bash
curl -X PUT "http://localhost:5000/api/properties/1" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -F "title=Updated Luxury Apartment" \
  -F "description=Updated description" \
  -F "image=@/path/to/new-property-image.jpg"
```

### 3. Upload Multiple Property Images

**Endpoint:** `POST /api/properties/:id/images`

**Headers:**
- Authorization: Bearer <your_jwt_token>
- Content-Type: multipart/form-data

**Form Data:**
- image: [file upload 1]
- image: [file upload 2]
- image: [file upload 3]

**cURL Example:**
```bash
curl -X POST "http://localhost:5000/api/properties/1/images" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -F "image=@/path/to/image1.jpg" \
  -F "image=@/path/to/image2.jpg" \
  -F "image=@/path/to/image3.jpg"
```

## Maintenance Requests

### 1. Create Maintenance Request with Image

**Endpoint:** `POST /api/maintenance`

**Headers:**
- Authorization: Bearer <your_jwt_token>
- Content-Type: multipart/form-data

**Form Data:**
- property_id: 1
- title: Leaking Faucet
- description: The bathroom faucet is leaking
- priority: medium
- type: plumbing
- image: [file upload]

**cURL Example:**
```bash
curl -X POST "http://localhost:5000/api/maintenance" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -F "property_id=1" \
  -F "title=Leaking Faucet" \
  -F "description=The bathroom faucet is leaking" \
  -F "priority=medium" \
  -F "type=plumbing" \
  -F "image=@/path/to/faucet-image.jpg"
```

### 2. Update Maintenance Request with Image

**Endpoint:** `PUT /api/maintenance/:id`

**Headers:**
- Authorization: Bearer <your_jwt_token>
- Content-Type: multipart/form-data

**Form Data:**
- description: Updated description with more details
- image: [file upload]

**cURL Example:**
```bash
curl -X PUT "http://localhost:5000/api/maintenance/1" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -F "description=Updated description with more details" \
  -F "image=@/path/to/new-image.jpg"
```

### 3. Get Available Properties for Maintenance (Tenant Only)

**Endpoint:** `GET /api/maintenance/available-properties`

**Headers:**
- Authorization: Bearer <your_jwt_token>

**cURL Example:**
```bash
curl -X GET "http://localhost:5000/api/maintenance/available-properties" \
  -H "Authorization: Bearer <your_jwt_token>"
```

## User Theme Preference

### 1. Update User Theme Preference

**Endpoint:** `PUT /api/users/:id/theme`

**Headers:**
- Authorization: Bearer <your_jwt_token>
- Content-Type: application/json

**Request Body:**
```json
{
  "theme_preference": "dark"
}
```

**cURL Example:**
```bash
curl -X PUT "http://localhost:5000/api/users/1/theme" \
  -H "Authorization: Bearer <your_jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"theme_preference": "dark"}'
```

## Response Formats

### Property Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "title": "Luxury Apartment",
    "description": "Beautiful apartment with great views",
    "address": "123 Main St",
    "city": "New York",
    "type": "apartment",
    "bedrooms": 2,
    "bathrooms": 1,
    "size": 1200,
    "rent_amount": 2500,
    "is_available": true,
    "landlord_id": 5,
    "created_at": "2023-04-23T14:25:00.000Z",
    "updated_at": "2023-04-23T14:25:00.000Z",
    "images": [
      "uploads/properties/1682259900000_image1.jpg",
      "uploads/properties/1682259900001_image2.jpg"
    ],
    "image_url": "uploads/properties/1682259900000_image1.jpg"
  }
}
```

### Maintenance Request Response

```json
{
  "success": true,
  "data": {
    "id": 1,
    "property_id": 1,
    "tenant_id": 3,
    "title": "Leaking Faucet",
    "description": "The bathroom faucet is leaking",
    "status": "pending",
    "priority": "medium",
    "type": "plumbing",
    "request_date": "2023-04-23T14:30:00.000Z",
    "completion_date": null,
    "created_at": "2023-04-23T14:30:00.000Z",
    "updated_at": "2023-04-23T14:30:00.000Z",
    "image_url": "uploads/maintenance/1682260200000_faucet-image.jpg",
    "property_name": "Luxury Apartment",
    "tenant_name": "John Doe"
  }
}
```

### Rental Application Response with Property Image

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "property_id": 1,
      "tenant_id": 3,
      "landlord_id": 5,
      "status": "pending",
      "move_in_date": "2023-05-01T00:00:00.000Z",
      "monthly_income": 5000,
      "employment_status": "full-time",
      "employer": "Tech Company",
      "additional_notes": "I have a good rental history",
      "created_at": "2023-04-23T14:35:00.000Z",
      "updated_at": "2023-04-23T14:35:00.000Z",
      "property_title": "Luxury Apartment",
      "property_address": "123 Main St",
      "property_city": "New York",
      "property_rent": 2500,
      "tenant_name": "John Doe",
      "tenant_email": "john@example.com",
      "tenant_phone": "123-456-7890",
      "property_image_url": "uploads/properties/1682259900000_image1.jpg"
    }
  ]
}
```

### User with Theme Preference

```json
{
  "success": true,
  "data": {
    "id": 3,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "123-456-7890",
    "avatar": "uploads/avatars/1682260500000_profile.jpg",
    "theme_preference": "dark",
    "role": "tenant"
  }
}
``` 