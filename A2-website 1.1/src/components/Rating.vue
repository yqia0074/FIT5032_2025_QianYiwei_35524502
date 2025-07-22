<template>
  <div>
    <p>Average Rating: {{ averageRating.toFixed(1) }}/5 ⭐</p>
    <div>
      <button v-for="star in 5" :key="star" @click="rate(star)" class="btn btn-outline-primary btn-sm me-1">⭐ {{ star }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const ratings = ref(JSON.parse(localStorage.getItem('ratings')) || [])

function rate(value) {
  ratings.value.push(value)
  localStorage.setItem('ratings', JSON.stringify(ratings.value))
}

const averageRating = computed(() => {
  if (ratings.value.length === 0) return 0
  return ratings.value.reduce((a, b) => a + b, 0) / ratings.value.length
})
</script>
