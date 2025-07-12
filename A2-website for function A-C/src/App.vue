
<template>
  <div>
    <nav class="navbar navbar-expand navbar-light bg-light px-3">
      <a class="navbar-brand" href="#">Psych Support</a>
      <div class="collapse navbar-collapse">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <router-link to="/" class="nav-link">Home</router-link>
          </li>
          <li v-if="user" class="nav-item">
            <a href="#" class="nav-link" @click="logout">Logout</a>
          </li>
        </ul>
      </div>
    </nav>
    <router-view />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const user = ref(null)

onMounted(() => {
  user.value = JSON.parse(localStorage.getItem('user'))
})

function logout() {
  localStorage.removeItem('user')
  location.reload()
}
</script>
