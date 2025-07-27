<template>
  <div class="container mt-5">
    <h2>Login</h2>
    <div v-if="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>
    <form @submit.prevent="login">
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input v-model="email" type="email" id="email" placeholder="Please enter your email address" class="form-control" required>
      </div>
      <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input v-model="password" type="password" id="password" placeholder="Please enter your password" class="form-control" required>
      </div>
      <button type="submit" class="btn btn-primary">Login</button>
      <router-link to="/register" class="btn btn-link">No account? Register</router-link>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const errorMessage = ref('')
const router = useRouter()

// Hardcoded credentials
const validCredentials = [
  { email: 'admin@example.com', password: 'admin123', role: 'admin' },
  { email: 'teenager@example.com', password: 'teen123', role: 'teenager' },
  { email: 'worker@example.com', password: 'work123', role: 'worker' }
]

function login() {
  // Clear previous error messages
  errorMessage.value = ''
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    errorMessage.value = 'Please enter a valid email address'
    return
  }
  
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
      username: user.username || email.value, // Use username if available, otherwise email
      email: email.value,
      role: user.role
    }))
    
    // Redirect based on role
    if (user.role === 'teenager') {
      router.push('/teenager-centre')
    } else if (user.role === 'worker') {
      router.push('/worker-centre')
    } else if (user.role === 'admin') {
      router.push('/admin-centre')
    }
  } else {
    errorMessage.value = 'Incorrect email or password'
  }
}
</script>
