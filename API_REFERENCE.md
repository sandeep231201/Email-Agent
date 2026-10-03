# 📡 Email Agent - API Reference

## Base URL

- **Development:** `http://localhost:3001`
- **Production:** `https://api.yourdomain.com`

## Authentication

All API endpoints (except `/auth/register`, `/auth/login`, and `/health`) require JWT authentication.

### Headers

```
Authorization: Bearer <token>
Content-Type: application/json
```

### Example

```bash
curl -H "Authorization: Bearer eyJhbGc..." http://localhost:3001/api/emails
```

---

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (201)**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "createdAt": "2026-06-25T10:00:00Z"
  }
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response (200)**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

**Response (200)**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com",
    "emailProvider": "none",
    "isActive": true,
    "createdAt": "2026-06-25T10:00:00Z",
    "updatedAt": "2026-06-25T10:00:00Z"
  }
}
```

#### Update Profile
```http
PATCH /auth/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Smith"
}
```

**Response (200)**
```json
{
  "success": true,
  "message": "Profile updated",
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "John Smith",
    "email": "john@example.com"
  }
}
```

---

### Emails

#### Get All Emails
```http
GET /api/emails
Authorization: Bearer <token>
```

**Query Parameters**
- `limit` (optional): Number of emails to return (default: all)
- `skip` (optional): Number of emails to skip for pagination
- `category` (optional): Filter by category (urgent, work, personal, etc.)
- `read` (optional): Filter by read status (true/false)

**Response (200)**
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "id": "1",
      "from": "boss@company.com",
      "subject": "URGENT: Server is down",
      "body": "Our production server crashed...",
      "timestamp": "2026-06-25T09:45:00Z",
      "read": false
    },
    ...
  ]
}
```

#### Analyze Emails with AI
```http
POST /api/emails/analyze
Authorization: Bearer <token>
Content-Type: application/json

{
  "emailIds": ["1", "2", "3"]  // Optional - analyze specific emails or all
}
```

**Response (200 - Server-Sent Events Streaming)**
```
data: {"type":"chunk","text":"[\n  {\n"}
data: {"type":"chunk","text":"    \"id\": \"1\",\n"}
data: {"type":"chunk","text":"    \"category\": \"urgent\",\n"}
...
data: {"type":"done","result":[...]}
```

**Complete Analysis Result**
```json
[
  {
    "id": "1",
    "category": "urgent",
    "priority": "high",
    "summary": "Production server is down and causing revenue loss.",
    "flagged": true,
    "flagReason": "Critical infrastructure issue requiring immediate attention"
  },
  {
    "id": "2",
    "category": "newsletter",
    "priority": "low",
    "summary": "Weekly tech digest with industry updates.",
    "flagged": false,
    "flagReason": null
  }
]
```

**Categories:** urgent, work, personal, newsletter, security, admin, other  
**Priorities:** high, medium, low

#### Draft Reply
```http
POST /api/emails/draft-reply
Authorization: Bearer <token>
Content-Type: application/json

{
  "emailId": "1",
  "tone": "professional"  // professional, friendly, concise, formal
}
```

**Response (200 - Server-Sent Events Streaming)**
```
data: {"type":"chunk","text":"Thank you for the urgent notice. "}
data: {"type":"chunk","text":"I'm currently investigating the server issue..."}
...
data: {"type":"done"}
```

#### Ask Question About Email
```http
POST /api/emails/ask
Authorization: Bearer <token>
Content-Type: application/json

{
  "emailId": "1",
  "question": "What is the main issue described in this email?"
}
```

**Response (200 - Server-Sent Events Streaming)**
```
data: {"type":"chunk","text":"The main issue is that the production"}
data: {"type":"chunk","text":" server has crashed..."}
...
data: {"type":"done"}
```

---

## System Endpoints

#### Health Check
```http
GET /health
```

**Response (200)**
```json
{
  "status": "ok",
  "timestamp": "2026-06-25T10:30:00Z",
  "uptime": 3600.5
}
```

#### API Documentation
```http
GET /api/docs
```

**Response (200)**
```json
{
  "version": "1.0.0",
  "endpoints": {
    "auth": {...},
    "emails": {...}
  },
  "authentication": {
    "method": "JWT Bearer Token",
    "header": "Authorization: Bearer <token>"
  }
}
```

---

## Error Responses

### 400 Bad Request - Validation Error
```json
{
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "\"email\" must be a valid email"
    }
  ]
}
```

### 401 Unauthorized - Authentication Error
```json
{
  "error": "No authentication token, access denied"
}
```

or

```json
{
  "error": "Token is not valid"
}
```

### 404 Not Found
```json
{
  "error": "Email not found"
}
```

### 429 Too Many Requests - Rate Limited
```json
{
  "error": "Too many requests from this IP, please try again later."
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal Server Error"
}
```

---

## Rate Limiting

- **Limit:** 100 requests per 15 minutes
- **Header:** `RateLimit-Remaining: 99`
- **Status:** 429 when limit exceeded

---

## Pagination

For endpoints returning lists, use:

```http
GET /api/emails?skip=10&limit=20
```

- `skip`: Number of items to skip (default: 0)
- `limit`: Number of items to return (default: all)

---

## Streaming Responses

Some endpoints return Server-Sent Events (SSE) for streaming:

- `/api/emails/analyze`
- `/api/emails/draft-reply`
- `/api/emails/ask`

### Handling Streams in JavaScript

```javascript
const response = await fetch('/api/emails/analyze', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({})
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const text = decoder.decode(value);
  const lines = text.split('\n');
  
  lines.forEach(line => {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      if (data.type === 'chunk') {
        console.log(data.text); // Streamed text
      } else if (data.type === 'done') {
        console.log('Done', data.result); // Final result
      } else if (data.type === 'error') {
        console.error(data.message); // Error message
      }
    }
  });
}
```

### Handling Streams in Python

```python
import requests
import json

headers = {
    'Authorization': f'Bearer {token}',
    'Content-Type': 'application/json'
}

response = requests.post(
    'http://localhost:3001/api/emails/analyze',
    headers=headers,
    stream=True
)

for line in response.iter_lines():
    if line:
        if line.startswith(b'data: '):
            data = json.loads(line[6:])
            if data['type'] == 'chunk':
                print(data['text'], end='', flush=True)
            elif data['type'] == 'done':
                print('Done', data.get('result'))
            elif data['type'] == 'error':
                print('Error:', data['message'])
```

---

## HTTP Methods

- **GET** - Retrieve data
- **POST** - Create data / Perform action
- **PATCH** - Update data
- **DELETE** - Delete data (not yet implemented)

---

## Status Codes

- **200** - OK
- **201** - Created
- **400** - Bad Request
- **401** - Unauthorized
- **404** - Not Found
- **429** - Too Many Requests
- **500** - Internal Server Error

---

## Example Workflow

```javascript
// 1. Register or Login
const loginResponse = await fetch('http://localhost:3001/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

const { token } = await loginResponse.json();

// 2. Get Emails
const emailsResponse = await fetch('http://localhost:3001/api/emails', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const emails = await emailsResponse.json();

// 3. Analyze Emails
const analyzeResponse = await fetch(
  'http://localhost:3001/api/emails/analyze',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({})
  }
);

// Handle streaming response...

// 4. Draft Reply
const draftResponse = await fetch(
  'http://localhost:3001/api/emails/draft-reply',
  {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      emailId: '1',
      tone: 'professional'
    })
  }
);

// Handle streaming response...
```

---

## Versioning

Current API version: **1.0.0**

Future versions will be available at `/api/v2/`, `/api/v3/`, etc.

---

## Support

For API issues:
1. Check the examples above
2. Review error messages and status codes
3. Check logs at `/logs`
4. Visit `/health` endpoint to verify service status

---

**API Documentation Last Updated:** 2026-06-25  
**API Status:** Production Ready ✅
