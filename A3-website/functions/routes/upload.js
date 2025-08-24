const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs').promises
const { authenticateToken } = require('./auth')
const router = express.Router()

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads')
fs.mkdir(uploadsDir, { recursive: true }).catch(console.error)

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files per request
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/gif': '.gif',
      'image/webp': '.webp',
      'application/pdf': '.pdf',
      'text/csv': '.csv',
      'application/json': '.json',
      'text/plain': '.txt'
    }
    
    if (allowedTypes[file.mimetype]) {
      cb(null, true)
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`), false)
    }
  }
})

// Helper function to generate unique filename
const generateFilename = (originalName, userId) => {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 8)
  const ext = path.extname(originalName)
  const name = path.basename(originalName, ext).replace(/[^a-zA-Z0-9]/g, '_')
  return `${userId}_${timestamp}_${random}_${name}${ext}`
}

// Helper function to get file info
const getFileInfo = async (buffer, mimetype, originalName) => {
  const info = {
    size: buffer.length,
    mimetype,
    originalName
  }
  
  return info
}

// POST /api/upload/single - Upload single file
router.post('/single', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a file to upload'
      })
    }
    
    const { buffer, mimetype, originalname } = req.file
    
    let filename = generateFilename(originalname, req.user.id)
    
    // Save file
    const filepath = path.join(uploadsDir, filename)
    await fs.writeFile(filepath, buffer)
    
    // Get file info
    const fileInfo = await getFileInfo(processedBuffer, mimetype, originalname)
    
    const fileData = {
      id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      filename,
      originalName: originalname,
      url: `/api/upload/files/${filename}`,
      ...fileInfo,
      uploadedBy: req.user.id,
      uploadedAt: new Date().toISOString()
    }
    
    res.json({
      message: 'File uploaded successfully',
      file: fileData
    })
    
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({
      error: 'Upload failed',
      message: error.message
    })
  }
})

// POST /api/upload/multiple - Upload multiple files
router.post('/multiple', authenticateToken, upload.array('files', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        error: 'No files uploaded',
        message: 'Please select files to upload'
      })
    }
    
    const uploadedFiles = []
    const errors = []
    
    for (const file of req.files) {
      try {
        const { buffer, mimetype, originalname } = file
        let filename = generateFilename(originalname, req.user.id)
        
        // Save file
        const filepath = path.join(uploadsDir, filename)
        await fs.writeFile(filepath, buffer)
        
        // Get file info
        const fileInfo = await getFileInfo(buffer, mimetype, originalname)
        
        const fileData = {
          id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          filename,
          originalName: originalname,
          url: `/api/upload/files/${filename}`,
          ...fileInfo,
          uploadedBy: req.user.id,
          uploadedAt: new Date().toISOString()
        }
        
        uploadedFiles.push(fileData)
        
      } catch (error) {
        errors.push({
          filename: file.originalname,
          error: error.message
        })
      }
    }
    
    res.json({
      message: 'Upload completed',
      summary: {
        total: req.files.length,
        successful: uploadedFiles.length,
        failed: errors.length
      },
      files: uploadedFiles,
      errors
    })
    
  } catch (error) {
    console.error('Multiple upload error:', error)
    res.status(500).json({
      error: 'Upload failed',
      message: error.message
    })
  }
})

// GET /api/upload/files/:filename - Serve uploaded files
router.get('/files/:filename', async (req, res) => {
  try {
    const filename = req.params.filename
    const filepath = path.join(uploadsDir, filename)
    
    // Check if file exists
    try {
      await fs.access(filepath)
    } catch (error) {
      return res.status(404).json({
        error: 'File not found'
      })
    }
    
    // Get file stats
    const stats = await fs.stat(filepath)
    const ext = path.extname(filename).toLowerCase()
    
    // Set appropriate content type
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf',
      '.csv': 'text/csv',
      '.json': 'application/json',
      '.txt': 'text/plain'
    }
    
    const contentType = contentTypes[ext] || 'application/octet-stream'
    
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Length', stats.size)
    res.setHeader('Cache-Control', 'public, max-age=31536000') // 1 year cache
    
    // Stream the file
    const fileBuffer = await fs.readFile(filepath)
    res.send(fileBuffer)
    
  } catch (error) {
    console.error('Serve file error:', error)
    res.status(500).json({
      error: 'Failed to serve file'
    })
  }
})

// POST /api/upload/avatar - Upload user avatar
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No avatar file uploaded'
      })
    }
    
    const { buffer, mimetype, originalname } = req.file
    
    // Validate image type
    if (!mimetype.startsWith('image/')) {
      return res.status(400).json({
        error: 'Avatar must be an image file'
      })
    }
    
    // Process avatar (resize to 200x200, optimize quality)
    const filename = `avatar_${req.user.id}_${Date.now()}.jpg`
    const filepath = path.join(uploadsDir, filename)
    
    await fs.writeFile(filepath, buffer)
    
    const avatarData = {
      id: `avatar_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      filename,
      url: `/api/upload/files/${filename}`,
      size: buffer.length,
      uploadedBy: req.user.id,
      uploadedAt: new Date().toISOString()
    }
    
    res.json({
      message: 'Avatar uploaded successfully',
      avatar: avatarData
    })
    
  } catch (error) {
    console.error('Avatar upload error:', error)
    res.status(500).json({
      error: 'Avatar upload failed',
      message: error.message
    })
  }
})

// DELETE /api/upload/files/:filename - Delete uploaded file
router.delete('/files/:filename', authenticateToken, async (req, res) => {
  try {
    const filename = req.params.filename
    const filepath = path.join(uploadsDir, filename)
    
    // Check if file exists
    try {
      await fs.access(filepath)
    } catch (error) {
      return res.status(404).json({
        error: 'File not found'
      })
    }
    
    // Check if user owns the file (basic check based on filename)
    if (!filename.startsWith(`${req.user.id}_`) && req.user.role !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You can only delete your own files'
      })
    }
    
    await fs.unlink(filepath)
    
    res.json({
      message: 'File deleted successfully'
    })
    
  } catch (error) {
    console.error('Delete file error:', error)
    res.status(500).json({
      error: 'Failed to delete file',
      message: error.message
    })
  }
})

// GET /api/upload/info - Get upload configuration info
router.get('/info', authenticateToken, (req, res) => {
  res.json({
    limits: {
      maxFileSize: '10MB',
      maxFiles: 5,
      allowedTypes: [
        'image/jpeg',
        'image/png', 
        'image/gif',
        'image/webp',
        'application/pdf',
        'text/csv',
        'application/json',
        'text/plain'
      ]
    },
    features: {
      imageProcessing: true,
      resizing: true,
      qualityAdjustment: true,
      avatarOptimization: true
    },
    endpoints: {
      single: '/api/upload/single',
      multiple: '/api/upload/multiple',
      avatar: '/api/upload/avatar',
      files: '/api/upload/files/:filename'
    }
  })
})

module.exports = router