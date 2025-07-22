<template>
  <div class="my-4">
    <h3>Self-Help Tools</h3>
    <p>Quick Mood Tracker: How are you feeling today?</p>
    <button @click="updateMood('Happy')" class="btn btn-success me-2">Happy</button>
    <button @click="updateMood('Sad')" class="btn btn-secondary me-2">Sad</button>
    <button @click="updateMood('Anxious')" class="btn btn-warning">Anxious</button>
    <p v-if="currentMood" class="mt-2">You selected: <strong>{{ currentMood }}</strong></p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const currentMood = ref('')

function updateMood(mood) {
  currentMood.value = mood
}
</script>

