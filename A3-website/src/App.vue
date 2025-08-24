<template>
  <div>
    <!-- Skip to main content link -->
    <a href="#main-content" class="skip-link" @focus="onSkipLinkFocus" @blur="onSkipLinkBlur">Skip to main content</a>
    
    <nav class="navbar navbar-expand-md navbar-light bg-light px-3 fixed-top" role="navigation" aria-label="Main navigation">
      <router-link to="/" class="navbar-brand" aria-label="Mental Health Support Platform - Home">Mental Health Support Platform</router-link>
      
      <!-- Offline Status Indicator in Navbar -->
      <div class="offline-indicator" :class="{ 'offline': !isOnline, 'online': isOnline }" role="status" :aria-label="isOnline ? 'Currently online' : 'Currently offline'">
        <i :class="isOnline ? 'bi bi-wifi' : 'bi bi-wifi-off'" :aria-hidden="true"></i>
        <span class="d-none d-md-inline">{{ isOnline ? 'Online' : 'Offline' }}</span>
      </div>
      
      <button 
        class="navbar-toggler" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarNav" 
        aria-controls="navbarNav" 
        :aria-expanded="navbarExpanded"
        @click="toggleNavbar"
        aria-label="Toggle navigation menu">
        <span class="navbar-toggler-icon" aria-hidden="true"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav" :aria-hidden="!navbarExpanded">
        <ul class="navbar-nav ms-auto" role="menubar">
          <li class="nav-item" role="none">
            <router-link to="/" class="nav-link" role="menuitem" aria-current="page">Home</router-link>
          </li>
          <li v-if="isAuthenticated" class="nav-item" role="none">
            <router-link to="/about" class="nav-link" role="menuitem">About Us</router-link>
          </li>
          <li v-if="!isAuthenticated" class="nav-item" role="none">
            <router-link to="/login" class="nav-link" role="menuitem">Login</router-link>
          </li>
          <li v-if="!isAuthenticated" class="nav-item" role="none">
            <router-link to="/register" class="nav-link" role="menuitem">Register</router-link>
          </li>
          <li v-if="user?.role === 'teenager'" class="nav-item" role="none">
            <router-link to="/teenager-centre" class="nav-link" role="menuitem">Support Center</router-link>
          </li>
          <li v-if="user?.role === 'worker'" class="nav-item" role="none">
            <router-link to="/worker-centre" class="nav-link" role="menuitem">Professional Center</router-link>
          </li>
          <li v-if="user?.role === 'admin'" class="nav-item" role="none">
            <router-link to="/admin-centre" class="nav-link" role="menuitem">Admin Dashboard</router-link>
          </li>
          <li v-if="isAuthenticated" class="nav-item" role="none">
            <router-link to="/offline-manager" class="nav-link" role="menuitem">
              <i class="bi bi-cloud-arrow-down" aria-hidden="true"></i>
              <span class="d-none d-lg-inline">Offline</span>
            </router-link>
          </li>
          <li v-if="isAuthenticated" class="nav-item" role="none">
            <a href="#" class="nav-link" @click.prevent="logout" role="menuitem" aria-label="Logout from your account">Logout</a>
          </li>
        </ul>
      </div>
    </nav>
    
    <!-- Login status notification -->
    <div v-if="isAuthenticated && user" class="container mt-2">
      <div class="alert alert-info py-2 small" role="status" aria-live="polite">
        <i class="bi bi-person-check" aria-hidden="true"></i> 
        Currently logged in: {{ user.email }} ({{ getRoleName(user.role) }})
      </div>
    </div>
    
    <main class="content-container" id="main-content" role="main">
      <router-view />
    </main>
    
    <!-- ARIA live region for announcements -->
    <div id="aria-live-announcer" aria-live="polite" aria-atomic="true" class="sr-only"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { onAuthStateChange, getCurrentUserData, logoutUser } from './firebase/auth.js'
import { initializeAccessibility, focusManager, keyboardNav, AriaManager } from './utils/accessibility.js'

const user = ref(null)
const router = useRouter()
const isOnline = ref(navigator.onLine)
const navbarExpanded = ref(false)
let authUnsubscribe = null

// Computed property: check if user is authenticated
const isAuthenticated = computed(() => {
  return localStorage.getItem('isAuthenticated') === 'true' && user.value !== null
})

// Online/Offline event handlers
const handleOnline = () => {
  isOnline.value = true
  console.log('Application is now online')
  // Show notification
  if (isAuthenticated.value) {
    showConnectionNotification('You are back online!', 'success')
  }
}

const handleOffline = () => {
  isOnline.value = false
  console.log('Application is now offline')
  // Show notification
  if (isAuthenticated.value) {
    showConnectionNotification('You are now offline. Some features may be limited.', 'warning')
  }
}

// Show connection status notification
function showConnectionNotification(message, type) {
  // Announce to screen readers
  AriaManager.announce(message, 'assertive')
  
  // Create notification element
  const notification = document.createElement('div')
  notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`
  notification.style.cssText = 'top: 80px; right: 20px; z-index: 9999; max-width: 300px;'
  notification.setAttribute('role', 'status')
  notification.setAttribute('aria-live', 'polite')
  notification.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close notification"></button>
  `
  
  document.body.appendChild(notification)
  
  // Auto remove after 5 seconds
  setTimeout(() => {
    if (notification.parentNode) {
      notification.parentNode.removeChild(notification)
    }
  }, 5000)
}

onMounted(() => {
  // Initialize accessibility features
  initializeAccessibility()
  
  // Setup keyboard shortcuts
  setupKeyboardShortcuts()
  
  // Set up Firebase auth state listener
  authUnsubscribe = onAuthStateChange(async (firebaseUser) => {
    if (firebaseUser) {
      // User is signed in with Firebase
      try {
        const userData = await getCurrentUserData(firebaseUser.uid)
        if (userData.success) {
          user.value = {
            uid: firebaseUser.uid,
            username: userData.userData.username,
            email: userData.userData.email,
            role: userData.userData.role
          }
          localStorage.setItem('isAuthenticated', 'true')
          localStorage.setItem('user', JSON.stringify(user.value))
        }
      } catch (error) {
        console.error('Error getting user data:', error)
      }
    } else {
      // No Firebase user, check localStorage for local auth
      const userStr = localStorage.getItem('user')
      if (userStr) {
        try {
          const localUser = JSON.parse(userStr)
          // Only use local user if no Firebase UID (local auth)
          if (!localUser.uid) {
            user.value = localUser
          } else {
            // Firebase user logged out, clear local storage
            user.value = null
            localStorage.removeItem('user')
            localStorage.removeItem('isAuthenticated')
          }
        } catch (e) {
          console.error('Failed to parse user information', e)
          localStorage.removeItem('user')
          localStorage.removeItem('isAuthenticated')
        }
      }
    }
  })
  
  // Add online/offline event listeners
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})

onUnmounted(() => {
  // Remove event listeners
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
  
  // Unsubscribe from Firebase auth state changes
  if (authUnsubscribe) {
    authUnsubscribe()
  }
})

// Get role name
function getRoleName(role) {
  const roleMap = {
    'teenager': 'Teenager User',
    'worker': 'Professional User',
    'admin': 'Administrator'
  }
  return roleMap[role] || role
}

// Logout function
async function logout() {
  try {
    // Try Firebase logout first
    const result = await logoutUser()
    if (result.success) {
      console.log('Firebase logout successful')
    }
  } catch (error) {
    console.error('Firebase logout error:', error)
  }
  
  // Always clear local storage and redirect
  localStorage.removeItem('user')
  localStorage.removeItem('isAuthenticated')
  user.value = null
  AriaManager.announce('You have been logged out successfully')
  router.push('/login')
}

function toggleNavbar() {
  navbarExpanded.value = !navbarExpanded.value
}

function onSkipLinkFocus() {
  document.querySelector('.skip-link').style.top = '0'
}

function onSkipLinkBlur() {
  document.querySelector('.skip-link').style.top = '-40px'
}

function setupKeyboardShortcuts() {
  // Alt + / to focus search (if exists)
  keyboardNav.addShortcut('/', () => {
    const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]')
    if (searchInput) {
      searchInput.focus()
      AriaManager.announce('Search field focused')
    }
  }, { altKey: true })
  
  // Alt + M to focus main navigation
  keyboardNav.addShortcut('m', () => {
    const mainNav = document.querySelector('.navbar-nav')
    if (mainNav) {
      const firstLink = mainNav.querySelector('a, button')
      if (firstLink) {
        firstLink.focus()
        AriaManager.announce('Main navigation focused')
      }
    }
  }, { altKey: true })
}
</script>

<style>
body {
  background-color: #f8f9fa;
  padding-top: 70px; /* Add padding to prevent content from being hidden behind fixed navbar */
  min-height: 100vh;
}

.content-container {
  padding: 0 15px 30px;
  max-width: 1200px;
  margin: 0 auto;
}

.alert {
  margin-bottom: 1rem;
  border-radius: 0.25rem;
}

.alert i {
  margin-right: 0.5rem;
}

/* Offline Status Indicator Styles */
.offline-indicator {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  font-weight: 500;
  transition: all 0.3s ease;
  margin-right: 10px;
}

.offline-indicator i {
  margin-right: 4px;
  font-size: 1rem;
}

.offline-indicator.online {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.offline-indicator.offline {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

/* Connection notification styles */
.alert.position-fixed {
  animation: slideInRight 0.3s ease-out;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
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
  z-index: 10000;
  border-radius: 0 0 4px 4px;
  transition: top 0.3s;
}

.skip-link:focus {
  top: 0;
  color: #fff;
}

/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* Focus indicators */
*:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
}

.nav-link:focus,
.navbar-brand:focus,
button:focus {
  outline: 2px solid #007bff;
  outline-offset: 2px;
  background-color: rgba(0, 123, 255, 0.1);
}

@media (max-width: 768px) {
  body {
    padding-top: 60px; /* Slightly less padding for mobile devices */
  }
  
  .offline-indicator {
    font-size: 0.75rem;
    padding: 2px 6px;
  }
  
  .offline-indicator span {
    display: none !important;
  }
  
  .alert.position-fixed {
    right: 10px !important;
    max-width: 250px !important;
    font-size: 0.85rem;
  }
}
</style>



