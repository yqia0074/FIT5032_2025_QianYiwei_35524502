<template>
  <div :class="['teenager-container', moodContainerClass]">
    <div class="teenager-header">
      <div class="header-content">
        <div class="teenager-title">
          <h2><i :class="currentMoodIcon"></i> {{ welcomeMessage }}</h2>
          <div :class="['mood-badge', `mood-${currentMood.toLowerCase()}`]" v-if="currentMood">
            {{ getMoodText(currentMood) }}
          </div>
        </div>
        <p class="text-muted">{{ moodSubtitle }}</p>
      </div>
      
      <div class="mood-selector">
        <div class="mood-label">How are you feeling today?</div>
        <div class="mood-buttons">
          <button 
            v-for="mood in moods" 
            :key="mood.value" 
            :class="['mood-btn', `mood-btn-${mood.value.toLowerCase()}`, currentMood === mood.value ? 'active' : '']" 
            @click="setMood(mood.value)">
            <i :class="mood.icon"></i>
            <span>{{ mood.text }}</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- XSS Protection Alert -->
    <div :class="['alert', `alert-${moodAlertClass}`]" role="alert">
      <i class="bi bi-shield-check"></i> 
      This system has implemented security measures to protect your data. Please report any suspicious activity immediately.
    </div>
    
    <!-- Mood Tip -->
    <div :class="['mood-tip', `mood-tip-${currentMood.toLowerCase()}`]" v-if="currentMood && moodTip">
      <i :class="currentMoodIcon"></i>
      <span>{{ moodTip }}</span>
    </div>
    
    <!-- Modular Interface -->
    <TeenagerModules />
  </div>
</template>

<script setup>
import TeenagerModules from '../components/TeenagerModules.vue'
import { onMounted, ref, computed, watch } from 'vue'

// Mood-related data
const currentMood = ref('')
const lastMoodUpdate = ref('')
const username = ref('')

// Mood options
const moods = [
  { value: 'HAPPY', text: 'Happy', icon: 'bi bi-emoji-smile-fill' },
  { value: 'CALM', text: 'Calm', icon: 'bi bi-emoji-neutral-fill' },
  { value: 'SAD', text: 'Sad', icon: 'bi bi-emoji-frown-fill' },
  { value: 'ANGRY', text: 'Angry', icon: 'bi bi-emoji-angry-fill' },
  { value: 'ANXIOUS', text: 'Anxious', icon: 'bi bi-emoji-dizzy-fill' }
]

// UI properties calculated based on mood
const moodContainerClass = computed(() => {
  if (!currentMood.value) return ''
  
  const mood = currentMood.value.toLowerCase()
  if (['happy', 'calm'].includes(mood)) {
    return 'mood-positive'
  } else if (['sad', 'angry', 'anxious'].includes(mood)) {
    return 'mood-negative'
  }
  return ''
})

const moodAlertClass = computed(() => {
  if (!currentMood.value) return 'info'
  
  const mood = currentMood.value.toLowerCase()
  if (['happy', 'calm'].includes(mood)) {
    return 'success'
  } else if (['sad', 'angry', 'anxious'].includes(mood)) {
    return 'warning'
  }
  return 'info'
})

const currentMoodIcon = computed(() => {
  if (!currentMood.value) return 'bi bi-emoji-smile'
  
  const foundMood = moods.find(m => m.value === currentMood.value)
  return foundMood ? foundMood.icon : 'bi bi-emoji-smile'
})

const welcomeMessage = computed(() => {
  if (!username.value) return 'Welcome, Teenager!'
  
  const mood = currentMood.value.toLowerCase()
  if (['happy', 'calm'].includes(mood)) {
    return `Hello, ${username.value}! How's your day going?`
  } else if (['sad', 'angry', 'anxious'].includes(mood)) {
    return `${username.value}, we're here to support you`
  }
  return `Welcome, ${username.value}!`
})

const moodSubtitle = computed(() => {
  const mood = currentMood.value.toLowerCase()
  if (['happy', 'calm'].includes(mood)) {
    return 'This is your personalized support center, full of positive energy and resources.'
  } else if (['sad', 'angry', 'anxious'].includes(mood)) {
    return 'Here are resources specially prepared to help you through difficult moments.'
  }
  return 'This is a personalized support center designed for teenagers.'
})

const moodTip = computed(() => {
  const mood = currentMood.value.toLowerCase()
  
  const tips = {
    happy: 'Keep up this positive mindset, and don\'t forget to share your happiness!',
    calm: 'A calm mind is the best state to be in. Keep it up!',
    sad: 'It\'s normal to feel sad. Remember to take care of yourself and seek help when needed.',
    angry: 'Take a deep breath, give yourself time to calm down, then make decisions.',
    anxious: 'Try to focus on the present moment. Simple breathing exercises might help.'
  }
  
  return tips[mood] || ''
})

// Set mood
function setMood(mood) {
  currentMood.value = mood
  lastMoodUpdate.value = new Date().toISOString()
  saveMoodToStorage()
}

// Get mood text
function getMoodText(moodValue) {
  const foundMood = moods.find(m => m.value === moodValue)
  return foundMood ? foundMood.text : ''
}

// Save mood to local storage
function saveMoodToStorage() {
  try {
    const moodData = {
      mood: currentMood.value,
      timestamp: lastMoodUpdate.value
    }
    localStorage.setItem('teenager_mood', JSON.stringify(moodData))
  } catch (error) {
    console.error('Error saving mood data:', error)
  }
}

// Load mood from local storage
function loadMoodFromStorage() {
  try {
    const moodData = localStorage.getItem('teenager_mood')
    if (moodData) {
      const parsed = JSON.parse(moodData)
      currentMood.value = parsed.mood || ''
      lastMoodUpdate.value = parsed.timestamp || ''
    }
  } catch (error) {
    console.error('Error loading mood data:', error)
  }
}

// Validate input data when component is mounted
onMounted(() => {
  // Implement basic security checks
  validateUserData()
  
  // Load mood data
  loadMoodFromStorage()
  
  // If no mood is set, default to calm
  if (!currentMood.value) {
    setMood('CALM')
  }
})

// Watch for mood changes
watch(currentMood, (newMood) => {
  console.log(`Mood updated: ${newMood}`)
  // Additional mood-related logic can be added here
})

// Validate user data
function validateUserData() {
  const userStr = localStorage.getItem('user')
  if (!userStr) return
  
  try {
    const user = JSON.parse(userStr)
    
    // Check if user data contains suspicious content
    const sanitizedUser = {
      ...user,
      username: sanitizeInput(user.username || ''),
      email: sanitizeInput(user.email || ''),
      role: user.role === 'teenager' ? 'teenager' : 'invalid'
    }
    
    // Set username
    username.value = sanitizedUser.username
    
    // If data was modified, update storage
    if (JSON.stringify(user) !== JSON.stringify(sanitizedUser)) {
      localStorage.setItem('user', JSON.stringify(sanitizedUser))
    }
  } catch (e) {
    console.error('Invalid user data', e)
    // Clear invalid data
    localStorage.removeItem('user')
  }
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
</script>

<style scoped>
.teenager-container {
  padding: 25px;
  border-radius: 12px;
  margin: 20px auto;
  max-width: 1000px;
  transition: all 0.5s ease;
  background-color: #f8f9fa;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.05);
}

/* Change container style based on mood */
.teenager-container.mood-positive {
  background-color: #f0f8ff;
  box-shadow: 0 0 20px rgba(100, 181, 246, 0.2);
  border-left: 5px solid #64b5f6;
}

.teenager-container.mood-negative {
  background-color: #fff8f0;
  box-shadow: 0 0 20px rgba(255, 167, 38, 0.2);
  border-left: 5px solid #ffa726;
}

.teenager-header {
  display: flex;
  flex-direction: column;
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #dee2e6;
}

.header-content {
  display: flex;
  flex-direction: column;
  margin-bottom: 20px;
}

.teenager-title {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.teenager-title h2 {
  margin: 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  font-size: 1.8rem;
}

.teenager-title h2 i {
  margin-right: 10px;
  transition: color 0.3s ease;
}

.mood-positive .teenager-title h2 i {
  color: #64b5f6;
}

.mood-negative .teenager-title h2 i {
  color: #ffa726;
}

.mood-badge {
  margin-left: 15px;
  padding: 5px 10px;
  color: white;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.mood-badge.mood-happy {
  background-color: #4caf50;
}

.mood-badge.mood-calm {
  background-color: #64b5f6;
}

.mood-badge.mood-sad {
  background-color: #78909c;
}

.mood-badge.mood-angry {
  background-color: #f44336;
}

.mood-badge.mood-anxious {
  background-color: #ff9800;
}

.mood-selector {
  background-color: white;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.mood-label {
  font-weight: 500;
  margin-bottom: 10px;
  color: #424242;
}

.mood-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.mood-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background-color: #f5f5f5;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 70px;
}

.mood-btn i {
  font-size: 1.5rem;
  margin-bottom: 5px;
}

.mood-btn-happy {
  color: #4caf50;
}

.mood-btn-calm {
  color: #64b5f6;
}

.mood-btn-sad {
  color: #78909c;
}

.mood-btn-angry {
  color: #f44336;
}

.mood-btn-anxious {
  color: #ff9800;
}

.mood-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.mood-btn.active {
  color: white;
  transform: translateY(-3px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
}

.mood-btn-happy.active {
  background-color: #4caf50;
}

.mood-btn-calm.active {
  background-color: #64b5f6;
}

.mood-btn-sad.active {
  background-color: #78909c;
}

.mood-btn-angry.active {
  background-color: #f44336;
}

.mood-btn-anxious.active {
  background-color: #ff9800;
}

.mood-tip {
  margin: 15px 0;
  padding: 15px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  transition: all 0.3s ease;
}

.mood-tip i {
  font-size: 1.2rem;
  margin-right: 10px;
}

.mood-tip-happy {
  background-color: rgba(76, 175, 80, 0.1);
  border-left: 4px solid #4caf50;
  color: #2e7d32;
}

.mood-tip-calm {
  background-color: rgba(100, 181, 246, 0.1);
  border-left: 4px solid #64b5f6;
  color: #1976d2;
}

.mood-tip-sad {
  background-color: rgba(120, 144, 156, 0.1);
  border-left: 4px solid #78909c;
  color: #455a64;
}

.mood-tip-angry {
  background-color: rgba(244, 67, 54, 0.1);
  border-left: 4px solid #f44336;
  color: #d32f2f;
}

.mood-tip-anxious {
  background-color: rgba(255, 152, 0, 0.1);
  border-left: 4px solid #ff9800;
  color: #ef6c00;
}

/* Responsive design */
@media (max-width: 768px) {
  .teenager-header {
    flex-direction: column;
  }
  
  .mood-buttons {
    justify-content: center;
  }
  
  .mood-btn {
    min-width: 60px;
  }
}
</style>
