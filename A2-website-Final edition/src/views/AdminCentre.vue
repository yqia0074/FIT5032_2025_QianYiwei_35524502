<template>
  <div class="admin-container">
    <div class="admin-header">
      <div class="header-content">
        <div class="admin-title">
          <h2><i class="bi bi-shield-lock-fill"></i> Admin Control Center</h2>
          <div class="admin-badge">System Management</div>
        </div>
        <p class="text-muted">User management, data analysis and system monitoring tools</p>
      </div>
      
      <div class="system-status">
        <div class="status-indicator online">
          <i class="bi bi-circle-fill"></i>
          <span>System Online</span>
        </div>
        <div class="timestamp">{{ currentTime }}</div>
      </div>
    </div>
    
    <!-- XSS Protection Alert -->
    <div class="alert alert-dark" role="alert">
      <i class="bi bi-shield-check"></i> 
      The system has implemented security measures to protect user data. All inputs are sanitized to prevent XSS attacks.
    </div>
    
    <div class="admin-dashboard">
      <div class="dashboard-row">
        <div class="dashboard-card user-info-card">
          <div class="card-header">
            <i class="bi bi-people-fill"></i>
            <h5>User Registration Info</h5>
          </div>
          <div class="card-body">
            <UserRegistrationInfo />
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
          </div>
          <div class="card-footer">
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
          </div>
          <div class="card-footer">
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
          </div>
          <div class="card-footer">
            <span class="action-button"><i class="bi bi-download"></i> Export Report</span>
          </div>
        </div>
      </div>
      
      <div class="dashboard-row">
        <div class="dashboard-card ratings-card full-width">
          <div class="card-header">
            <i class="bi bi-star-fill"></i>
            <h5>User Ratings Analysis</h5>
          </div>
          <div class="card-body">
            <p class="card-text">View and analyze user ratings for articles and forum posts</p>
            <RatingsAnalytics />
          </div>
          <div class="card-footer">
            <span class="data-count">{{ ratingCount }} ratings</span>
            <span class="action-button"><i class="bi bi-graph-up"></i> View Trends</span>
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
import { onMounted, onUnmounted, ref, computed } from 'vue'

// Data variables
const userCount = ref(0)
const ratingCount = ref(0)
const lastUpdateTime = ref('')

// Current time, updated every second
const currentTime = ref('')
const updateTimeInterval = setInterval(() => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('en-US')
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
    } catch (e) {
      console.error('Failed to parse ratings', e)
      ratingCount.value = 0
    }
  }
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
</script>

<style scoped>
.admin-container {
  padding: 25px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  margin: 20px auto;
  max-width: 1200px;
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
  padding: 15px 20px;
  background-color: #343a40;
  color: white;
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

.ratings-card .card-header {
  background-color: #343a40;
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
}
</style>


