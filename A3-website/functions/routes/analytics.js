const express = require('express')
const { authenticateToken } = require('./auth')
const router = express.Router()

// Mock analytics data
let analyticsData = {
  users: [
    {
      id: 1,
      user: 'Alice Johnson',
      email: 'alice@example.com',
      posts: 45,
      lastActive: '2025-01-15',
      engagement: 92,
      views: 1250,
      likes: 340,
      comments: 89,
      shares: 23
    },
    {
      id: 2,
      user: 'Bob Smith',
      email: 'bob@example.com',
      posts: 23,
      lastActive: '2025-01-14',
      engagement: 78,
      views: 890,
      likes: 210,
      comments: 45,
      shares: 12
    },
    {
      id: 3,
      user: 'Carol Davis',
      email: 'carol@example.com',
      posts: 67,
      lastActive: '2025-01-13',
      engagement: 95,
      views: 2100,
      likes: 580,
      comments: 156,
      shares: 45
    },
    {
      id: 4,
      user: 'David Wilson',
      email: 'david@example.com',
      posts: 12,
      lastActive: '2025-01-10',
      engagement: 65,
      views: 450,
      likes: 120,
      comments: 28,
      shares: 8
    },
    {
      id: 5,
      user: 'Eva Brown',
      email: 'eva@example.com',
      posts: 89,
      lastActive: '2025-01-12',
      engagement: 88,
      views: 1800,
      likes: 490,
      comments: 134,
      shares: 38
    }
  ],
  systemStats: {
    totalUsers: 156,
    activeUsers: 89,
    totalPosts: 1247,
    totalViews: 45678,
    totalEngagement: 12345,
    avgSessionTime: 24.5, // minutes
    bounceRate: 32.1, // percentage
    conversionRate: 8.7 // percentage
  },
  dailyStats: generateDailyStats(),
  topContent: [
    {
      id: 1,
      title: 'Getting Started with Analytics',
      author: 'Alice Johnson',
      views: 2340,
      engagement: 95,
      publishDate: '2025-01-10'
    },
    {
      id: 2,
      title: 'Advanced Data Visualization',
      author: 'Carol Davis',
      views: 1890,
      engagement: 88,
      publishDate: '2025-01-12'
    },
    {
      id: 3,
      title: 'User Experience Best Practices',
      author: 'Eva Brown',
      views: 1650,
      engagement: 82,
      publishDate: '2025-01-08'
    }
  ]
}

// Generate mock daily stats for the last 30 days
function generateDailyStats() {
  const stats = []
  const today = new Date()
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    stats.push({
      date: date.toISOString().split('T')[0],
      users: Math.floor(Math.random() * 50) + 20,
      posts: Math.floor(Math.random() * 15) + 5,
      views: Math.floor(Math.random() * 500) + 200,
      engagement: Math.floor(Math.random() * 30) + 60
    })
  }
  
  return stats
}

// Middleware to check admin role for sensitive analytics
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Admin privileges required for detailed analytics'
    })
  }
  next()
}

// GET /api/analytics/dashboard - Get dashboard overview
router.get('/dashboard', authenticateToken, (req, res) => {
  try {
    const { timeRange = '30d' } = req.query
    
    // Calculate time-based stats
    const now = new Date()
    let startDate = new Date()
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }
    
    const filteredDailyStats = analyticsData.dailyStats.filter(stat => 
      new Date(stat.date) >= startDate
    )
    
    const totalViews = filteredDailyStats.reduce((sum, stat) => sum + stat.views, 0)
    const totalPosts = filteredDailyStats.reduce((sum, stat) => sum + stat.posts, 0)
    const avgEngagement = filteredDailyStats.reduce((sum, stat) => sum + stat.engagement, 0) / filteredDailyStats.length
    
    res.json({
      timeRange,
      summary: {
        totalViews,
        totalPosts,
        avgEngagement: Math.round(avgEngagement * 100) / 100,
        activeUsers: analyticsData.systemStats.activeUsers,
        growthRate: calculateGrowthRate(filteredDailyStats)
      },
      chartData: filteredDailyStats,
      topContent: analyticsData.topContent.slice(0, 5)
    })
    
  } catch (error) {
    console.error('Dashboard analytics error:', error)
    res.status(500).json({
      error: 'Failed to retrieve dashboard analytics'
    })
  }
})

// GET /api/analytics/users - Get user analytics
router.get('/users', authenticateToken, (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sortBy = 'engagement', 
      sortOrder = 'desc',
      search = ''
    } = req.query
    
    let users = [...analyticsData.users]
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      users = users.filter(user => 
        user.user.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower)
      )
    }
    
    // Apply sorting
    users.sort((a, b) => {
      let aVal = a[sortBy]
      let bVal = b[sortBy]
      
      if (sortBy === 'lastActive') {
        aVal = new Date(aVal)
        bVal = new Date(bVal)
      }
      
      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
      }
    })
    
    // Apply pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + parseInt(limit)
    const paginatedUsers = users.slice(startIndex, endIndex)
    
    res.json({
      users: paginatedUsers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(users.length / limit),
        totalUsers: users.length,
        hasNext: endIndex < users.length,
        hasPrev: page > 1
      },
      summary: {
        totalEngagement: users.reduce((sum, user) => sum + user.engagement, 0),
        avgEngagement: users.reduce((sum, user) => sum + user.engagement, 0) / users.length,
        totalPosts: users.reduce((sum, user) => sum + user.posts, 0),
        totalViews: users.reduce((sum, user) => sum + user.views, 0)
      }
    })
    
  } catch (error) {
    console.error('User analytics error:', error)
    res.status(500).json({
      error: 'Failed to retrieve user analytics'
    })
  }
})

// GET /api/analytics/system - Get system-wide analytics (admin only)
router.get('/system', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { timeRange = '30d' } = req.query
    
    // Calculate system metrics
    const systemMetrics = {
      ...analyticsData.systemStats,
      userGrowth: calculateUserGrowth(timeRange),
      contentMetrics: calculateContentMetrics(),
      performanceMetrics: {
        avgLoadTime: 1.2, // seconds
        uptime: 99.8, // percentage
        errorRate: 0.1, // percentage
        apiResponseTime: 145 // milliseconds
      },
      geographicData: [
        { country: 'United States', users: 45, percentage: 28.8 },
        { country: 'Canada', users: 23, percentage: 14.7 },
        { country: 'United Kingdom', users: 19, percentage: 12.2 },
        { country: 'Germany', users: 15, percentage: 9.6 },
        { country: 'Australia', users: 12, percentage: 7.7 },
        { country: 'Others', users: 42, percentage: 26.9 }
      ]
    }
    
    res.json({
      timeRange,
      systemMetrics,
      trends: analyticsData.dailyStats.slice(-parseInt(timeRange.replace('d', '')))
    })
    
  } catch (error) {
    console.error('System analytics error:', error)
    res.status(500).json({
      error: 'Failed to retrieve system analytics'
    })
  }
})

// GET /api/analytics/export - Export analytics data
router.get('/export', authenticateToken, (req, res) => {
  try {
    const { format = 'json', type = 'users', timeRange = '30d' } = req.query
    
    let data
    let filename
    
    switch (type) {
      case 'users':
        data = analyticsData.users
        filename = `user-analytics-${timeRange}`
        break
      case 'daily':
        data = analyticsData.dailyStats
        filename = `daily-analytics-${timeRange}`
        break
      case 'content':
        data = analyticsData.topContent
        filename = `content-analytics-${timeRange}`
        break
      default:
        data = analyticsData
        filename = `full-analytics-${timeRange}`
    }
    
    if (format === 'csv') {
      const csv = convertToCSV(data)
      res.setHeader('Content-Type', 'text/csv')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.csv"`)
      res.send(csv)
    } else {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Content-Disposition', `attachment; filename="${filename}.json"`)
      res.json({
        exportDate: new Date().toISOString(),
        type,
        timeRange,
        data
      })
    }
    
  } catch (error) {
    console.error('Export analytics error:', error)
    res.status(500).json({
      error: 'Failed to export analytics data'
    })
  }
})

// POST /api/analytics/track - Track custom events
router.post('/track', authenticateToken, (req, res) => {
  try {
    const { event, properties = {} } = req.body
    
    if (!event) {
      return res.status(400).json({
        error: 'Event name is required'
      })
    }
    
    // In a real application, you would store this in a database
    const trackingData = {
      event,
      properties,
      userId: req.user.id,
      timestamp: new Date().toISOString(),
      sessionId: req.headers['x-session-id'] || 'unknown'
    }
    
    console.log('Tracked event:', trackingData)
    
    res.json({
      message: 'Event tracked successfully',
      eventId: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    })
    
  } catch (error) {
    console.error('Track event error:', error)
    res.status(500).json({
      error: 'Failed to track event'
    })
  }
})

// Helper functions
function calculateGrowthRate(dailyStats) {
  if (dailyStats.length < 2) return 0
  
  const recent = dailyStats.slice(-7).reduce((sum, stat) => sum + stat.users, 0)
  const previous = dailyStats.slice(-14, -7).reduce((sum, stat) => sum + stat.users, 0)
  
  if (previous === 0) return 0
  return Math.round(((recent - previous) / previous) * 100 * 100) / 100
}

function calculateUserGrowth(timeRange) {
  const days = parseInt(timeRange.replace('d', ''))
  const baseGrowth = Math.random() * 20 + 5 // 5-25% growth
  return Math.round(baseGrowth * 100) / 100
}

function calculateContentMetrics() {
  return {
    totalArticles: 234,
    publishedThisMonth: 45,
    avgWordsPerArticle: 1250,
    avgReadTime: 4.2, // minutes
    topCategories: [
      { name: 'Technology', count: 89 },
      { name: 'Business', count: 67 },
      { name: 'Design', count: 45 },
      { name: 'Marketing', count: 33 }
    ]
  }
}

function convertToCSV(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return 'No data available'
  }
  
  const headers = Object.keys(data[0])
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value
      }).join(',')
    )
  ].join('\n')
  
  return csvContent
}

module.exports = router