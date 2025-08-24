const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const validator = require('validator')
const router = express.Router()

// In-memory user storage (replace with database in production)
let users = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'admin',
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    username: 'worker',
    email: 'worker@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'worker',
    createdAt: new Date().toISOString()
  }
]

// JWT secret (use environment variable in production)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' })
    }
    req.user = user
    next()
  })
}

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      username: user.username, 
      email: user.email, 
      role: user.role 
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  )
}

// Helper function to validate password strength
const validatePassword = (password) => {
  const minLength = 6
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  
  return {
    isValid: password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers,
    message: 'Password must be at least 6 characters long and contain uppercase, lowercase, and numbers'
  }
}

// POST /api/auth/register - User registration
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role = 'worker' } = req.body

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Username, email, and password are required'
      })
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email format'
      })
    }

    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        error: 'Invalid password',
        message: passwordValidation.message
      })
    }

    // Check if user already exists
    const existingUser = users.find(u => u.email === email || u.username === username)
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        message: 'A user with this email or username already exists'
      })
    }

    // Hash password
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // Create new user
    const newUser = {
      id: users.length + 1,
      username,
      email,
      password: hashedPassword,
      role: ['admin', 'worker'].includes(role) ? role : 'worker',
      createdAt: new Date().toISOString()
    }

    users.push(newUser)

    // Generate token
    const token = generateToken(newUser)

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = newUser
    
    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
      token
    })

  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred during registration'
    })
  }
})

// POST /api/auth/login - User login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing credentials',
        message: 'Email and password are required'
      })
    }

    // Find user
    const user = users.find(u => u.email === email)
    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      })
    }

    // Generate token
    const token = generateToken(user)

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user
    
    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      token
    })

  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login'
    })
  }
})

// GET /api/auth/me - Get current user info
router.get('/me', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id)
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      })
    }

    const { password: _, ...userWithoutPassword } = user
    res.json({
      user: userWithoutPassword
    })

  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({
      error: 'Failed to get user information'
    })
  }
})

// POST /api/auth/refresh - Refresh JWT token
router.post('/refresh', authenticateToken, (req, res) => {
  try {
    const user = users.find(u => u.id === req.user.id)
    if (!user) {
      return res.status(404).json({
        error: 'User not found'
      })
    }

    const newToken = generateToken(user)
    
    res.json({
      message: 'Token refreshed successfully',
      token: newToken
    })

  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(500).json({
      error: 'Failed to refresh token'
    })
  }
})

// POST /api/auth/logout - Logout (client-side token removal)
router.post('/logout', authenticateToken, (req, res) => {
  // In a real application, you might want to blacklist the token
  res.json({
    message: 'Logout successful',
    note: 'Please remove the token from client storage'
  })
})

module.exports = router
module.exports.authenticateToken = authenticateToken