# Third-Party API Documentation

## Overview

This API provides access to user statistics, analytics data, and content information for third-party applications. All endpoints require API key authentication and are subject to rate limiting.

## Base URL
```
http://localhost:3001/api/v1
```

## Authentication

All API requests require a valid API key. Include your API key in one of the following ways:

### Header (Recommended)
```
X-API-Key: your-api-key-here
```

### Query Parameter
```
GET /api/v1/users?api_key=your-api-key-here
```

## Rate Limiting

- **Limit**: 100 requests per minute per API key
- **Headers**: Rate limit information is included in response headers
- **429 Response**: When rate limit is exceeded

## API Keys

For development/testing, you can use these demo API keys:
- `demo-api-key-1`
- `demo-api-key-2`

> **Note**: In production, contact the administrator to obtain your unique API key.

## Endpoints

### 1. Get User Statistics

**Endpoint**: `GET /api/v1/users`

**Description**: Retrieve comprehensive user statistics including total users, active users, role breakdown, and engagement metrics.

**Query Parameters**:
- `role` (optional): Filter by user role (`teenager`, `worker`, `admin`)
- `active` (optional): Set to `true` to get only active users
- `limit` (optional): Limit the number of results

**Example Request**:
```bash
curl -H "X-API-Key: demo-api-key-1" \
     "http://localhost:3001/api/v1/users?role=teenager&active=true"
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "total": 1247,
    "active": 892,
    "breakdown": {
      "teenager": 456,
      "worker": 623,
      "admin": 168
    },
    "registrations": {
      "today": 23,
      "thisWeek": 156,
      "thisMonth": 678
    },
    "engagement": {
      "averageSessionTime": 12.5,
      "dailyActiveUsers": 234,
      "weeklyActiveUsers": 567,
      "monthlyActiveUsers": 892
    },
    "lastUpdated": "2024-01-20T10:30:00.000Z"
  },
  "meta": {
    "endpoint": "/api/v1/users",
    "timestamp": "2024-01-20T10:30:00.000Z",
    "version": "1.0.0"
  }
}
```

### 2. Get Analytics Data

**Endpoint**: `GET /api/v1/analytics`

**Description**: Retrieve website analytics including page views, traffic sources, content performance, and engagement metrics.

**Query Parameters**:
- `timeframe` (optional): Time period for analytics (`24h`, `7d`, `30d`, `90d`). Default: `24h`
- `metric` (optional): Specific metric to retrieve (`overview`, `traffic`, `content`, `engagement`)

**Example Request**:
```bash
curl -H "X-API-Key: demo-api-key-1" \
     "http://localhost:3001/api/v1/analytics?timeframe=7d&metric=overview"
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "overview": {
      "pageViews": 15420,
      "uniqueVisitors": 3240,
      "bounceRate": 0.25,
      "averageSessionDuration": 745,
      "conversionRate": 0.034
    },
    "traffic": {
      "direct": 0.35,
      "organic": 0.42,
      "social": 0.15,
      "referral": 0.08
    },
    "content": {
      "mostViewed": [
        { "page": "/teenager-centre", "views": 2340 },
        { "page": "/worker-centre", "views": 1890 }
      ],
      "topRated": [
        { "content": "Managing Stress", "rating": 4.8, "votes": 156 }
      ]
    },
    "engagement": {
      "comments": 456,
      "likes": 1234,
      "shares": 89,
      "downloads": 234
    },
    "timeframe": "7d",
    "lastUpdated": "2024-01-20T10:30:00.000Z"
  },
  "meta": {
    "endpoint": "/api/v1/analytics",
    "timestamp": "2024-01-20T10:30:00.000Z",
    "version": "1.0.0"
  }
}
```

### 3. Get Content Data

**Endpoint**: `GET /api/v1/content`

**Description**: Retrieve content information including articles, courses, ratings, and metadata.

**Query Parameters**:
- `type` (optional): Content type (`article`, `course`, `guide`)
- `category` (optional): Content category (`mental-health`, `teenager`, `lifestyle`, etc.)
- `limit` (optional): Number of items to return (default: 10, max: 100)

**Example Request**:
```bash
curl -H "X-API-Key: demo-api-key-1" \
     "http://localhost:3001/api/v1/content?type=article&category=mental-health&limit=5"
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "content": [
      {
        "id": 1,
        "title": "Managing Workplace Stress",
        "category": "mental-health",
        "type": "article",
        "views": 2340,
        "rating": 4.8,
        "publishDate": "2024-01-15T10:00:00Z",
        "author": "Dr. Sarah Johnson"
      }
    ],
    "total": 1,
    "filters": {
      "type": "article",
      "category": "mental-health",
      "limit": 5
    }
  },
  "meta": {
    "endpoint": "/api/v1/content",
    "timestamp": "2024-01-20T10:30:00.000Z",
    "version": "1.0.0"
  }
}
```

### 4. API Health Check

**Endpoint**: `GET /api/v1/health`

**Description**: Check the health status of the API and get information about available endpoints.

**Example Request**:
```bash
curl -H "X-API-Key: demo-api-key-1" \
     "http://localhost:3001/api/v1/health"
```

**Example Response**:
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "version": "1.0.0",
  "endpoints": [
    "GET /api/v1/users",
    "GET /api/v1/analytics",
    "GET /api/v1/content",
    "GET /api/v1/health"
  ]
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Valid API key required. Include it in X-API-Key header or api_key query parameter."
}
```

### 429 Rate Limit Exceeded
```json
{
  "error": "Rate limit exceeded",
  "message": "Maximum 100 requests per minute allowed",
  "resetTime": "2024-01-20T10:31:00.000Z"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "Detailed error message"
}
```

## Usage Examples

### JavaScript/Node.js
```javascript
const axios = require('axios');

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
  headers: {
    'X-API-Key': 'demo-api-key-1'
  }
});

// Get user statistics
const users = await apiClient.get('/users');
console.log(users.data);

// Get analytics for the last 7 days
const analytics = await apiClient.get('/analytics?timeframe=7d');
console.log(analytics.data);
```

### Python
```python
import requests

headers = {'X-API-Key': 'demo-api-key-1'}
base_url = 'http://localhost:3001/api/v1'

# Get user statistics
response = requests.get(f'{base_url}/users', headers=headers)
users = response.json()
print(users)

# Get content data
response = requests.get(f'{base_url}/content?type=article', headers=headers)
content = response.json()
print(content)
```

### cURL
```bash
# Get user statistics
curl -H "X-API-Key: demo-api-key-1" \
     "http://localhost:3001/api/v1/users"

# Get analytics data
curl -H "X-API-Key: demo-api-key-1" \
     "http://localhost:3001/api/v1/analytics?timeframe=30d"

# Get content by category
curl -H "X-API-Key: demo-api-key-1" \
     "http://localhost:3001/api/v1/content?category=teenager&limit=20"
```

## Support

For API support, questions, or to request additional endpoints, please contact the development team.

## Changelog

### Version 1.0.0
- Initial API release
- User statistics endpoint
- Analytics data endpoint
- Content data endpoint
- API key authentication
- Rate limiting implementation