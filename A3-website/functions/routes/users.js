const express = require('express')
const { authenticateToken } = require('./auth')
const router = express.Router()

// Mock user data (same as in auth.js - in production, use shared database)
let users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    role: 'admin',
    profile: {
      firstName: 'Admin',
      lastName: 'User',
      avatar: null,
      bio: 'System administrator',
      location: 'Headquarters',
      joinDate: '2024-01-01'
    },
    stats: {
      posts: 156,
      engagement: 95,
      lastActive: '2025-01-15'
    },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2025-01-15T10:30:00.000Z'
  },
  {
    id: 2,
    username: 'worker',
    email: 'worker@example.com',
    role: 'worker',
    profile: {
      firstName: 'John',
      lastName: 'Worker',
      avatar: null,
      bio: 'Content creator and analyst',
      location: 'Remote',
      joinDate: '2024-02-15'
    },
    stats: {
      posts: 89,
      engagement: 87,
      lastActive: '2025-01-14'
    },
    createdAt: '2024-02-15T00:00:00.000Z',
    updatedAt: '2025-01-14T16:45:00.000Z'
  },
  {
    id: 3,
    username: 'alice_johnson',
    email: 'alice@example.com',
    role: 'worker',
    profile: {
      firstName: 'Alice',
      lastName: 'Johnson',
      avatar: null,
      bio: 'Data analyst and researcher',
      location: 'New York',
      joinDate: '2024-03-10'
    },
    stats: {
      posts: 45,
      engagement: 92,
      lastActive: '2025-01-15'
    },
    createdAt: '2024-03-10T00:00:00.000Z',
    updatedAt: '2025-01-15T09:15:00.000Z'
  }
]

// Middleware to check admin role
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Access denied',
      message: 'Admin privileges required'
    })
  }
  next()
}

// GET /api/users - Get all users (admin only)
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = req.query
    
    let filteredUsers = users.filter(user => {
      if (!search) return true
      const searchLower = search.toLowerCase()
      return (
        user.username.toLowerCase().includes(searchLower) ||
        user.email.toLowerCase().includes(searchLower) ||
        user.profile.firstName.toLowerCase().includes(searchLower) ||
        user.profile.lastName.toLowerCase().includes(searchLower)
      )
    })

    // Sort users
    filteredUsers.sort((a, b) => {
      let aVal, bVal
      
      if (sortBy === 'name') {
        aVal = `${a.profile.firstName} ${a.profile.lastName}`.toLowerCase()
        bVal = `${b.profile.firstName} ${b.profile.lastName}`.toLowerCase()
      } else if (sortBy === 'posts') {
        aVal = a.stats.posts
        bVal = b.stats.posts
      } else if (sortBy === 'engagement') {
        aVal = a.stats.engagement
        bVal = b.stats.engagement
      } else if (sortBy === 'lastActive') {
        aVal = new Date(a.stats.lastActive)
        bVal = new Date(b.stats.lastActive)
      } else {
        aVal = new Date(a[sortBy] || a.createdAt)
        bVal = new Date(b[sortBy] || b.createdAt)
      }

      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
      }
    })

    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + parseInt(limit)
    const paginatedUsers = filteredUsers.slice(startIndex, endIndex)

    // Remove passwords from response
    const safeUsers = paginatedUsers.map(({ password, ...user }) => user)

    res.json({
      users: safeUsers,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(filteredUsers.length / limit),
        totalUsers: filteredUsers.length,
        hasNext: endIndex < filteredUsers.length,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('Get users error:', error)
    res.status(500).json({
      error: 'Failed to retrieve users'
    })
  }
})

// GET /api/users/:id - Get user by ID
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const userId = parseInt(req.params.id)
    const user = users.find(u => u.id === userId)

    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      })
    }

    // Users can only view their own profile unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only view your own profile'
      })
    }

    const { password, ...safeUser } = user
    res.json({ user: safeUser })

  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      error: 'Failed to retrieve user'
    })
  }
})

// PUT /api/users/:id - Update user
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const userId = parseInt(req.params.id)
    const userIndex = users.findIndex(u => u.id === userId)

    if (userIndex === -1) {
      return res.status(404).json({
        error: 'User not found'
      })
    }

    // Users can only update their own profile unless they're admin
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only update your own profile'
      })
    }

    const { profile, stats } = req.body
    const user = users[userIndex]

    // Update profile fields
    if (profile) {
      user.profile = {
        ...user.profile,
        ...profile
      }
    }

    // Only admins can update stats
    if (stats && req.user.role === 'admin') {
      user.stats = {
        ...user.stats,
        ...stats
      }
    }

    user.updatedAt = new Date().toISOString()

    const { password, ...safeUser } = user
    res.json({
      message: 'User updated successfully',
      user: safeUser
    })

  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({
      error: 'Failed to update user'
    })
  }
})

// DELETE /api/users/:id - Delete user (admin only)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const userId = parseInt(req.params.id)
    const userIndex = users.findIndex(u => u.id === userId)

    if (userIndex === -1) {
      return res.status(404).json({
        error: 'User not found'
      })
    }

    // Prevent admin from deleting themselves
    if (req.user.id === userId) {
      return res.status(400).json({
        error: 'Cannot delete your own account'
      })
    }

    users.splice(userIndex, 1)

    res.json({
      message: 'User deleted successfully'
    })

  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({
      error: 'Failed to delete user'
    })
  }
})

// GET /api/users/stats/summary - Get user statistics summary (admin only)
router.get('/stats/summary', authenticateToken, requireAdmin, (req, res) => {
  try {
    const totalUsers = users.length
    const adminUsers = users.filter(u => u.role === 'admin').length
    const workerUsers = users.filter(u => u.role === 'worker').length
    
    const totalPosts = users.reduce((sum, user) => sum + (user.stats?.posts || 0), 0)
    const avgEngagement = users.reduce((sum, user) => sum + (user.stats?.engagement || 0), 0) / totalUsers
    
    // Active users (last active within 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const activeUsers = users.filter(user => {
      const lastActive = new Date(user.stats?.lastActive || user.createdAt)
      return lastActive >= sevenDaysAgo
    }).length

    res.json({
      summary: {
        totalUsers,
        activeUsers,
        usersByRole: {
          admin: adminUsers,
          worker: workerUsers
        },
        content: {
          totalPosts,
          avgEngagement: Math.round(avgEngagement * 100) / 100
        },
        activity: {
          activeUsersPercentage: Math.round((activeUsers / totalUsers) * 100)
        }
      }
    })

  } catch (error) {
    console.error('Get stats error:', error)
    res.status(500).json({
      error: 'Failed to retrieve statistics'
    })
  }
})

module.exports = router