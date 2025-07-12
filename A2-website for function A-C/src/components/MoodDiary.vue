<template>
  <div>
    <h4>Write Your Mood Diary</h4>
    <form @submit.prevent="saveDiary">
      <textarea v-model="content" class="form-control" rows="4" required minlength="20" maxlength="500"></textarea>
      <button class="btn btn-success mt-2">Save</button>
    </form>
    <div v-if="diaryList.length > 0" class="mt-3">
      <h5>Your Previous Entries:</h5>
      <ul>
        <li v-for="(entry, index) in diaryList" :key="index">{{ entry }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const content = ref('')
const diaryList = ref([])

function saveDiary() {
  diaryList.value.push(content.value)
  localStorage.setItem('diaries', JSON.stringify(diaryList.value))
  content.value = ''
}

onMounted(() => {
  const saved = JSON.parse(localStorage.getItem('diaries'))
  if (saved) diaryList.value = saved
})
</script>
