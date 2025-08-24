# Cloud Functions

This directory contains serverless functions for handling server-side logic including authentication, user management, email services, analytics, and file uploads.

## Setup

### 1. Install Dependencies

```bash
cd functions
npm install
```

### 2. Environment Configuration

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your actual configuration
```

### 3. Start Development Server

```bash
# Start in development mode with auto-reload
npm run dev

# Or start in production mode
npm start
```

## API Endpoints

### Authentication (`/api/auth`)

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify` - Verify JWT token
- `POST /api/auth/refresh` - Refresh JWT token

### User Management (`/api/users`)

- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (Admin only)
- `GET /api/users/stats/summary` - Get user statistics (Admin only)

### Email Services (`/api/email`)

- `POST /api/email/send` - Send single email
- `POST /api/email/send-bulk` - Send bulk emails
- `GET /api/email/templates` - Get available templates
- `GET /api/email/templates/:name` - Get specific template
- `POST /api/email/test` - Test email configuration

### Analytics (`/api/analytics`)

- `GET /api/analytics/dashboard` - Dashboard overview
- `GET /api/analytics/users` - User analytics
- `GET /api/analytics/system` - System analytics (Admin only)
- `GET /api/analytics/export` - Export data (JSON/CSV)
- `POST /api/analytics/events` - Track custom events

### File Upload (`/api/upload`)

- `POST /api/upload/single` - Upload single file
- `POST /api/upload/multiple` - Upload multiple files
- `POST /api/upload/avatar` - Upload user avatar
- `GET /api/upload/files/:filename` - Serve uploaded files
- `DELETE /api/upload/files/:filename` - Delete uploaded file
- `GET /api/upload/info` - Get upload configuration

## Authentication

Most endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## File Upload

### Supported File Types

- Images: JPEG, PNG, GIF, WebP
- Documents: PDF, CSV, JSON, TXT

### Features

- Automatic image resizing and optimization
- File size limits (10MB per file, 5 files max)
- Secure file serving with caching
- Avatar optimization (200x200px)

### Example Usage

```javascript
// Upload single file
const formData = new FormData()
formData.append('file', fileInput.files[0])
formData.append('resize', '800x600') // Optional
formData.append('quality', '80') // Optional

fetch('/api/upload/single', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
})
```

## Email Templates

Available email templates:

- `welcome` - Welcome new users
- `password-reset` - Password reset instructions
- `notification` - General notifications
- `newsletter` - Newsletter template

### Template Variables

Templates support variable replacement:

```javascript
{
  "{{name}}": "John Doe",
  "{{email}}": "john@example.com",
  "{{resetLink}}": "https://example.com/reset?token=abc123"
}
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error type",
  "message": "Detailed error message",
  "code": "ERROR_CODE" // Optional
}
```

## Rate Limiting

- Default: 100 requests per 15 minutes per IP
- Configurable via environment variables

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS protection
- Helmet security headers
- File type validation
- Admin-only endpoints protection

## Development

### Running Tests

```bash
npm test
```

### Code Structure

```
functions/
├── index.js          # Main server entry point
├── routes/           # API route handlers
│   ├── auth.js       # Authentication routes
│   ├── users.js      # User management routes
│   ├── email.js      # Email service routes
│   ├── analytics.js  # Analytics routes
│   └── upload.js     # File upload routes
├── uploads/          # File upload directory
├── package.json      # Dependencies and scripts
├── .env.example      # Environment variables template
└── README.md         # This file
```

## Deployment

### Local Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm start
```

### Environment Variables

Ensure all required environment variables are set in production:

- `JWT_SECRET` - Strong secret for JWT signing
- `EMAIL_*` - Email service configuration
- `CORS_ORIGIN` - Frontend URL for CORS
- `NODE_ENV=production`

## Monitoring

- Health check endpoint: `GET /health`
- Logs are written to console (configure log aggregation in production)
- Error tracking and monitoring recommended for production use

## Contributing

1. Follow existing code style and patterns
2. Add appropriate error handling
3. Include input validation
4. Update documentation for new endpoints
5. Add tests for new functionality