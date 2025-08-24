<template>
  <div class="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
    <div class="row w-100 justify-content-center">
      <div class="col-md-6 col-lg-4">
        <div class="card shadow-lg border-0">
          <div class="card-body p-5">
            <div class="text-center mb-4">
              <h1 class="fw-bold text-primary" id="register-title">Create Account</h1>
              <p class="text-muted">Join our mental health support community</p>
            </div>
            
            <div v-if="errorMessage" class="alert alert-danger" role="alert" aria-live="assertive">
              <i class="bi bi-exclamation-triangle" aria-hidden="true"></i>
              {{ errorMessage }}
            </div>
            <div v-if="successMessage" class="alert alert-success" role="alert" aria-live="polite">
              <i class="bi bi-check-circle" aria-hidden="true"></i>
              {{ successMessage }}
            </div>
            
            <form @submit.prevent="register" role="form" aria-labelledby="register-title" novalidate>
              <div class="mb-3">
                <label for="username" class="form-label">Username <span class="text-danger" aria-label="required">*</span></label>
                <input 
                  type="text" 
                  class="form-control" 
                  :class="{ 'is-invalid': usernameError }"
                  id="username" 
                  v-model="username" 
                  required
                  aria-describedby="username-error username-help"
                  @blur="validateUsername"
                  @input="clearUsernameError"
                  autocomplete="username"
                  placeholder="Please enter your username"
                >
                <div id="username-help" class="form-text">Choose a unique username (3-20 characters)</div>
                <div v-if="usernameError" id="username-error" class="invalid-feedback" role="alert">
                  {{ usernameError }}
                </div>
              </div>
              
              <div class="mb-3">
                <label for="age" class="form-label">Age <span class="text-danger" aria-label="required">*</span></label>
                <input 
                  type="number" 
                  class="form-control" 
                  :class="{ 'is-invalid': ageError }"
                  id="age" 
                  v-model="age" 
                  min="13" 
                  max="120" 
                  required
                  aria-describedby="age-error age-help"
                  @blur="validateAge"
                  @input="clearAgeError"
                  placeholder="Please enter your age"
                >
                <div id="age-help" class="form-text">Must be between 13 and 120 years old</div>
                <div v-if="ageError" id="age-error" class="invalid-feedback" role="alert">
                  {{ ageError }}
                </div>
              </div>
              
              <div class="mb-3">
                <label for="email" class="form-label">Email <span class="text-danger" aria-label="required">*</span></label>
                <input 
                  type="email" 
                  class="form-control" 
                  :class="{ 'is-invalid': emailError }"
                  id="email" 
                  v-model="email" 
                  required
                  aria-describedby="email-error email-help"
                  @blur="validateEmail"
                  @input="clearEmailError"
                  autocomplete="email"
                  placeholder="Please enter your email address"
                >
                <div id="email-help" class="form-text">We'll use this for account verification and notifications</div>
                <div v-if="emailError" id="email-error" class="invalid-feedback" role="alert">
                  {{ emailError }}
                </div>
              </div>
              
              <div class="mb-3">
                <label for="role" class="form-label">Select Role <span class="text-danger" aria-label="required">*</span></label>
                <select 
                  class="form-select" 
                  :class="{ 'is-invalid': roleError }"
                  id="role" 
                  v-model="role" 
                  required
                  aria-describedby="role-error role-help"
                  @change="validateRole"
                >
                  <option value="" disabled>Please select a role</option>
                  <option value="teenager">Teenager</option>
                  <option value="worker">Worker</option>
                  <option value="admin">Administrator</option>
                </select>
                <div id="role-help" class="form-text">Choose the role that best describes you</div>
                <div v-if="roleError" id="role-error" class="invalid-feedback" role="alert">
                  {{ roleError }}
                </div>
              </div>
              
              <div class="mb-3">
                <label for="password" class="form-label">Password <span class="text-danger" aria-label="required">*</span></label>
                <div class="input-group">
                  <input 
                    :type="showPassword ? 'text' : 'password'" 
                    class="form-control" 
                    :class="{ 'is-invalid': passwordError }"
                    id="password" 
                    v-model="password" 
                    required
                    aria-describedby="password-error password-help password-toggle"
                    @blur="validatePassword"
                    @input="clearPasswordError"
                    autocomplete="new-password"
                    placeholder="Please enter your password"
                  >
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary" 
                    id="password-toggle"
                    @click="togglePasswordVisibility"
                    :aria-label="showPassword ? 'Hide password' : 'Show password'"
                    tabindex="0"
                  >
                    <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" aria-hidden="true"></i>
                  </button>
                </div>
                <div id="password-help" class="form-text">Must be at least 6 characters long</div>
                <div v-if="passwordError" id="password-error" class="invalid-feedback" role="alert">
                  {{ passwordError }}
                </div>
              </div>
              
              <div class="mb-4">
                <label for="confirmPassword" class="form-label">Confirm Password <span class="text-danger" aria-label="required">*</span></label>
                <div class="input-group">
                  <input 
                    :type="showConfirmPassword ? 'text' : 'password'" 
                    class="form-control" 
                    :class="{ 'is-invalid': confirmPasswordError }"
                    id="confirmPassword" 
                    v-model="confirmPassword" 
                    required
                    aria-describedby="confirm-password-error confirm-password-help confirm-password-toggle"
                    @blur="validateConfirmPassword"
                    @input="clearConfirmPasswordError"
                    autocomplete="new-password"
                    placeholder="Please enter your password again"
                  >
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary" 
                    id="confirm-password-toggle"
                    @click="toggleConfirmPasswordVisibility"
                    :aria-label="showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'"
                    tabindex="0"
                  >
                    <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'" aria-hidden="true"></i>
                  </button>
                </div>
                <div id="confirm-password-help" class="form-text">Re-enter your password to confirm</div>
                <div v-if="confirmPasswordError" id="confirm-password-error" class="invalid-feedback" role="alert">
                  {{ confirmPasswordError }}
                </div>
              </div>
              
              <button 
                type="submit" 
                class="btn btn-primary w-100 mb-3" 
                :disabled="isLoading || !isFormValid"
                :aria-describedby="isLoading ? 'loading-status' : ''"
              >
                <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                {{ isLoading ? 'Registering...' : 'Register' }}
              </button>
              
              <div v-if="isLoading" id="loading-status" class="visually-hidden" aria-live="polite">
                Creating your account, please wait...
              </div>
              
              <div class="text-center">
                <span class="text-muted">or</span>
              </div>
              
              <button 
                type="button" 
                class="btn btn-outline-danger w-100 mt-3" 
                @click="signUpWithGoogle"
                :disabled="isLoading"
                aria-describedby="google-signup-help"
              >
                <i class="bi bi-google me-2" aria-hidden="true"></i>
                Sign up with Google
              </button>
              <div id="google-signup-help" class="form-text text-center mt-2">Quick registration using your Google account</div>
            </form>
            
            <div class="text-center mt-4">
              <p class="text-muted">
                Already have an account? 
                <router-link to="/login" class="text-primary text-decoration-none">Login</router-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { registerUser, signInWithGoogle as firebaseGoogleSignIn } from '../firebase/auth.js'
import { FocusManager, AriaManager } from '../utils/accessibility.js'

const username = ref('')
const role = ref('')
const age = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const isLoading = ref(false)

const router = useRouter()
const focusManager = new FocusManager()

// Individual field error states
const usernameError = ref('')
const ageError = ref('')
const emailError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')
const roleError = ref('')

// Password visibility states
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Form validation computed property
const isFormValid = computed(() => {
  return username.value && 
         age.value && 
         email.value && 
         password.value && 
         confirmPassword.value && 
         role.value &&
         !usernameError.value &&
         !ageError.value &&
         !emailError.value &&
         !passwordError.value &&
         !confirmPasswordError.value &&
         !roleError.value
})

// Validation functions
function validateUsername() {
  if (!username.value) {
    usernameError.value = 'Username is required'
  } else if (username.value.length < 3) {
    usernameError.value = 'Username must be at least 3 characters long'
  } else if (username.value.length > 20) {
    usernameError.value = 'Username must be no more than 20 characters long'
  } else {
    usernameError.value = ''
  }
}

function validateAge() {
  if (!age.value) {
    ageError.value = 'Age is required'
  } else if (age.value < 13) {
    ageError.value = 'Age must be at least 13'
  } else if (age.value > 120) {
    ageError.value = 'Age must be no more than 120'
  } else {
    ageError.value = ''
  }
}

function validateEmail() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.value) {
    emailError.value = 'Email is required'
  } else if (!emailRegex.test(email.value)) {
    emailError.value = 'Please enter a valid email address'
  } else {
    emailError.value = ''
  }
}

function validatePassword() {
  if (!password.value) {
    passwordError.value = 'Password is required'
  } else if (password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters long'
  } else {
    passwordError.value = ''
  }
}

function validateConfirmPassword() {
  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Please confirm your password'
  } else if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Passwords do not match'
  } else {
    confirmPasswordError.value = ''
  }
}

function validateRole() {
  if (!role.value) {
    roleError.value = 'Please select a role'
  } else {
    roleError.value = ''
  }
}

// Clear error functions
function clearUsernameError() {
  if (usernameError.value) usernameError.value = ''
}

function clearAgeError() {
  if (ageError.value) ageError.value = ''
}

function clearEmailError() {
  if (emailError.value) emailError.value = ''
}

function clearPasswordError() {
  if (passwordError.value) passwordError.value = ''
}

function clearConfirmPasswordError() {
  if (confirmPasswordError.value) confirmPasswordError.value = ''
}

// Password visibility toggle functions
function togglePasswordVisibility() {
  showPassword.value = !showPassword.value
}

function toggleConfirmPasswordVisibility() {
  showConfirmPassword.value = !showConfirmPassword.value
}

async function register() {
  // Clear previous messages
  errorMessage.value = ''
  successMessage.value = ''
  isLoading.value = true
  
  // Validate all fields
  validateUsername()
  validateAge()
  validateEmail()
  validatePassword()
  validateConfirmPassword()
  validateRole()
  
  // Check if form is valid
  if (!isFormValid.value) {
    errorMessage.value = 'Please correct the errors above'
    AriaManager.announce('Please correct the form errors', 'assertive')
    isLoading.value = false
    
    // Focus on first error field
    nextTick(() => {
      const firstErrorField = document.querySelector('.is-invalid')
      if (firstErrorField) {
        firstErrorField.focus()
      }
    })
    return
  }
  
  const userData = {
    username: username.value,
    age: parseInt(age.value),
    email: email.value,
    role: role.value
  }

  try {
    // Try Firebase registration first
    const firebaseResult = await registerUser(email.value, password.value, userData)
    
    if (firebaseResult.success) {
      // Store authentication status and user information
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('user', JSON.stringify({
        uid: firebaseResult.user.uid,
        username: userData.username,
        email: userData.email,
        role: userData.role
      }))
      
      successMessage.value = 'Registration successful! Redirecting to your dashboard...'
      AriaManager.announce('Registration successful! Redirecting to dashboard...', 'polite')
      
      // Clear form
      username.value = ''
      age.value = ''
      email.value = ''
      password.value = ''
      confirmPassword.value = ''
      role.value = ''
      
      // Clear all errors
      usernameError.value = ''
      ageError.value = ''
      emailError.value = ''
      passwordError.value = ''
      confirmPasswordError.value = ''
      roleError.value = ''
      
      // Delay redirect to allow user to see success message
      setTimeout(() => {
        redirectUser(userData)
      }, 1500)
      
      return
    } else {
      errorMessage.value = firebaseResult.error || 'Registration failed'
      AriaManager.announce('Registration failed: ' + errorMessage.value, 'assertive')
      // If Firebase registration fails, fall back to local storage
      registerWithLocalStorage(userData)
    }
    
  } catch (error) {
    console.error('Firebase registration error:', error)
    errorMessage.value = 'Registration failed. Please try again.'
    AriaManager.announce('Registration failed. Please try again.', 'assertive')
    // Fallback to local storage registration
    registerWithLocalStorage(userData)
  } finally {
    isLoading.value = false
  }
}

// Local storage registration fallback
function registerWithLocalStorage(userData) {
  const newUser = {
    ...userData,
    password: password.value
  }

  // Store user information and authentication status
  localStorage.setItem('user', JSON.stringify(newUser))
  localStorage.setItem('isAuthenticated', 'true')
  
  // Add registration date
  newUser.registrationDate = new Date().toLocaleDateString()
  
  // Store user in the users list for persistence
  let usersList = []
  const existingUsers = localStorage.getItem('registeredUsers')
  if (existingUsers) {
    try {
      usersList = JSON.parse(existingUsers)
    } catch (e) {
      console.error('Failed to parse existing users', e)
    }
  }
  
  // Check if user with same email already exists
  const existingUserIndex = usersList.findIndex(u => u.email === newUser.email)
  if (existingUserIndex >= 0) {
    errorMessage.value = 'User with this email already exists'
    return
  }
  
  // Add new user
  usersList.push(newUser)
  
  // Save updated users list
  localStorage.setItem('registeredUsers', JSON.stringify(usersList))
  
  // Display success message
  successMessage.value = 'Registration successful! Redirecting to your dashboard...'
  
  // Delay redirect to allow user to see success message
  setTimeout(() => {
    redirectUser(userData)
  }, 1500)
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

// Google Sign Up
async function signUpWithGoogle() {
  isLoading.value = true
  errorMessage.value = ''
  
  try {
    AriaManager.announce('Signing up with Google...', 'polite')
    const result = await firebaseGoogleSignIn()
    
    if (result.success) {
      localStorage.setItem('isAuthenticated', 'true')
      localStorage.setItem('user', JSON.stringify({
        uid: result.user.uid,
        username: result.user.displayName || result.user.email.split('@')[0],
        email: result.user.email,
        role: 'teenager' // Default role for Google sign-up
      }))
      
      successMessage.value = 'Google sign-up successful! Redirecting to your dashboard...'
      AriaManager.announce('Google sign-up successful! Redirecting...', 'polite')
      
      setTimeout(() => {
        router.push('/teenager-centre')
      }, 1500)
    } else {
      errorMessage.value = result.error || 'Google sign-up failed'
      AriaManager.announce('Google sign-up failed: ' + errorMessage.value, 'assertive')
    }
  } catch (error) {
    console.error('Google sign-up error:', error)
    errorMessage.value = 'Google sign-up failed. Please try again.'
    AriaManager.announce('Google sign-up failed. Please try again.', 'assertive')
  } finally {
    isLoading.value = false
  }
}

// Initialize accessibility features on component mount
onMounted(() => {
  // Set up keyboard shortcuts
  const handleKeydown = (event) => {
    // Alt + R to focus on register button
    if (event.altKey && event.key === 'r') {
      event.preventDefault()
      const registerButton = document.querySelector('button[type="submit"]')
      if (registerButton && !registerButton.disabled) {
        registerButton.focus()
      }
    }
    
    // Alt + G for Google sign-up
    if (event.altKey && event.key === 'g') {
      event.preventDefault()
      const googleButton = document.querySelector('button[type="button"]')
      if (googleButton && !googleButton.disabled) {
        googleButton.focus()
        googleButton.click()
      }
    }
  }
  
  document.addEventListener('keydown', handleKeydown)
  
  // Cleanup on unmount
  return () => {
    document.removeEventListener('keydown', handleKeydown)
  }
})
</script>

