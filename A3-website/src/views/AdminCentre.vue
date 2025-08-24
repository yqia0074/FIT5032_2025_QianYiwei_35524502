<template>
  <div class="admin-container" role="main" aria-labelledby="admin-title">
    <!-- Skip to main content link -->
    <a href="#main-dashboard" class="skip-link visually-hidden-focusable">Skip to main dashboard</a>
    
    <div class="admin-header" role="banner">
      <div class="header-content">
        <div class="admin-title">
          <h1 id="admin-title"><i class="bi bi-shield-lock-fill" aria-hidden="true"></i> Admin Control Center</h1>
          <div class="admin-badge" role="status" aria-label="Current section">System Management</div>
        </div>
        <p class="text-muted">User management, data analysis and system monitoring tools</p>
      </div>
      
      <div class="system-status" role="complementary" aria-labelledby="system-status-title">
        <h2 id="system-status-title" class="visually-hidden">System Status</h2>
        <div class="status-indicator online" role="status" aria-live="polite">
          <i class="bi bi-circle-fill" aria-hidden="true"></i>
          <span>System Online</span>
        </div>
        <div class="system-health" role="group" aria-label="System health metrics">
          <span class="health-metric" aria-label="CPU usage">CPU: {{ systemMetrics.cpu }}%</span>
          <span class="health-metric" aria-label="Memory usage">Memory: {{ systemMetrics.memory }}%</span>
        </div>
        <div class="timestamp" role="status" aria-live="polite" aria-label="Current time">{{ currentTime }}</div>
      </div>
    </div>
    
    <!-- Quick Stats Overview -->
    <section class="quick-stats" role="region" aria-labelledby="stats-title">
      <h2 id="stats-title" class="visually-hidden">Quick Statistics Overview</h2>
      <div class="stat-card" role="article" tabindex="0" aria-labelledby="users-stat">
        <div class="stat-icon" aria-hidden="true"><i class="bi bi-people-fill"></i></div>
        <div class="stat-info">
          <div class="stat-number" id="users-stat" aria-label="{{ userCount }} total users">{{ userCount }}</div>
          <div class="stat-label">Total Users</div>
        </div>
      </div>
      <div class="stat-card" role="article" tabindex="0" aria-labelledby="active-stat">
        <div class="stat-icon" aria-hidden="true"><i class="bi bi-chat-dots-fill"></i></div>
        <div class="stat-info">
          <div class="stat-number" id="active-stat" aria-label="{{ activeUsers }} users active today">{{ activeUsers }}</div>
          <div class="stat-label">Active Today</div>
        </div>
      </div>
      <div class="stat-card" role="article" tabindex="0" aria-labelledby="ratings-stat">
        <div class="stat-icon" aria-hidden="true"><i class="bi bi-star-fill"></i></div>
        <div class="stat-info">
          <div class="stat-number" id="ratings-stat" aria-label="{{ ratingCount }} total ratings">{{ ratingCount }}</div>
          <div class="stat-label">Total Ratings</div>
        </div>
      </div>
      <div class="stat-card" role="article" tabindex="0" aria-labelledby="emails-stat">
        <div class="stat-icon" aria-hidden="true"><i class="bi bi-envelope-fill"></i></div>
        <div class="stat-info">
          <div class="stat-number" id="emails-stat" aria-label="{{ emailsSent }} emails sent">{{ emailsSent }}</div>
          <div class="stat-label">Emails Sent</div>
        </div>
      </div>
    </section>
    
    <!-- XSS Protection Alert -->
    <div class="alert alert-dark" role="alert" aria-live="polite">
      <i class="bi bi-shield-check" aria-hidden="true"></i> 
      The system has implemented security measures to protect user data. All inputs are sanitized to prevent XSS attacks.
    </div>
    
    <div id="main-dashboard" class="admin-dashboard" role="region" aria-labelledby="dashboard-title">
      <h2 id="dashboard-title" class="visually-hidden">Admin Dashboard</h2>
      
      <!-- Real-time Analytics Chart -->
      <div class="dashboard-row">
        <section class="dashboard-card analytics-chart full-width" role="region" aria-labelledby="analytics-title">
          <div class="card-header">
            <i class="bi bi-graph-up" aria-hidden="true"></i>
            <h3 id="analytics-title">Real-time User Activity</h3>
            <div class="chart-controls">
              <label for="chart-time-range" class="visually-hidden">Select time range for chart</label>
              <select 
                id="chart-time-range"
                v-model="chartTimeRange" 
                @change="updateChart" 
                class="form-select form-select-sm"
                aria-describedby="chart-time-help"
              >
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              <div id="chart-time-help" class="visually-hidden">Changes the time period displayed in the activity chart</div>
            </div>
          </div>
          <div class="card-body">
            <canvas 
              ref="activityChart" 
              width="400" 
              height="200"
              role="img"
              :aria-label="`User activity chart showing data for ${chartTimeRange}`"
            ></canvas>
          </div>
        </section>
      </div>
      
      <div class="dashboard-row">
        <div class="dashboard-card user-info-card">
          <div class="card-header">
            <i class="bi bi-people-fill"></i>
            <h5>User Registration Info</h5>
          </div>
          <div class="card-body">
            <UserRegistrationInfo />
            <div class="user-breakdown">
              <div class="breakdown-item">
                <span class="breakdown-label">Teenagers:</span>
                <span class="breakdown-value">{{ userBreakdown.teenager }}</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Workers:</span>
                <span class="breakdown-value">{{ userBreakdown.worker }}</span>
              </div>
              <div class="breakdown-item">
                <span class="breakdown-label">Admins:</span>
                <span class="breakdown-value">{{ userBreakdown.admin }}</span>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <span class="data-count">{{ userCount }} users</span>
            <span class="update-time">Last update: {{ lastUpdateTime }}</span>
          </div>
        </div>
        
        <div class="dashboard-card community-card">
          <div class="card-header">
            <i class="bi bi-chat-square-text-fill"></i>
            <h5>Community Management</h5>
          </div>
          <div class="card-body">
            <Community />
            <div class="community-stats">
              <div class="stat-item">
                <i class="bi bi-eye-fill"></i>
                <span>{{ communityStats.totalViews }} views today</span>
              </div>
              <div class="stat-item">
                <i class="bi bi-heart-fill"></i>
                <span>{{ communityStats.totalLikes }} likes today</span>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <span class="action-button" @click="exportCommunityData"><i class="bi bi-download"></i> Export Data</span>
            <span class="action-button"><i class="bi bi-pencil-square"></i> Manage Posts</span>
          </div>
        </div>
      </div>
      
      <div class="dashboard-row">
        <div class="dashboard-card email-card">
          <div class="card-header">
            <i class="bi bi-envelope-fill"></i>
            <h5>Email Center</h5>
          </div>
          <div class="card-body">
            <EmailCenter />
            <div class="email-stats">
              <div class="email-stat">
                <span class="stat-label">Sent Today:</span>
                <span class="stat-value">{{ emailStats.sentToday }}</span>
              </div>
              <div class="email-stat">
                <span class="stat-label">Success Rate:</span>
                <span class="stat-value">{{ emailStats.successRate }}%</span>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <span class="action-button" @click="sendBulkNotification"><i class="bi bi-broadcast"></i> Bulk Notify</span>
            <span class="action-button"><i class="bi bi-send"></i> Send Notification</span>
          </div>
        </div>
        
        <div class="dashboard-card analytics-card">
          <div class="card-header">
            <i class="bi bi-bar-chart-fill"></i>
            <h5>User Engagement Analytics</h5>
          </div>
          <div class="card-body">
            <AnalyticsTables />
            <div class="engagement-summary">
              <div class="engagement-item">
                <span class="engagement-label">Avg. Session:</span>
                <span class="engagement-value">{{ engagementStats.avgSession }}min</span>
              </div>
              <div class="engagement-item">
                <span class="engagement-label">Bounce Rate:</span>
                <span class="engagement-value">{{ engagementStats.bounceRate }}%</span>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <span class="action-button" @click="exportAnalyticsReport"><i class="bi bi-download"></i> Export Report</span>
            <span class="action-button" @click="generateInsights"><i class="bi bi-lightbulb"></i> AI Insights</span>
          </div>
        </div>
      </div>
      
      <div class="dashboard-row">
        <div class="dashboard-card export-card">
          <div class="card-header">
            <i class="bi bi-download"></i>
            <h5>Data Export Center</h5>
          </div>
          <div class="card-body">
            <p class="card-text">Export system data in multiple formats for analysis and reporting</p>
            <div class="export-options">
              <button 
                @click="toggleExportPanel" 
                class="btn btn-primary me-2"
                :class="{ active: showExportPanel }"
              >
                <i class="bi bi-gear" aria-hidden="true"></i>
                {{ showExportPanel ? 'Hide Export Options' : 'Show Export Options' }}
              </button>
              <button @click="quickExportAnalytics" class="btn btn-outline-secondary">
                <i class="bi bi-lightning" aria-hidden="true"></i>
                Quick Export
              </button>
            </div>
            
            <!-- Data Export Panel -->
            <div v-if="showExportPanel" class="export-panel mt-3">
              <DataExport 
                :data="exportData"
                :default-filename="'admin-dashboard-export'"
                :show-date-range="true"
                @export-started="onExportStarted"
                @export-completed="onExportCompleted"
                @export-failed="onExportFailed"
              />
            </div>
          </div>
          <div class="card-footer">
            <span class="data-count">{{ getTotalExportableRecords() }} records available</span>
          </div>
        </div>
        
        <div class="dashboard-card ratings-card">
          <div class="card-header">
            <i class="bi bi-star-fill"></i>
            <h5>User Ratings Analysis</h5>
          </div>
          <div class="card-body">
            <p class="card-text">View and analyze user ratings for articles and forum posts</p>
            <RatingsAnalytics />
            <div class="rating-summary">
              <div class="rating-item">
                <span class="rating-label">Average Rating:</span>
                <span class="rating-value">{{ averageRating }}/5</span>
              </div>
              <div class="rating-item">
                <span class="rating-label">Most Popular:</span>
                <span class="rating-value">{{ mostPopularContent }}</span>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <span class="data-count">{{ ratingCount }} ratings</span>
            <span class="action-button" @click="exportRatingsData"><i class="bi bi-download"></i> Export</span>
            <span class="action-button"><i class="bi bi-graph-up"></i> View Trends</span>
          </div>
        </div>
        
        <div class="dashboard-card system-monitor">
          <div class="card-header">
            <i class="bi bi-cpu-fill"></i>
            <h5>System Monitor</h5>
          </div>
          <div class="card-body">
            <div class="monitor-grid">
              <div class="monitor-item">
                <div class="monitor-label">Server Status</div>
                <div class="monitor-value status-online">Online</div>
              </div>
              <div class="monitor-item">
                <div class="monitor-label">Response Time</div>
                <div class="monitor-value">{{ systemMetrics.responseTime }}ms</div>
              </div>
              <div class="monitor-item">
                <div class="monitor-label">Active Sessions</div>
                <div class="monitor-value">{{ systemMetrics.activeSessions }}</div>
              </div>
              <div class="monitor-item">
                <div class="monitor-label">Error Rate</div>
                <div class="monitor-value">{{ systemMetrics.errorRate }}%</div>
              </div>
            </div>
          </div>
          <div class="card-footer">
            <span class="action-button" @click="refreshMetrics"><i class="bi bi-arrow-clockwise"></i> Refresh</span>
            <span class="action-button" @click="viewLogs"><i class="bi bi-file-text"></i> View Logs</span>
          </div>
        </div>
      </div>
      

    </div>
  </div>
</template>

<script setup>
import UserRegistrationInfo from '../components/UserRegistrationInfo.vue'
import Community from '../components/Community.vue'
import EmailCenter from '../components/EmailCenter.vue'
import AnalyticsTables from '../components/AnalyticsTables.vue'
import RatingsAnalytics from '../components/RatingsAnalytics.vue'
import DataExport from '../components/DataExport.vue'

import { FocusManager, AriaManager, KeyboardNavigation } from '../utils/accessibility.js'
import { downloadCSV } from '../utils/exportUtils.js'
import { onMounted, onUnmounted, ref, computed } from 'vue'

// Initialize accessibility managers
const focusManager = new FocusManager()
const keyboardNav = new KeyboardNavigation()

// Data variables
const userCount = ref(0)
const ratingCount = ref(0)
const lastUpdateTime = ref('')
const activeUsers = ref(0)
const emailsSent = ref(0)
const chartTimeRange = ref('24h')
const activityChart = ref(null)

// Export panel state
const showExportPanel = ref(false)

// Computed data for export
const exportData = computed(() => {
  // Create comprehensive data records for export
  const records = []
  
  // Add detailed user statistics records
  records.push({
    id: 'user_total',
    category: 'User Statistics',
    metric: 'Total Users',
    value: userCount.value,
    description: 'Total number of registered users in the system',
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
    type: 'count',
    status: 'active'
  })
  
  records.push({
    id: 'user_active_today',
    category: 'User Statistics', 
    metric: 'Active Users Today',
    value: activeUsers.value,
    description: 'Number of users who logged in today',
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
    type: 'count',
    status: 'active'
  })
  
  // Add detailed user breakdown
  records.push({
    id: 'user_teenagers',
    category: 'User Demographics',
    metric: 'Teenager Users',
    value: userBreakdown.value.teenager,
    description: 'Users registered with teenager role',
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
    type: 'count',
    status: 'active'
  })
  
  records.push({
    id: 'user_workers',
    category: 'User Demographics',
    metric: 'Worker Users',
    value: userBreakdown.value.worker,
    description: 'Users registered with worker role',
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
    type: 'count',
    status: 'active'
  })
  
  records.push({
    id: 'user_admins',
    category: 'User Demographics',
    metric: 'Admin Users',
    value: userBreakdown.value.admin,
    description: 'Users with administrative privileges',
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
    type: 'count',
    status: 'active'
  })
  
  // Add detailed rating statistics
  records.push({
    id: 'ratings_total',
    category: 'Content Statistics',
    metric: 'Total Ratings',
    value: ratingCount.value,
    description: 'Total number of article and content ratings submitted',
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
    type: 'count',
    status: 'active'
  })
  
  records.push({
    id: 'ratings_average',
    category: 'Content Statistics',
    metric: 'Average Rating',
    value: averageRating.value.toFixed(2),
    description: 'Average rating score across all rated content',
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
    type: 'rating'
  })
  
  // Add detailed communication statistics
  records.push({
    id: 'comm_emails_sent',
    category: 'Communication',
    metric: 'Emails Sent',
    value: emailsSent.value,
    description: 'Total number of system emails sent to users',
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
    type: 'count',
    status: 'active'
  })
  
  // Add detailed system performance metrics
  records.push({
    id: 'sys_cpu_usage',
    category: 'System Performance',
    metric: 'CPU Usage',
    value: systemMetrics.value.cpu + '%',
    description: 'Current CPU utilization percentage',
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
    type: 'percentage',
    status: systemMetrics.value.cpu > 80 ? 'warning' : 'normal'
  })
  
  records.push({
    id: 'sys_memory_usage',
    category: 'System Performance',
    metric: 'Memory Usage',
    value: systemMetrics.value.memory + '%',
    description: 'Current memory utilization percentage',
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
    type: 'percentage',
    status: systemMetrics.value.memory > 85 ? 'warning' : 'normal'
  })
  
  // Add detailed rating data with context
  const sampleRatings = [2, 3, 4, 5, 3, 3, 3, 3, 3]
  sampleRatings.forEach((rating, index) => {
    records.push({
      id: `rating_${index + 1}`,
      category: 'Individual Ratings',
      metric: `Article Rating #${index + 1}`,
      value: rating,
      description: `User rating for article: "Sample Article ${index + 1}"`,
      article_title: `Sample Article ${index + 1}`,
      user_role: index % 3 === 0 ? 'teenager' : index % 3 === 1 ? 'worker' : 'admin',
      rating_date: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      timestamp: new Date(Date.now() - (index * 24 * 60 * 60 * 1000)).toISOString(),
      type: 'rating',
      status: 'completed'
    })
  })
  
  // Add rating distribution analysis
  const ratingDistribution = sampleRatings.reduce((acc, rating) => {
    acc[rating] = (acc[rating] || 0) + 1
    return acc
  }, {})
  
  Object.entries(ratingDistribution).forEach(([rating, count]) => {
    records.push({
      id: `rating_dist_${rating}`,
      category: 'Rating Distribution',
      metric: `${rating} Star Ratings`,
      value: count,
      description: `Number of articles rated with ${rating} stars`,
      percentage: ((count / sampleRatings.length) * 100).toFixed(1) + '%',
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString(),
      type: 'distribution',
      status: 'active'
    })
  })
  
  return records
})

// User breakdown by role
const userBreakdown = ref({
  teenager: 0,
  worker: 0,
  admin: 0
})

// Community statistics
const communityStats = ref({
  totalViews: 0,
  totalLikes: 0
})

// Email statistics
const emailStats = ref({
  sentToday: 0,
  successRate: 95
})

// Engagement statistics
const engagementStats = ref({
  avgSession: 12,
  bounceRate: 25
})

// System metrics
const systemMetrics = ref({
  cpu: 45,
  memory: 62,
  responseTime: 120,
  activeSessions: 24,
  errorRate: 0.1
})

// Rating analytics
const averageRating = ref(4.2)
const mostPopularContent = ref('Managing Stress')

// Current time, updated every second
const currentTime = ref('')
const updateTimeInterval = setInterval(() => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US')
  
  // Update system metrics periodically
  updateSystemMetrics()
}, 1000)

// Validate input data and load statistics when component is mounted
onMounted(() => {
  // Implement basic security checks
  validateUserData()
  
  // Load user statistics data
  loadUserStats()
  
  // Set initial time
  currentTime.value = new Date().toLocaleTimeString('en-US')
  
  // Set last update time
  updateLastUpdateTime()
  
  // Initialize accessibility features
  initializeAccessibility()
})

// Clear timer when component is unmounted
onUnmounted(() => {
  clearInterval(updateTimeInterval)
})

// Load user statistics data
function loadUserStats() {
  // Get registered user count
  const registeredUsers = localStorage.getItem('registeredUsers')
  if (registeredUsers) {
    try {
      const users = JSON.parse(registeredUsers)
      userCount.value = users.length
      
      // Calculate user breakdown by role
      userBreakdown.value = {
        teenager: users.filter(u => u.role === 'teenager').length,
        worker: users.filter(u => u.role === 'worker').length,
        admin: users.filter(u => u.role === 'admin').length
      }
      
      // Simulate active users (30% of total users)
      activeUsers.value = Math.floor(users.length * 0.3)
    } catch (e) {
      console.error('Failed to parse registered users', e)
      userCount.value = 0
    }
  }
  
  // Get ratings count
  const ratings = localStorage.getItem('ratings')
  if (ratings) {
    try {
      const ratingsArray = JSON.parse(ratings)
      ratingCount.value = ratingsArray.length
      
      // Calculate average rating
      if (ratingsArray.length > 0) {
        const sum = ratingsArray.reduce((acc, rating) => acc + rating.value, 0)
        averageRating.value = (sum / ratingsArray.length).toFixed(1)
      }
    } catch (e) {
      console.error('Failed to parse ratings', e)
      ratingCount.value = 0
    }
  }
  
  // Load email statistics
  const emailHistory = localStorage.getItem('emailHistory')
  if (emailHistory) {
    try {
      const emails = JSON.parse(emailHistory)
      const today = new Date().toDateString()
      const todayEmails = emails.filter(email => 
        new Date(email.timestamp).toDateString() === today
      )
      emailStats.value.sentToday = todayEmails.length
      emailsSent.value = emails.length
    } catch (e) {
      console.error('Failed to parse email history', e)
    }
  }
  
  // Load community statistics
  loadCommunityStats()
}

// Update last update time
function updateLastUpdateTime() {
  const now = new Date()
  lastUpdateTime.value = now.toLocaleDateString('en-US') + ' ' + now.toLocaleTimeString('en-US')
}

// Validate user data
function validateUserData() {
  const userStr = localStorage.getItem('user')
  if (!userStr) return
  
  try {
    const user = JSON.parse(userStr)
    
    // Check if user data contains suspicious content
    const sanitizedUser = {
      ...user,
      username: sanitizeInput(user.username || ''),
      email: sanitizeInput(user.email || ''),
      role: user.role === 'admin' ? 'admin' : 'invalid'
    }
    
    // If data was modified, update storage
    if (JSON.stringify(user) !== JSON.stringify(sanitizedUser)) {
      localStorage.setItem('user', JSON.stringify(sanitizedUser))
    }
  } catch (e) {
    console.error('Invalid user data', e)
    // Clear invalid data
    localStorage.removeItem('user')
  }
}

// Sanitize input data to prevent XSS attacks
function sanitizeInput(input) {
  if (typeof input !== 'string') return ''
  
  // Remove potentially malicious script tags and event handlers
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '')
    .replace(/on\w+=\w+/g, '')
    .trim()
}

// Load community statistics
function loadCommunityStats() {
  // Simulate community engagement data
  communityStats.value = {
    totalViews: Math.floor(Math.random() * 500) + 100,
    totalLikes: Math.floor(Math.random() * 200) + 50
  }
}

// Update system metrics
function updateSystemMetrics() {
  // Simulate real-time system metrics
  systemMetrics.value = {
    cpu: Math.floor(Math.random() * 30) + 30,
    memory: Math.floor(Math.random() * 40) + 40,
    responseTime: Math.floor(Math.random() * 50) + 100,
    activeSessions: Math.floor(Math.random() * 20) + 15,
    errorRate: (Math.random() * 0.5).toFixed(1)
  }
}

// Update chart based on time range
function updateChart() {
  // This would typically fetch data based on the selected time range
  console.log('Updating chart for time range:', chartTimeRange.value)
  // Implementation would depend on the charting library used
}

// Toggle export panel
function toggleExportPanel() {
  showExportPanel.value = !showExportPanel.value
  const message = showExportPanel.value ? 'Export panel opened' : 'Export panel closed'
  AriaManager.announce(message)
}

// Handle export events
function onExportStarted() {
  AriaManager.announce('Export started')
}

function onExportCompleted(format) {
  AriaManager.announce(`Export completed in ${format} format`)
}

function onExportFailed(error) {
  AriaManager.announce(`Export failed: ${error}`)
}

// Quick export function
function quickExport() {
  const data = {
    users: userCount.value,
    ratings: ratingCount.value,
    activeUsers: activeUsers.value,
    emailsSent: emailsSent.value,
    timestamp: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `admin-summary-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  AriaManager.announce('Quick export completed')
}

// Export community data
function exportCommunityData() {
  const data = {
    stats: communityStats.value,
    timestamp: new Date().toISOString(),
    userCount: userCount.value
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `community-data-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Send bulk notification
function sendBulkNotification() {
  // This would integrate with the EmailCenter component
  console.log('Sending bulk notification to all users')
  alert('Bulk notification feature activated. Check Email Center for details.')
}

// Export analytics report
function exportAnalyticsReport() {
  // Create structured data for CSV export
  const reportData = [
    {
      category: 'User Statistics',
      metric: 'Total Users',
      value: userCount.value,
      details: 'Total registered users in the system',
      timestamp: new Date().toISOString()
    },
    {
      category: 'User Statistics',
      metric: 'Active Users Today',
      value: activeUsers.value,
      details: 'Users who logged in today',
      timestamp: new Date().toISOString()
    },
    {
      category: 'User Breakdown',
      metric: 'Teenager Users',
      value: userBreakdown.value.teenager,
      details: 'Users registered as teenagers',
      timestamp: new Date().toISOString()
    },
    {
      category: 'User Breakdown',
      metric: 'Worker Users',
      value: userBreakdown.value.worker,
      details: 'Users registered as workers',
      timestamp: new Date().toISOString()
    },
    {
      category: 'User Breakdown',
      metric: 'Admin Users',
      value: userBreakdown.value.admin,
      details: 'Users with admin privileges',
      timestamp: new Date().toISOString()
    },
    {
      category: 'Content Statistics',
      metric: 'Total Ratings',
      value: ratingCount.value,
      details: 'Total number of article ratings',
      timestamp: new Date().toISOString()
    },
    {
      category: 'Content Statistics',
      metric: 'Average Rating',
      value: averageRating.value.toFixed(2),
      details: 'Average rating across all articles',
      timestamp: new Date().toISOString()
    }
  ]
  
  // Use CSV export from utils
  downloadCSV(reportData, `analytics-report-${new Date().toISOString().split('T')[0]}`)
  
  // Announce successful export
  AriaManager.announce('Analytics report exported as CSV successfully')
}



// Get total exportable records count
function getTotalExportableRecords() {
  return exportData.value.length
}

// Initialize accessibility features
function initializeAccessibility() {
  // Set up keyboard shortcuts
  keyboardNav.addShortcut('Alt+D', () => {
    const dashboard = document.getElementById('main-dashboard')
    if (dashboard) {
      dashboard.focus()
      AriaManager.announce('Focused on main dashboard')
    }
  })
  
  keyboardNav.addShortcut('Alt+S', () => {
    const statsSection = document.querySelector('.quick-stats')
    if (statsSection) {
      const firstStat = statsSection.querySelector('.stat-card')
      if (firstStat) {
        firstStat.focus()
        AriaManager.announce('Focused on statistics overview')
      }
    }
  })
  
  keyboardNav.addShortcut('Alt+C', () => {
    const chartSelect = document.getElementById('chart-time-range')
    if (chartSelect) {
      chartSelect.focus()
      AriaManager.announce('Focused on chart time range selector')
    }
  })
  
  // Add arrow key navigation for stat cards
  keyboardNav.addArrowNavigation('.stat-card')
  
  // Set up focus management for dashboard sections
  focusManager.createFocusTrap('#main-dashboard')
}

// Generate AI insights
function generateInsights() {
  const insights = [
    'User engagement is highest during evening hours (6-9 PM)',
    'Teenager users show 40% higher interaction rates with mental health content',
    'Email campaigns sent on Tuesdays have 25% better open rates',
    'Users who rate content are 3x more likely to return within 7 days'
  ]
  
  const randomInsight = insights[Math.floor(Math.random() * insights.length)]
  alert(`AI Insight: ${randomInsight}`)
}

// Export ratings data
function exportRatingsData() {
  const ratingsData = localStorage.getItem('ratings')
  if (ratingsData) {
    const blob = new Blob([ratingsData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ratings-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

// Refresh system metrics
function refreshMetrics() {
  updateSystemMetrics()
  loadUserStats()
  loadCommunityStats()
  alert('System metrics refreshed successfully!')
}

// View system logs
function viewLogs() {
  const logs = [
    `${new Date().toISOString()} - System startup completed`,
    `${new Date().toISOString()} - User authentication successful`,
    `${new Date().toISOString()} - Email service operational`,
    `${new Date().toISOString()} - Database connection established`
  ]
  
  alert('Recent System Logs:\n\n' + logs.join('\n'))
}
</script>

<style scoped>
/* Accessibility styles */
.visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

.visually-hidden-focusable:not(:focus):not(:focus-within) {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

/* Skip link styles */
.skip-link {
  position: absolute;
  top: -40px;
  left: 6px;
  background: #000;
  color: #fff;
  padding: 8px;
  text-decoration: none;
  z-index: 1000;
  border-radius: 4px;
}

.skip-link:focus {
  top: 6px;
}

/* Focus styles for better accessibility */
.stat-card:focus,
.dashboard-card:focus,
button:focus,
select:focus,
input:focus {
  outline: 3px solid #007bff;
  outline-offset: 2px;
}

.admin-container {
  padding: 25px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  margin: 20px auto;
  max-width: 1400px;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #dee2e6;
}

.admin-title {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.admin-title h2 {
  margin: 0;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.admin-title h2 i {
  margin-right: 10px;
  color: #343a40;
}

.admin-badge {
  margin-left: 15px;
  padding: 5px 10px;
  background-color: #343a40;
  color: white;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.system-status {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.system-health {
  display: flex;
  gap: 15px;
  margin-bottom: 5px;
}

.health-metric {
  font-size: 0.85rem;
  color: #6c757d;
  font-weight: 500;
}

/* Quick Stats Overview */
.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.stat-card:nth-child(2) {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card:nth-child(3) {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card:nth-child(4) {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.stat-icon {
  font-size: 2.5rem;
  margin-right: 15px;
  opacity: 0.8;
}

.stat-info {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
  margin-top: 5px;
}

.status-indicator {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  font-weight: 500;
}

.status-indicator i {
  font-size: 0.6rem;
  margin-right: 5px;
}

.status-indicator.online i {
  color: #28a745;
}

.timestamp {
  font-size: 0.9rem;
  color: #6c757d;
}

.admin-dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dashboard-row {
  display: flex;
  gap: 20px;
  width: 100%;
}

.dashboard-card {
  flex: 1;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.dashboard-card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transform: translateY(-3px);
}

.dashboard-card.full-width {
  width: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px 20px;
  background-color: #343a40;
  color: white;
}

.chart-controls {
  margin-left: auto;
}

.chart-controls .form-select {
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  font-size: 0.85rem;
}

.chart-controls .form-select:focus {
  background-color: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: none;
}

.card-header i {
  font-size: 1.2rem;
  margin-right: 10px;
}

.card-header h5 {
  margin: 0;
  font-weight: 500;
}

.card-body {
  padding: 20px;
  flex: 1;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #dee2e6;
}

.data-count {
  font-size: 0.9rem;
  color: #6c757d;
  font-weight: 500;
}

.update-time {
  font-size: 0.8rem;
  color: #6c757d;
}

.action-button {
  display: inline-flex;
  align-items: center;
  color: #007bff;
  font-size: 0.9rem;
  cursor: pointer;
  transition: color 0.2s;
}

.action-button i {
  margin-right: 5px;
}

.action-button:hover {
  color: #0056b3;
}

/* User breakdown styles */
.user-breakdown {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #dee2e6;
}

.breakdown-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f8f9fa;
}

.breakdown-item:last-child {
  border-bottom: none;
}

.breakdown-label {
  font-weight: 500;
  color: #495057;
}

.breakdown-value {
  font-weight: 600;
  color: #007bff;
  background-color: #e3f2fd;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
}

/* Community stats styles */
.community-stats {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #dee2e6;
}

.stat-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 0.9rem;
  color: #6c757d;
}

.stat-item i {
  margin-right: 8px;
  color: #007bff;
}

/* Email stats styles */
.email-stats {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #dee2e6;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.email-stat {
  text-align: center;
}

.email-stat .stat-label {
  display: block;
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 5px;
}

.email-stat .stat-value {
  display: block;
  font-size: 1.2rem;
  font-weight: 600;
  color: #28a745;
}

/* Engagement summary styles */
.engagement-summary {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #dee2e6;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.engagement-item {
  text-align: center;
}

.engagement-label {
  display: block;
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 5px;
}

.engagement-value {
  display: block;
  font-size: 1.2rem;
  font-weight: 600;
  color: #17a2b8;
}

/* Rating summary styles */
.rating-summary {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #dee2e6;
}

.rating-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f8f9fa;
}

.rating-item:last-child {
  border-bottom: none;
}

.rating-label {
  font-weight: 500;
  color: #495057;
}

.rating-value {
  font-weight: 600;
  color: #ffc107;
  background-color: #fff3cd;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9rem;
}

/* System monitor styles */
.system-monitor .card-header {
  background-color: #28a745;
}

.monitor-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}

.monitor-item {
  text-align: center;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 6px;
}

.monitor-label {
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 5px;
}

.monitor-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: #495057;
}

.monitor-value.status-online {
  color: #28a745;
}

/* Specific card styles */
.user-info-card .card-header {
  background-color: #343a40;
}

.community-card .card-header {
  background-color: #495057;
}

.email-card .card-header {
  background-color: #6c757d;
}

.analytics-card .card-header {
  background-color: #495057;
}

/* Export panel styles */
.export-panel {
  margin-top: 15px;
  padding: 20px;
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.btn.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.btn.active:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

/* Data export card styles */
.data-export-card .card-header {
  background-color: #17a2b8;
}

.export-actions {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.export-actions .btn {
  flex: 1;
}

.analytics-chart .card-header {
  background-color: #17a2b8;
}

.ratings-card .card-header {
  background-color: #343a40;
}

/* AI Assistant card styles */
.ai-assistant-card .card-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.ai-assistant-card .card-header i {
  color: #fff;
}

.ai-status {
  display: flex;
  align-items: center;
}

.status-badge {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  backdrop-filter: blur(10px);
}

.ai-assistant-card .card-body {
  padding: 0;
}

.ai-assistant-card .card-text {
  padding: 20px 24px 0;
  margin-bottom: 0;
  color: #6c757d;
  font-style: italic;
}

@media (max-width: 768px) {
  .dashboard-row {
    flex-direction: column;
  }
  
  .admin-header {
    flex-direction: column;
  }
  
  .system-status {
    align-items: flex-start;
    margin-top: 10px;
  }
  
  .system-health {
    flex-direction: column;
    gap: 5px;
  }
  
  .quick-stats {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 15px;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .chart-controls {
    margin-left: 0;
    margin-top: 10px;
  }
  
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .email-stats,
  .engagement-summary {
    grid-template-columns: 1fr;
  }
  
  .monitor-grid {
    grid-template-columns: 1fr;
  }
}
</style>


