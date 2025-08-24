const express = require('express')
const router = express.Router()

// Middleware for API key authentication
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.api_key
  
  // In production, this should be stored securely and validated against a database
  const validApiKeys = [
    process.env.API_KEY_1 || 'demo-api-key-1',
    process.env.API_KEY_2 || 'demo-api-key-2'
  ]
  
  if (!apiKey || !validApiKeys.includes(apiKey)) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Valid API key required. Include it in X-API-Key header or api_key query parameter.'
    })
  }
  
  next()
}

// Rate limiting middleware (simple in-memory implementation)
const rateLimitMap = new Map()
const rateLimit = (maxRequests = 100, windowMs = 60000) => {
  return (req, res, next) => {
    const key = req.ip + (req.headers['x-api-key'] || req.query.api_key)
    const now = Date.now()
    
    if (!rateLimitMap.has(key)) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
      return next()
    }
    
    const limit = rateLimitMap.get(key)
    
    if (now > limit.resetTime) {
      limit.count = 1
      limit.resetTime = now + windowMs
      return next()
    }
    
    if (limit.count >= maxRequests) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Maximum ${maxRequests} requests per minute allowed`,
        resetTime: new Date(limit.resetTime).toISOString()
      })
    }
    
    limit.count++
    next()
  }
}

// Apply middleware to all API routes
router.use(authenticateApiKey)
router.use(rateLimit(100, 60000)) // 100 requests per minute

// GET /api/v1/users - Get user statistics
router.get('/users', (req, res) => {
  try {
    // Simulate user data (in production, this would come from a database)
    const userData = {
      total: 1247,
      active: 892,
      breakdown: {
        teenager: 456,
        worker: 623,
        admin: 168
      },
      registrations: {
        today: 23,
        thisWeek: 156,
        thisMonth: 678
      },
      engagement: {
        averageSessionTime: 12.5, // minutes
        dailyActiveUsers: 234,
        weeklyActiveUsers: 567,
        monthlyActiveUsers: 892
      },
      lastUpdated: new Date().toISOString()
    }
    
    // Support filtering by query parameters
    const { role, active, limit } = req.query
    
    let filteredData = { ...userData }
    
    if (role && userData.breakdown[role] !== undefined) {
      filteredData.filtered = {
        role: role,
        count: userData.breakdown[role]
      }
    }
    
    if (active === 'true') {
      filteredData.filtered = {
        ...filteredData.filtered,
        activeOnly: true,
        count: userData.active
      }
    }
    
    res.json({
      success: true,
      data: filteredData,
      meta: {
        endpoint: '/api/v1/users',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    })
  }
})

// GET /api/v1/analytics - Get analytics data
router.get('/analytics', (req, res) => {
  try {
    const { timeframe = '24h', metric } = req.query
    
    // Simulate analytics data
    const analyticsData = {
      overview: {
        pageViews: 15420,
        uniqueVisitors: 3240,
        bounceRate: 0.25,
        averageSessionDuration: 745, // seconds
        conversionRate: 0.034
      },
      traffic: {
        direct: 0.35,
        organic: 0.42,
        social: 0.15,
        referral: 0.08
      },
      content: {
        mostViewed: [
          { page: '/teenager-centre', views: 2340 },
          { page: '/worker-centre', views: 1890 },
          { page: '/about', views: 1560 },
          { page: '/home', views: 1234 }
        ],
        topRated: [
          { content: 'Managing Stress', rating: 4.8, votes: 156 },
          { content: 'Work-Life Balance', rating: 4.6, votes: 134 },
          { content: 'Mental Health Tips', rating: 4.5, votes: 189 }
        ]
      },
      engagement: {
        comments: 456,
        likes: 1234,
        shares: 89,
        downloads: 234
      },
      timeframe: timeframe,
      lastUpdated: new Date().toISOString()
    }
    
    // Filter by specific metric if requested
    if (metric && analyticsData[metric]) {
      return res.json({
        success: true,
        data: {
          [metric]: analyticsData[metric],
          timeframe: timeframe
        },
        meta: {
          endpoint: '/api/v1/analytics',
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      })
    }
    
    res.json({
      success: true,
      data: analyticsData,
      meta: {
        endpoint: '/api/v1/analytics',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    })
  }
})

// GET /api/v1/content - Get content data
router.get('/content', (req, res) => {
  try {
    const { type, category, limit = 10 } = req.query
    
    // Simulate content data
    const contentData = {
      articles: [
        {
          id: 1,
          title: 'Managing Workplace Stress',
          category: 'mental-health',
          type: 'article',
          views: 2340,
          rating: 4.8,
          publishDate: '2024-01-15T10:00:00Z',
          author: 'Dr. Sarah Johnson'
        },
        {
          id: 2,
          title: 'Teen Mental Health Awareness',
          category: 'teenager',
          type: 'article',
          views: 1890,
          rating: 4.6,
          publishDate: '2024-01-10T14:30:00Z',
          author: 'Dr. Michael Chen'
        },
        {
          id: 3,
          title: 'Work-Life Balance Tips',
          category: 'lifestyle',
          type: 'guide',
          views: 1560,
          rating: 4.5,
          publishDate: '2024-01-08T09:15:00Z',
          author: 'Lisa Wang'
        }
      ],
      courses: [
        {
          id: 101,
          title: 'Mindfulness for Beginners',
          category: 'mindfulness',
          type: 'course',
          enrollments: 456,
          rating: 4.7,
          duration: '4 weeks',
          instructor: 'Dr. Emma Thompson'
        },
        {
          id: 102,
          title: 'Stress Management Techniques',
          category: 'stress-management',
          type: 'course',
          enrollments: 334,
          rating: 4.6,
          duration: '6 weeks',
          instructor: 'Dr. James Wilson'
        }
      ],
      total: 5,
      lastUpdated: new Date().toISOString()
    }
    
    let filteredContent = [...contentData.articles, ...contentData.courses]
    
    // Apply filters
    if (type) {
      filteredContent = filteredContent.filter(item => item.type === type)
    }
    
    if (category) {
      filteredContent = filteredContent.filter(item => item.category === category)
    }
    
    // Apply limit
    filteredContent = filteredContent.slice(0, parseInt(limit))
    
    res.json({
      success: true,
      data: {
        content: filteredContent,
        total: filteredContent.length,
        filters: { type, category, limit: parseInt(limit) }
      },
      meta: {
        endpoint: '/api/v1/content',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    })
  }
})

// GET /api/v1/health - API health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: [
      'GET /api/v1/users',
      'GET /api/v1/analytics',
      'GET /api/v1/content',
      'GET /api/v1/health'
    ]
  })
})

module.exports = router