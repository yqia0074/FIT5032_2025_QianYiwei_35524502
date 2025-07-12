<template>
  <div class="container mt-5">
    <h2 class="text-center">Login / Register</h2>
    <form @submit.prevent="handleSubmit">
      <div class="mb-3">
        <label>Email</label>
        <input type="email" v-model="email" class="form-control" required />
      </div>
      <div class="mb-3">
        <label>Password</label>
        <input type="password" v-model="password" class="form-control" minlength="6" required />
      </div>
      <div class="mb-3">
        <label>Role</label>
        <select v-model="role" class="form-control" required>
          <option value="teenager">Teenager</option>
          <option value="worker">Worker</option>
        </select>
      </div>
      <button type="submit" class="btn btn-primary w-100">Submit</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const role = ref('')
const router = useRouter()

function handleSubmit() {
  const user = { email: email.value, password: password.value, role: role.value }
  localStorage.setItem('user', JSON.stringify(user))
  if (role.value === 'teenager') {
    router.push('/teenager')
  } else {
    router.push('/worker')
  }
}
</script>
