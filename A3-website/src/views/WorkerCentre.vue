<template>
  <div class="worker-container">
    <div class="worker-header">
      <div class="worker-title">
        <h2><i class="bi bi-briefcase-fill"></i> Worker Control Center</h2>
        <div class="worker-badge">Professional Service</div>
      </div>
      <p class="text-muted">This is a professional support center designed for workers, providing efficient work tools and resources.</p>
      
      <div class="system-status">
        <div class="status-indicator online">
          <i class="bi bi-circle-fill"></i> System Status: Running Normally
        </div>
        <div class="timestamp">{{ currentTime }}</div>
      </div>
    </div>
    
    <!-- XSS Protection Alert -->
    <div class="alert alert-primary" role="alert">
      <i class="bi bi-shield-lock"></i> 
      This system has implemented security measures to protect your data. Please report any suspicious activity immediately.
    </div>
    
    <!-- Modular Interface -->
    <WorkerModules />
  </div>
</template>

<script setup>
import WorkerModules from '../components/WorkerModules.vue'
import { onMounted, onUnmounted, ref } from 'vue'

// System status data
const currentTime = ref('')
const username = ref('')
const clockInterval = ref(null)

// Update time function
function updateClock() {
  const now = new Date()
  const options = { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit',
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    hour12: false
  }
  currentTime.value = now.toLocaleString('en-US', options)
}

// Security check
onMounted(() => {
  // Validate user role
  const userData = localStorage.getItem('user')
  if (userData) {
    const user = JSON.parse(userData)
    // Ensure only worker role can access
    if (user.role !== 'worker') {
      alert('Access denied: You do not have permission to view this page.')
      window.location.href = '/'
    }
    
    // Prevent XSS attacks
    username.value = sanitizeInput(user.username || user.email)
    console.log(`Worker center accessed by: ${username.value}`)
    
    // Start clock
    updateClock()
    clockInterval.value = setInterval(updateClock, 1000)
  } else {
    // Redirect unauthenticated users to login page
    alert('Please log in to access this page.')
    window.location.href = '/login'
  }
})

// Clean up timer when component is unmounted
onUnmounted(() => {
  if (clockInterval.value) {
    clearInterval(clockInterval.value)
  }
})

// Input sanitization function
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return ''
  }
  
  // Remove possible script tags
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+="[^"]*"/g, '')
  
  // Remove other potentially dangerous tags
  sanitized = sanitized.replace(/<\/?[^>]+(>|$)/g, '')
  
  return sanitized.trim()
}
</script>

<style scoped>
.worker-container {
  padding: 25px;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
  margin: 20px auto;
  max-width: 1100px;
  border-top: 5px solid #0d6efd;
}

.worker-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #dee2e6;
  position: relative;
}

.worker-title {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.worker-title h2 {
  margin: 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  color: #0d6efd;
}

.worker-title h2 i {
  margin-right: 10px;
}

.worker-badge {
  margin-left: 15px;
  padding: 5px 10px;
  background-color: #0d6efd;
  color: white;
  border-radius: 4px;
  font-size: 0.8rem;
  font-weight: 500;
}

.system-status {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.status-indicator {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
  font-weight: 500;
  font-size: 0.9rem;
}

.status-indicator i {
  font-size: 0.6rem;
  margin-right: 5px;
}

.status-indicator.online i {
  color: #28a745;
}

.timestamp {
  font-size: 0.85rem;
  color: #6c757d;
}

/* Responsive design */
@media (max-width: 768px) {
  .worker-header {
    flex-direction: column;
  }
  
  .system-status {
    position: static;
    margin-top: 15px;
    align-items: flex-start;
  }
}
</style>


