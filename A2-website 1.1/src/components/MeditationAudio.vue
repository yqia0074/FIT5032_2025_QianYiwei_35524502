<template>
  <div>
    <h4>Meditation Audio (5 min)</h4>
    <audio controls class="w-100">
      <source src="/src/assets/sample-audio.mp3" type="audio/mpeg" />
      Your browser does not support the audio element.
    </audio>
    <div class="mt-3">
      <h5>Recommended Micro-Courses</h5>
      <ul>
        <li v-for="course in courses" :key="course.id">
          {{ course.title }} — {{ course.duration }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import courses from '/src/assets/courses.json'
</script>
