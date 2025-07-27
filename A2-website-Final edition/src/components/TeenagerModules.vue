<template>
  <div :class="['modules-container', moodClass]">
    <div class="teenager-header">
      <h3>{{ getGreeting }}</h3>
      <p class="text-muted">{{ getSubtitle }}</p>
      
      <div v-if="currentMood" class="current-mood-display">
        <span class="mood-indicator">
          <i :class="getMoodIcon(currentMood)"></i>
          Current Mood: {{ getMoodText(currentMood) }}
        </span>
      </div>
    </div>
    
    <!-- Module selection interface -->
    <div v-if="!activeModule" class="modules-grid">
      <div class="row g-4">
        <div class="col-md-4" v-for="(module, index) in modules" :key="index">
          <div :class="['card', 'h-100', 'module-card', getMoodCardClass(module.id)]" @click="selectModule(module.id)">
            <div class="card-body text-center">
              <div class="module-icon mb-3">
                <i :class="`bi ${module.icon}`" style="font-size: 2rem;"></i>
              </div>
              <h5 class="card-title">{{ module.title }}</h5>
              <p class="card-text">{{ module.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Module content -->
    <div v-else class="module-content">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <button @click="activeModule = null" :class="['btn', 'btn-outline-secondary', getMoodButtonClass()]">
          <i class="bi bi-arrow-left"></i> Back to Modules
        </button>
        <h4>{{ getActiveModule.title }}</h4>
      </div>
      
      <!-- Dynamic component -->
      <component :is="getActiveModule.component"></component>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, markRaw, defineAsyncComponent, onMounted, watch } from 'vue'

// Asynchronously load components
const TeenagerArticles = defineAsyncComponent(() => import('./TeenagerArticles.vue'))
const Community = defineAsyncComponent(() => import('./Community.vue'))
const EmailCenter = defineAsyncComponent(() => import('./EmailCenter.vue'))
const SelfHelpTools = defineAsyncComponent(() => import('./SelfHelpTools.vue'))
const GeoLocation = defineAsyncComponent(() => import('./GeoLocation.vue'))

// Currently selected module
const activeModule = ref(null)

// Current mood
const currentMood = ref('')

// Calculate CSS class based on mood
const moodClass = computed(() => {
  if (!currentMood.value) return ''
  return `mood-${currentMood.value.toLowerCase()}-theme`
})

// Get greeting based on mood
const getGreeting = computed(() => {
  if (!currentMood.value) return 'Teen Mental Health Support Center'
  
  const greetingMap = {
    'Happy': 'Sunny mood, happy every day!',
    'Calm': 'Calm mind, clear thinking',
    'Sad': 'Everyone has down moments, this is your safe harbor',
    'Anxious': 'Take a deep breath, relax, we\'ll face this together',
    'Angry': 'Let\'s calm down and find solutions together'
  }
  
  return greetingMap[currentMood.value] || 'Teen Mental Health Support Center'
})

// Get subtitle based on mood
const getSubtitle = computed(() => {
  if (!currentMood.value) return 'Choose a module to access resources and tools designed for teenagers'
  
  const subtitleMap = {
    'Happy': 'Maintain this good mood and explore more content that makes you happy',
    'Calm': 'A calm state is ideal for learning and growth, choose a module to begin',
    'Sad': 'Choose a module to find resources that can help improve your mood',
    'Anxious': 'Here are tools and resources specifically designed to relieve anxiety',
    'Angry': 'Learn how to manage emotions through these tools and resources'
  }
  
  return subtitleMap[currentMood.value] || 'Choose a module to access resources and tools designed for teenagers'
})

// Module definitions
const modules = [
  {
    id: 'articles',
    title: 'Mental Health Articles',
    description: 'Read articles about teen mental health, stress management, and well-being.',
    icon: 'bi-journal-text',
    component: markRaw(TeenagerArticles),
    priority: {
      'Happy': 2,
      'Calm': 1,
      'Sad': 3,
      'Anxious': 4,
      'Angry': 3
    }
  },
  {
    id: 'community',
    title: 'Community Forum',
    description: 'Connect with peers, share experiences, and get community support.',
    icon: 'bi-people-fill',
    component: markRaw(Community),
    priority: {
      'Happy': 3,
      'Calm': 2,
      'Sad': 1,
      'Anxious': 2,
      'Angry': 4
    }
  },
  {
    id: 'email',
    title: 'Email Support',
    description: 'Contact mental health professionals for personalized advice and support.',
    icon: 'bi-envelope-fill',
    component: markRaw(EmailCenter),
    priority: {
      'Happy': 4,
      'Calm': 3,
      'Sad': 2,
      'Anxious': 1,
      'Angry': 2
    }
  },
  {
    id: 'tools',
    title: 'Self-Help Tools',
    description: 'Use tools for mood tracking, stress management, and relaxation techniques.',
    icon: 'bi-tools',
    component: markRaw(SelfHelpTools),
    priority: {
      'Happy': 1,
      'Calm': 4,
      'Sad': 4,
      'Anxious': 3,
      'Angry': 1
    }
  },
  {
    id: 'location',
    title: 'Nearby Resources',
    description: 'Find mental health resources and support services near your location.',
    icon: 'bi-geo-alt-fill',
    component: markRaw(GeoLocation),
    priority: {
      'Happy': 5,
      'Calm': 5,
      'Sad': 5,
      'Anxious': 5,
      'Angry': 5
    }
  }
]

// Get the currently selected module
const getActiveModule = computed(() => {
  return modules.find(m => m.id === activeModule.value) || null
})

// Select module
function selectModule(moduleId) {
  activeModule.value = moduleId
  
  // Record user module access history
  recordModuleAccess(moduleId)
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

// Get card style based on mood
function getMoodCardClass(moduleId) {
  if (!currentMood.value) return ''
  
  // Add special styles based on current mood and module priority
  const module = modules.find(m => m.id === moduleId)
  if (!module) return ''
  
  const priority = module.priority[currentMood.value] || 3
  
  // Modules with priority 1 or 2 get special emphasis
  if (priority <= 2) {
    return `${currentMood.value.toLowerCase()}-priority-card`
  }
  
  return ''
}

// Get button style based on mood
function getMoodButtonClass() {
  if (!currentMood.value) return ''
  
  const btnClassMap = {
    'Happy': 'happy-btn',
    'Calm': 'calm-btn',
    'Sad': 'sad-btn',
    'Anxious': 'anxious-btn',
    'Angry': 'angry-btn'
  }
  
  return btnClassMap[currentMood.value] || ''
}

// Record module access history
function recordModuleAccess(moduleId) {
  const userId = getUserId()
  if (!userId) return
  
  const historyKey = `teenagerModuleHistory_${userId}`
  let history = []
  
  const historyStr = localStorage.getItem(historyKey)
  if (historyStr) {
    try {
      history = JSON.parse(historyStr)
    } catch (e) {
      console.error('Failed to parse module history', e)
    }
  }
  
  // Add access record
  history.push({
    moduleId,
    timestamp: new Date().toISOString(),
    mood: currentMood.value // Record current mood
  })
  
  // Only keep the most recent 50 records
  if (history.length > 50) {
    history = history.slice(-50)
  }
  
  // Save to localStorage
  localStorage.setItem(historyKey, JSON.stringify(history))
}

// Get user ID
function getUserId() {
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  
  try {
    const user = JSON.parse(userStr)
    return user.email || user.username || null
  } catch (e) {
    console.error('Failed to parse user information', e)
    return null
  }
}

// Watch for mood changes
watch(() => currentMood.value, (newMood) => {
  if (newMood) {
    // Additional logic can be added here when mood changes
    console.log('Mood changed to:', newMood)
  }
})

onMounted(() => {
  // Load current mood from localStorage
  const savedMood = localStorage.getItem('currentMood')
  if (savedMood) {
    currentMood.value = savedMood
  }
})
</script>

<style scoped>
.modules-container {
  margin-top: 1rem;
  margin-bottom: 2rem;
  padding: 20px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

/* Mood theme styles */
.mood-happy-theme {
  background-color: #f1f8e9;
  border-left: 5px solid #4caf50;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.1);
}

.mood-calm-theme {
  background-color: #e1f5fe;
  border-left: 5px solid #2196f3;
  box-shadow: 0 4px 12px rgba(33, 150, 243, 0.1);
}

.mood-sad-theme {
  background-color: #eceff1;
  border-left: 5px solid #607d8b;
  box-shadow: 0 4px 12px rgba(96, 125, 139, 0.1);
}

.mood-anxious-theme {
  background-color: #fffde7;
  border-left: 5px solid #ffc107;
  box-shadow: 0 4px 12px rgba(255, 193, 7, 0.1);
}

.mood-angry-theme {
  background-color: #ffebee;
  border-left: 5px solid #f44336;
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.1);
}

.teenager-header {
  margin-bottom: 2rem;
  position: relative;
}

.current-mood-display {
  margin-top: 10px;
  display: inline-block;
}

.mood-indicator {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.9rem;
  display: inline-flex;
  align-items: center;
  background-color: #f5f5f5;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.mood-indicator i {
  margin-right: 5px;
  font-size: 1.1rem;
}

.module-card {
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
  border: none;
  border-radius: 12px;
  overflow: hidden;
}

.module-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

/* Card styles based on mood priority */
.happy-priority-card {
  border-left: 5px solid #4caf50;
  background-color: #f1f8e9;
  transform: scale(1.02);
  box-shadow: 0 8px 16px rgba(76, 175, 80, 0.2);
}

.calm-priority-card {
  border-left: 5px solid #2196f3;
  background-color: #e1f5fe;
  transform: scale(1.02);
  box-shadow: 0 8px 16px rgba(33, 150, 243, 0.2);
}

.sad-priority-card {
  border-left: 5px solid #607d8b;
  background-color: #eceff1;
  transform: scale(1.02);
  box-shadow: 0 8px 16px rgba(96, 125, 139, 0.2);
}

.anxious-priority-card {
  border-left: 5px solid #ffc107;
  background-color: #fffde7;
  transform: scale(1.02);
  box-shadow: 0 8px 16px rgba(255, 193, 7, 0.2);
}

.angry-priority-card {
  border-left: 5px solid #f44336;
  background-color: #ffebee;
  transform: scale(1.02);
  box-shadow: 0 8px 16px rgba(244, 67, 54, 0.2);
}

.module-icon {
  color: #007bff;
  transition: all 0.3s ease;
}

.happy-priority-card .module-icon {
  color: #4caf50;
}

.calm-priority-card .module-icon {
  color: #2196f3;
}

.sad-priority-card .module-icon {
  color: #607d8b;
}

.anxious-priority-card .module-icon {
  color: #ffc107;
}

.angry-priority-card .module-icon {
  color: #f44336;
}

.module-content {
  margin-top: 1rem;
  padding: 15px;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.7);
}

/* Mood button styles */
.happy-btn {
  color: #4caf50;
  border-color: #4caf50;
}

.happy-btn:hover {
  background-color: #4caf50;
  color: white;
}

.calm-btn {
  color: #2196f3;
  border-color: #2196f3;
}

.calm-btn:hover {
  background-color: #2196f3;
  color: white;
}

.sad-btn {
  color: #607d8b;
  border-color: #607d8b;
}

.sad-btn:hover {
  background-color: #607d8b;
  color: white;
}

.anxious-btn {
  color: #ffc107;
  border-color: #ffc107;
}

.anxious-btn:hover {
  background-color: #ffc107;
  color: white;
}

.angry-btn {
  color: #f44336;
  border-color: #f44336;
}

.angry-btn:hover {
  background-color: #f44336;
  color: white;
}
</style>