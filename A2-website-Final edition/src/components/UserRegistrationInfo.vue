<template>
  <div class="my-4">
    <h3>User Registration Information</h3>
    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th>Username</th>
            <th>Age</th>
            <th>Email</th>
            <th>Role</th>
            <th>Registration Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(user, index) in registeredUsers" :key="index">
            <td>{{ user.username }}</td>
            <td>{{ user.age }}</td>
            <td>{{ user.email }}</td>
            <td>{{ getRoleName(user.role) }}</td>
            <td>{{ user.registrationDate || 'N/A' }}</td>
          </tr>
          <tr v-if="registeredUsers.length === 0">
            <td colspan="5" class="text-center">No registered users found</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const registeredUsers = ref([])

// Get role name
function getRoleName(role) {
  const roleMap = {
    'teenager': 'Teenager',
    'worker': 'Worker',
    'admin': 'Administrator'
  }
  return roleMap[role] || role
}

onMounted(() => {
  loadRegisteredUsers()
})

// Load all registered users from localStorage
function loadRegisteredUsers() {
  // Clear the current list
  registeredUsers.value = []
  
  // Get registered users from localStorage
  const storedUsers = localStorage.getItem('registeredUsers')
  if (storedUsers) {
    try {
      const usersList = JSON.parse(storedUsers)
      registeredUsers.value = usersList
    } catch (e) {
      console.error('Failed to parse registered users', e)
    }
  }
  
  // If no registered users found, add some sample users for demo
  if (registeredUsers.value.length === 0) {
    registeredUsers.value.push(
      { username: 'JohnDoe', age: '25', email: 'john@example.com', role: 'worker', registrationDate: '2025-07-10' },
      { username: 'JaneSmith', age: '17', email: 'jane@example.com', role: 'teenager', registrationDate: '2025-07-09' },
      { username: 'AdminUser', age: '35', email: 'admin@example.com', role: 'admin', registrationDate: '2025-07-08' }
    )
  }
}
</script>