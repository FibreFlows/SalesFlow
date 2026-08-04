# SalesFlow API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication

#### Register
- **POST** `/auth/register`
- **Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```
- **Response:** `{ "message": "User registered successfully" }`

#### Login
- **POST** `/auth/login`
- **Body:**
```json
{
  "username": "username",
  "password": "password123"
}
```
- **Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "username": "username",
    "email": "user@example.com"
  }
}
```

### User

#### Get Profile
- **GET** `/user/profile` (Protected)
- **Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "created_at": "2024-01-01T12:00:00Z"
}
```

### Deals

#### Get All Deals
- **GET** `/deals` (Protected)
- **Response:** Array of deals

#### Create Deal
- **POST** `/deals` (Protected)
- **Body:**
```json
{
  "title": "Enterprise Deal",
  "stage": "Negotiation",
  "value": 50000,
  "customer_name": "Acme Corp"
}
```

#### Update Deal
- **PUT** `/deals/:id` (Protected)
- **Body:** Same as Create Deal

#### Delete Deal
- **DELETE** `/deals/:id` (Protected)

### Activities

#### Log Activity
- **POST** `/activities` (Protected)
- **Body:**
```json
{
  "deal_id": 1,
  "type": "call",
  "description": "Initial discovery call"
}
```

#### Get Activities
- **GET** `/activities/:deal_id` (Protected)
- **Response:** Array of activities

## Error Responses

```json
{
  "error": "Error message"
}
```

Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `500` - Server Error
