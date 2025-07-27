<template>
  <div class="my-4">
    <h3>Analytics and Tables</h3>
    <p>Here is a sample user engagement table:</p>
    <table class="table table-striped">
      <thead>
        <tr>
          <th>User</th>
          <th>Posts</th>
          <th>Last Active</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(row, index) in data" :key="index">
          <td>{{ row.user }}</td>
          <td>{{ row.posts }}</td>
          <td>{{ row.lastActive }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const data = ref([
  { user: 'UserA', posts: 12, lastActive: '2025-07-12' },
  { user: 'UserB', posts: 5, lastActive: '2025-07-10' },
  { user: 'UserC', posts: 8, lastActive: '2025-07-09' }
])
</script>
