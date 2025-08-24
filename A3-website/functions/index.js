const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const path = require('path')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')))

// Import route handlers
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/users')
const emailRoutes = require('./routes/email')
const analyticsRoutes = require('./routes/analytics')
const uploadRoutes = require('./routes/upload')
const apiRoutes = require('./routes/api')
const appointmentRoutes = require('./routes/appointments')

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/email', emailRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/v1', apiRoutes)
app.use('/api/appointments', appointmentRoutes)

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Website Cloud Functions API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      email: '/api/email',
      analytics: '/api/analytics',
      upload: '/api/upload',
      appointments: '/api/appointments'
    },
    publicApi: {
      version: 'v1',
      baseUrl: '/api/v1',
      authentication: 'API Key required (X-API-Key header or api_key query parameter)',
      rateLimit: '100 requests per minute',
      endpoints: {
        users: 'GET /api/v1/users - Get user statistics',
        analytics: 'GET /api/v1/analytics - Get analytics data',
        content: 'GET /api/v1/content - Get content data',
        health: 'GET /api/v1/health - API health check'
      }
    }
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)
  
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: 'Invalid JSON payload',
      message: 'Please check your request body format'
    })
  }
  
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      error: 'Payload too large',
      message: 'Request body exceeds size limit'
    })
  }
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    message: `The requested endpoint ${req.originalUrl} does not exist`
  })
})

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Cloud Functions API running on port ${PORT}`)
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
    console.log(`🔗 Health check: http://localhost:${PORT}/health`)
  })
}

module.exports = app