<template>
  <div>
    <nav class="navbar navbar-expand navbar-light bg-light px-3">
      <a class="navbar-brand" href="#">Psychological Support Platform</a>
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <router-link to="/" class="nav-link">Home</router-link>
          </li>
          <li v-if="isAuthenticated" class="nav-item">
            <router-link to="/about" class="nav-link">About Us</router-link>
          </li>
          <li v-if="!isAuthenticated" class="nav-item">
            <router-link to="/login" class="nav-link">Login</router-link>
          </li>
          <li v-if="!isAuthenticated" class="nav-item">
            <router-link to="/register" class="nav-link">Register</router-link>
          </li>
          <li v-if="user?.role === 'teenager'" class="nav-item">
            <router-link to="/teenager-centre" class="nav-link">Teenager Center</router-link>
          </li>
          <li v-if="user?.role === 'worker'" class="nav-item">
            <router-link to="/worker-centre" class="nav-link">Worker Center</router-link>
          </li>
          <li v-if="user?.role === 'admin'" class="nav-item">
            <router-link to="/admin-centre" class="nav-link">Admin Center</router-link>
          </li>
          <li v-if="isAuthenticated" class="nav-item">
            <a href="#" class="nav-link" @click.prevent="logout">Logout</a>
          </li>
        </ul>
      </div>
    </nav>
    
    <!-- Login status notification -->
    <div v-if="isAuthenticated && user" class="container mt-2">
      <div class="alert alert-info py-2 small">
        Currently logged in: {{ user.email }} ({{ getRoleName(user.role) }})
      </div>
    </div>
    
    <router-view />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const user = ref(null)
const router = useRouter()

// Computed property: check if user is authenticated
const isAuthenticated = computed(() => {
  return localStorage.getItem('isAuthenticated') === 'true' && user.value !== null
})

onMounted(() => {
  // Get user information
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      user.value = JSON.parse(userStr)
    } catch (e) {
      console.error('Failed to parse user information', e)
      // Clear invalid user data
      localStorage.removeItem('user')
      localStorage.removeItem('isAuthenticated')
    }
  }
})

// Get role name
function getRoleName(role) {
  const roleMap = {
    'teenager': 'Teenager',
    'worker': 'Worker',
    'admin': 'Administrator'
  }
  return roleMap[role] || role
}

// Logout function
function logout() {
  localStorage.removeItem('user')
  localStorage.removeItem('isAuthenticated')
  router.push('/login')
}
</script>

<style>
body {
  background-color: #f8f9fa;
}
</style>



