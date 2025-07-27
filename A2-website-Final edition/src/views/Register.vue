<template>
  <div class="container mt-5">
    <h2>Register</h2>
    <div v-if="errorMessage" class="alert alert-danger">
      {{ errorMessage }}
    </div>
    <div v-if="successMessage" class="alert alert-success">
      {{ successMessage }}
    </div>
    <form @submit.prevent="register">
      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="username" class="form-label">Username</label>
          <input v-model="username" type="text" id="username" placeholder="Please enter your username" class="form-control" required>
        </div>
        <div class="col-md-6 mb-3">
          <label for="age" class="form-label">Age</label>
          <input v-model="age" type="number" id="age" placeholder="Please enter your age" class="form-control" required min="1" max="120">
        </div>
      </div>
      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="email" class="form-label">Email</label>
          <input v-model="email" type="email" id="email" placeholder="Please enter your email address" class="form-control" required>
          <div v-if="emailError" class="text-danger mt-1 small">{{ emailError }}</div>
        </div>
        <div class="col-md-6 mb-3">
          <label for="role" class="form-label">Select Role</label>
          <select v-model="role" id="role" class="form-select" required>
            <option disabled value="">Please select a role</option>
            <option value="teenager">Teenager</option>
            <option value="worker">Worker</option>
            <option value="admin">Administrator</option>
          </select>
        </div>
      </div>
      <div class="row">
        <div class="col-md-6 mb-3">
          <label for="password" class="form-label">Password</label>
          <input v-model="password" type="password" id="password" placeholder="Please enter your password" class="form-control" required>
        </div>
        <div class="col-md-6 mb-3">
          <label for="confirmPassword" class="form-label">Confirm Password</label>
          <input v-model="confirmPassword" type="password" id="confirmPassword" placeholder="Please enter your password again" class="form-control" required>
        </div>
      </div>
      <button type="submit" class="btn btn-primary">Register</button>
      <router-link to="/login" class="btn btn-link">Already have an account? Login</router-link>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const age = ref('')
const email = ref('')
const emailError = ref('')
const password = ref('')
const confirmPassword = ref('')
const role = ref('')
const errorMessage = ref('')
const successMessage = ref('')
const router = useRouter()

function register() {
  // Clear previous messages
  errorMessage.value = ''
  successMessage.value = ''
  emailError.value = ''
  
  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    emailError.value = 'Please enter a valid email address'
    return
  }
  
  // Validate password match
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Passwords do not match'
    return
  }
  
  // Validate password strength
  if (password.value.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters long'
    return
  }
  
  const newUser = {
    username: username.value,
    age: age.value,
    email: email.value,
    password: password.value,
    role: role.value
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
    // Update existing user
    usersList[existingUserIndex] = newUser
  } else {
    // Add new user
    usersList.push(newUser)
  }
  
  // Save updated users list
  localStorage.setItem('registeredUsers', JSON.stringify(usersList))
  
  // Display success message
  successMessage.value = 'Registration successful! Redirecting to your dashboard...'
  
  // Delay redirect to allow user to see success message
  setTimeout(() => {
    if (role.value === 'teenager') {
      router.push('/teenager-centre')
    } else if (role.value === 'worker') {
      router.push('/worker-centre')
    } else if (role.value === 'admin') {
      router.push('/admin-centre')
    }
  }, 1500)
}
</script>

