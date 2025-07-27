<template>
  <div class="container mt-4">
    <h2>Welcome to Your User Centre</h2>
    <p>Here you can access courses, articles, and your personalized zones.</p>

    <h4>🔗 Quick Links</h4>
    <div class="d-flex gap-3">
      <router-link to="/teenager" class="btn btn-outline-primary">Teenager Wall</router-link>
      <router-link to="/worker" class="btn btn-outline-success">Worker Zone</router-link>
    </div>

    <h5 class="mt-4">🌿 Recommended Courses</h5>
    <ul>
      <li v-for="course in courses" :key="course.id">
        {{ course.title }} — {{ course.duration }}
      </li>
    </ul>

    <h5 class="mt-4">📰 Articles</h5>
    <ul>
      <li v-for="article in articles" :key="article.id">
        <a :href="article.url" target="_blank">{{ article.title }}</a> — by {{ article.author }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import courses from '../assets/courses.json'
import articles from '../assets/articles.json'
</script>

