<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card shadow">
          <div class="card-body">
            <h1 class="card-title text-center mb-4">Login to Your Account</h1>
            
            <!-- Error message with proper ARIA attributes -->
            <div v-if="errorMessage" 
                 class="alert alert-danger" 
                 role="alert" 
                 aria-live="polite"
                 :id="'error-' + Date.now()">
              <i class="bi bi-exclamation-triangle" aria-hidden="true"></i>
              {{ errorMessage }}
            </div>
            
            <form @submit.prevent="login" novalidate>
              <fieldset :disabled="isLoading">
                <legend class="sr-only">Login Form</legend>
                
                <div class="mb-3">
                  <label for="email" class="form-label">Email Address *</label>
                  <input 
                    v-model="email" 
                    type="email" 
                    id="email" 
                    class="form-control"
                    :class="{ 'is-invalid': emailError }"
                    placeholder="Enter your email address" 
                    required
                    autocomplete="email"
                    :aria-describedby="emailError ? 'email-error' : null"
                    @blur="validateEmail">
                  <div v-if="emailError" id="email-error" class="invalid-feedback" role="alert">
                    {{ emailError }}
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="password" class="form-label">Password *</label>
                  <div class="input-group">
                    <input 
                      v-model="password" 
                      :type="showPassword ? 'text' : 'password'" 
                      id="password" 
                      class="form-control"
                      placeholder="Enter your password" 
                      required
                      autocomplete="current-password"
                      :aria-describedby="'password-toggle'">
                    <button 
                      type="button" 
                      class="btn btn-outline-secondary" 
                      id="password-toggle"
                      @click="togglePasswordVisibility"
                      :aria-label="showPassword ? 'Hide password' : 'Show password'">
                      <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" aria-hidden="true"></i>
                    </button>
                  </div>
                </div>
                
                <div class="d-grid gap-2">
                  <button type="submit" class="btn btn-primary" :disabled="isLoading || !isFormValid">
                    <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {{ isLoading ? 'Signing in...' : 'Sign In' }}
                  </button>
                  
                  <button type="button" @click="signInWithGoogle" class="btn btn-outline-danger" :disabled="isLoading">
                    <i class="bi bi-google" aria-hidden="true"></i> Sign in with Google
                  </button>
                </div>
              </fieldset>
            </form>
            
            <hr class="my-4">
            
            <div class="text-center">
              <p class="mb-2">
                <router-link to="/register" class="text-decoration-none">Don't have an account? Sign up</router-link>
              </p>
              <p class="mb-0">
                <button type="button" @click="showResetPassword" class="btn btn-link p-0 text-decoration-none">Forgot your password?</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
      
    
    <!-- Password Reset Modal with proper accessibility -->
    <div v-if="showResetModal" 
         class="modal d-block" 
         tabindex="-1" 
         role="dialog" 
         aria-labelledby="reset-modal-title"
         aria-modal="true"
         @keydown.esc="closeResetModal">
      <div class="modal-dialog" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 id="reset-modal-title" class="modal-title">Reset Your Password</h5>
            <button 
              type="button" 
              class="btn-close" 
              @click="closeResetModal"
              aria-label="Close password reset dialog">
            </button>
          </div>
          <div class="modal-body">
            <p class="mb-3">Enter your email address and we'll send you a link to reset your password.</p>
            <form @submit.prevent="sendPasswordReset">
              <div class="mb-3">
                <label for="resetEmail" class="form-label">Email Address *</label>
                <input 
                  v-model="resetEmail" 
                  type="email" 
                  id="resetEmail" 
                  class="form-control"
                  :class="{ 'is-invalid': resetEmailError }"
                  placeholder="Enter your email address"
                  required
                  autocomplete="email"
                  :aria-describedby="resetEmailError ? 'reset-email-error' : null">
                <div v-if="resetEmailError" id="reset-email-error" class="invalid-feedback" role="alert">
                  {{ resetEmailError }}
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeResetModal">Cancel</button>
            <button 
              type="button" 
              class="btn btn-primary" 
              @click="sendPasswordReset" 
              :disabled="isLoading || !resetEmail">
              <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              {{ isLoading ? 'Sending...' : 'Send Reset Email' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { loginUser, signInWithGoogle as firebaseGoogleSignIn, resetPassword, onAuthStateChange, getCurrentUserData } from '../firebase/auth.js'
import { focusManager, AriaManager } from '../utils/accessibility.js'

const email = ref('')
const password = ref('')
const emailError = ref('')
const errorMessage = ref('')
const isLoading = ref(false)
const showResetModal = ref(false)
const resetEmail = ref('')
const resetEmailError = ref('')
const showPassword = ref(false)
const router = useRouter()

// Computed properties for form validation
const isFormValid = computed(() => {
  return email.value && password.value && !emailError.value
})

// Check if user is already authenticated
onMounted(() => {
  const unsubscribe = onAuthStateChange(async (user) => {
    if (user) {
      // User is signed in, redirect to appropriate page
      const userData = await getCurrentUserData(user.uid)
      if (userData.success) {
        redirectUser(userData.userData)
      }
    }
  })
  
  // Cleanup subscription on unmount
  return () => unsubscribe()
})

// Hardcoded credentials
const validCredentials = [
  { email: 'admin@example.com', password: 'admin123', role: 'admin' },
  { email: 'teenager@example.com', password: 'teen123', role: 'teenager' },
  { email: 'worker@example.com', password: 'work123', role: 'worker' }
]

async function login() {
  // Clear previous error messages
  errorMessage.value = ''
  isLoading.value = true
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    errorMessage.value = 'Please enter a valid email address'
    isLoading.value = false
    return
  }
  
  try {
    // Try Firebase authentication first
    const firebaseResult = await loginUser(email.value, password.value)
    
    if (firebaseResult.success) {
      // Get user data from Firestore
      const userData = await getCurrentUserData(firebaseResult.user.uid)
      if (userData.success) {
        // Store authentication status and user information
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('user', JSON.stringify({
          uid: firebaseResult.user.uid,
          username: userData.userData.username,
          email: userData.userData.email,
          role: userData.userData.role
        }))
        
        redirectUser(userData.userData)
        return
      }
    }
    
    // Fallback to local authentication if Firebase fails
    await loginWithLocalCredentials()
    
  } catch (error) {
    console.error('Firebase login error:', error)
    // Fallback to local authentication
    await loginWithLocalCredentials()
  } finally {
    isLoading.value = false
  }
}

// Local authentication fallback
function loginWithLocalCredentials() {
  // First check hardcoded credentials
  let user = validCredentials.find(
    user => user.email === email.value && user.password === password.value
  )
  
  // If not found in hardcoded credentials, check registered users
  if (!user) {
    const registeredUsers = localStorage.getItem('registeredUsers')
    if (registeredUsers) {
      try {
        const usersList = JSON.parse(registeredUsers)
        user = usersList.find(
          u => u.email === email.value && u.password === password.value
        )
      } catch (e) {
        console.error('Failed to parse registered users', e)
      }
    }
  }

  if (user) {
    // Store authentication status and user information
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('user', JSON.stringify({
      username: user.username || email.value,
      email: email.value,
      role: user.role
    }))
    
    redirectUser(user)
  } else {
    errorMessage.value = 'Incorrect email or password'
  }
}

// Redirect user based on role
function redirectUser(userData) {
  if (userData.role === 'teenager') {
    router.push('/teenager-centre')
  } else if (userData.role === 'worker') {
    router.push('/worker-centre')
  } else if (userData.role === 'admin') {
    router.push('/admin-centre')
  }
}

// Google Sign In
async function signInWithGoogle() {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    const result = await firebaseGoogleSignIn()
    
    if (result.success) {
      const userData = await getCurrentUserData(result.user.uid)
      if (userData.success) {
        localStorage.setItem('isAuthenticated', 'true')
        localStorage.setItem('user', JSON.stringify({
          uid: result.user.uid,
          username: userData.userData.username,
          email: userData.userData.email,
          role: userData.userData.role
        }))
        
        redirectUser(userData.userData)
      }
    } else {
      errorMessage.value = result.error || 'Google sign-in failed'
    }
  } catch (error) {
    console.error('Google sign-in error:', error)
    errorMessage.value = 'Google sign-in failed'
  } finally {
    isLoading.value = false
  }
}

// Form validation functions
function validateEmail() {
  emailError.value = ''
  if (!email.value) {
    emailError.value = 'Email is required'
    return false
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    emailError.value = 'Please enter a valid email address'
    return false
  }
  
  return true
}

function validateResetEmail() {
  resetEmailError.value = ''
  if (!resetEmail.value) {
    resetEmailError.value = 'Email is required'
    return false
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(resetEmail.value)) {
    resetEmailError.value = 'Please enter a valid email address'
    return false
  }
  
  return true
}

// Toggle password visibility
function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
  AriaManager.announce(showPassword.value ? 'Password is now visible' : 'Password is now hidden')
}

// Show password reset modal with focus management
function showResetPassword() {
  resetEmail.value = email.value
  resetEmailError.value = ''
  showResetModal.value = true
  
  nextTick(() => {
    const modal = document.querySelector('.modal')
    if (modal) {
      focusManager.trapFocus(modal)
      const emailInput = document.getElementById('resetEmail')
      if (emailInput) {
        emailInput.focus()
      }
    }
  })
}

// Close reset modal
function closeResetModal() {
  showResetModal.value = false
  focusManager.releaseFocus()
  AriaManager.announce('Password reset dialog closed')
}

// Send password reset email
async function sendPasswordReset() {
  if (!validateResetEmail()) {
    return
  }
  
  isLoading.value = true
  
  try {
    const result = await resetPassword(resetEmail.value)
    
    if (result.success) {
      AriaManager.announce('Password reset email sent successfully', 'assertive')
      // Create success notification
      const notification = document.createElement('div')
      notification.className = 'alert alert-success position-fixed'
      notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;'
      notification.setAttribute('role', 'status')
      notification.innerHTML = `
        <i class="bi bi-check-circle" aria-hidden="true"></i>
        Password reset email sent! Please check your inbox.
      `
      document.body.appendChild(notification)
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification)
        }
      }, 5000)
      
      closeResetModal()
    } else {
      resetEmailError.value = result.error || 'Failed to send password reset email'
      AriaManager.announce('Failed to send password reset email', 'assertive')
    }
  } catch (error) {
    console.error('Password reset error:', error)
    resetEmailError.value = 'Failed to send password reset email'
    AriaManager.announce('Failed to send password reset email', 'assertive')
  } finally {
    isLoading.value = false
  }
}
</script>
