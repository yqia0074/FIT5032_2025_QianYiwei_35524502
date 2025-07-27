<template>
  <div :class="['mood-diary', currentMood ? `mood-${currentMood.toLowerCase()}` : '']">
    <div class="mood-selection mb-4">
      <h4>How are you feeling today?</h4>
      <div class="mood-buttons">
        <button @click="selectMood('Happy')" :class="['mood-btn', 'happy-btn', currentMood === 'Happy' ? 'active' : '']">
          <i class="bi bi-emoji-smile-fill"></i>
          <span>Happy</span>
        </button>
        <button @click="selectMood('Calm')" :class="['mood-btn', 'calm-btn', currentMood === 'Calm' ? 'active' : '']">
          <i class="bi bi-emoji-neutral-fill"></i>
          <span>Calm</span>
        </button>
        <button @click="selectMood('Sad')" :class="['mood-btn', 'sad-btn', currentMood === 'Sad' ? 'active' : '']">
          <i class="bi bi-emoji-frown-fill"></i>
          <span>Sad</span>
        </button>
        <button @click="selectMood('Anxious')" :class="['mood-btn', 'anxious-btn', currentMood === 'Anxious' ? 'active' : '']">
          <i class="bi bi-emoji-dizzy-fill"></i>
          <span>Anxious</span>
        </button>
        <button @click="selectMood('Angry')" :class="['mood-btn', 'angry-btn', currentMood === 'Angry' ? 'active' : '']">
          <i class="bi bi-emoji-angry-fill"></i>
          <span>Angry</span>
        </button>
      </div>
    </div>

    <div class="diary-form">
      <h4>Write your mood diary</h4>
      <!-- XSS Protection Alert -->
       <div class="alert alert-info mb-3" role="alert">
         <i class="bi bi-shield-check"></i> 
         XSS protection is enabled. All input content will be automatically sanitized to prevent malicious scripts.
       </div>
      <div v-if="currentMood === 'Happy' || currentMood === 'Calm'" class="mood-tip positive-tip">
        <i class="bi bi-lightbulb-fill"></i>
        <span>Great to see you're feeling good today! Record the things that make you happy so you can look back on them when you're feeling down.</span>
      </div>
      <div v-else-if="currentMood === 'Sad' || currentMood === 'Anxious' || currentMood === 'Angry'" class="mood-tip negative-tip">
        <i class="bi bi-heart-fill"></i>
        <span>Writing down your feelings is a great way to release them. Remember, everyone has bad days, and these feelings are temporary.</span>
      </div>
      
      <form @submit.prevent="saveDiary" class="mt-3">
        <div class="form-group mb-3">
          <label for="diaryTitle">Title</label>
          <input 
            type="text" 
            id="diaryTitle" 
            v-model="title" 
            class="form-control" 
            required 
            placeholder="Give your diary a title"
          >
        </div>
        
        <div class="form-group mb-3">
          <label for="diaryContent">Content</label>
          <textarea 
            id="diaryContent"
            v-model="content" 
            class="form-control" 
            rows="5" 
            required 
            minlength="10" 
            maxlength="1000"
            placeholder="Write down your feelings and thoughts today..."
          ></textarea>
        </div>
        
        <button type="submit" :class="['btn', 'btn-lg', 'w-100', getBtnClass()]">
          <i class="bi bi-journal-check"></i> Save Diary
        </button>
      </form>
    </div>

    <div v-if="diaryList.length > 0" class="diary-history mt-5">
      <h4>Diary History</h4>
      <div class="diary-list">
        <div 
          v-for="(entry, index) in diaryList" 
          :key="index" 
          :class="['diary-entry', `mood-${entry.mood.toLowerCase()}-entry`]"
        >
          <div class="diary-header">
            <div class="diary-title-row">
              <h5>{{ entry.title }}</h5>
              <span :class="['mood-badge', `mood-${entry.mood.toLowerCase()}-badge`]">
                <i :class="getMoodIcon(entry.mood)"></i>
                {{ getMoodText(entry.mood) }}
              </span>
            </div>
            <small class="text-muted">{{ formatDate(entry.date) }}</small>
          </div>
          <p class="diary-content">{{ entry.content }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const title = ref('')
const content = ref('')
const currentMood = ref('')
const diaryList = ref([])

// Select mood
function selectMood(mood) {
  currentMood.value = mood
  // Save current selected mood to localStorage
  localStorage.setItem('currentMood', mood)
}

// Sanitize input data to prevent XSS attacks
function sanitizeInput(input) {
  if (typeof input !== 'string') return ''
  
  // Remove potentially malicious script tags and event handlers
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/g, '')
    .replace(/on\w+='[^']*'/g, '')
    .replace(/on\w+=\w+/g, '')
    .trim()
}

// Save diary
function saveDiary() {
  if (!currentMood.value) {
    alert('Please select your mood first')
    return
  }
  
  const newEntry = {
    title: sanitizeInput(title.value),
    content: sanitizeInput(content.value),
    mood: currentMood.value,
    date: new Date().toISOString()
  }
  
  diaryList.value.unshift(newEntry) // Add to the beginning of the list
  localStorage.setItem('diaries', JSON.stringify(diaryList.value))
  
  // Clear form
  title.value = ''
  content.value = ''
  
  // Show XSS protection alert
  alert('Diary saved! Input content has been automatically sanitized to prevent XSS attacks.')
}

// Get button style based on mood
function getBtnClass() {
  const moodMap = {
    'Happy': 'btn-success',
    'Calm': 'btn-info',
    'Sad': 'btn-secondary',
    'Anxious': 'btn-warning',
    'Angry': 'btn-danger'
  }
  
  return moodMap[currentMood.value] || 'btn-primary'
}

// Get mood icon
function getMoodIcon(mood) {
  const iconMap = {
    'Happy': 'bi bi-emoji-smile-fill',
    'Calm': 'bi bi-emoji-neutral-fill',
    'Sad': 'bi bi-emoji-frown-fill',
    'Anxious': 'bi bi-emoji-dizzy-fill',
    'Angry': 'bi bi-emoji-angry-fill'
  }
  
  return iconMap[mood] || 'bi bi-question-circle-fill'
}

// Get mood text
function getMoodText(mood) {
  const textMap = {
    'Happy': 'Happy',
    'Calm': 'Calm',
    'Sad': 'Sad',
    'Anxious': 'Anxious',
    'Angry': 'Angry'
  }
  
  return textMap[mood] || mood
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}

onMounted(() => {
  // Load saved diaries
  const saved = localStorage.getItem('diaries')
  if (saved) {
    try {
      diaryList.value = JSON.parse(saved)
    } catch (e) {
      console.error('Failed to parse diaries', e)
    }
  }
  
  // Load saved mood
  const savedMood = localStorage.getItem('currentMood')
  if (savedMood) {
    currentMood.value = savedMood
  }
})
</script>

<style scoped>
.mood-diary {
  padding: 20px;
  border-radius: 10px;
  transition: all 0.3s ease;
}

/* Set different background colors based on mood */
.mood-happy {
  background-color: #e8f5e9;
  border-left: 5px solid #4caf50;
}

.mood-calm {
  background-color: #e3f2fd;
  border-left: 5px solid #2196f3;
}

.mood-sad {
  background-color: #eceff1;
  border-left: 5px solid #607d8b;
}

.mood-anxious {
  background-color: #fff8e1;
  border-left: 5px solid #ffc107;
}

.mood-angry {
  background-color: #ffebee;
  border-left: 5px solid #f44336;
}

.mood-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.mood-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px;
  border: none;
  border-radius: 10px;
  background-color: #f5f5f5;
  transition: all 0.2s ease;
  width: 80px;
  height: 80px;
}

.mood-btn i {
  font-size: 2rem;
  margin-bottom: 5px;
}

.mood-btn.active {
  transform: scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.happy-btn {
  color: #4caf50;
}

.happy-btn.active {
  background-color: #4caf50;
  color: white;
}

.calm-btn {
  color: #2196f3;
}

.calm-btn.active {
  background-color: #2196f3;
  color: white;
}

.sad-btn {
  color: #607d8b;
}

.sad-btn.active {
  background-color: #607d8b;
  color: white;
}

.anxious-btn {
  color: #ffc107;
}

.anxious-btn.active {
  background-color: #ffc107;
  color: white;
}

.angry-btn {
  color: #f44336;
}

.angry-btn.active {
  background-color: #f44336;
  color: white;
}

.mood-tip {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.mood-tip i {
  font-size: 1.5rem;
  margin-right: 10px;
}

.positive-tip {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.negative-tip {
  background-color: #ffebee;
  color: #c62828;
}

.diary-list {
  margin-top: 15px;
}

.diary-entry {
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.diary-header {
  margin-bottom: 10px;
}

.diary-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.diary-content {
  white-space: pre-line;
}

.mood-badge {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  display: inline-flex;
  align-items: center;
}

.mood-badge i {
  margin-right: 5px;
}

.mood-happy-entry {
  background-color: #f1f8e9;
}

.mood-happy-badge {
  background-color: #4caf50;
  color: white;
}

.mood-calm-entry {
  background-color: #e1f5fe;
}

.mood-calm-badge {
  background-color: #2196f3;
  color: white;
}

.mood-sad-entry {
  background-color: #eceff1;
}

.mood-sad-badge {
  background-color: #607d8b;
  color: white;
}

.mood-anxious-entry {
  background-color: #fffde7;
}

.mood-anxious-badge {
  background-color: #ffc107;
  color: white;
}

.mood-angry-entry {
  background-color: #ffebee;
}

.mood-angry-badge {
  background-color: #f44336;
  color: white;
}

/* Alert styles */
.alert {
  padding: 12px 16px;
  border-radius: 6px;
  border: 1px solid transparent;
  display: flex;
  align-items: center;
}

.alert-info {
  background-color: #d1ecf1;
  border-color: #bee5eb;
  color: #0c5460;
}

.alert i {
  margin-right: 8px;
  font-size: 1.1rem;
}
</style>
