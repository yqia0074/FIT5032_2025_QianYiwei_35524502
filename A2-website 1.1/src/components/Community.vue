<template>
  <div class="my-4">
    <h3>Community</h3>
    <ul>
      <li v-for="(post, index) in posts" :key="index">
        <strong>{{ post.user }}</strong>: {{ post.content }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const posts = ref([
  { user: 'UserA', content: 'Today I feel much better after meditation.' },
  { user: 'UserB', content: 'Work was stressful, but I went for a walk.' },
  { user: 'UserC', content: 'I tried a new breathing technique today.' }
])
</script>


