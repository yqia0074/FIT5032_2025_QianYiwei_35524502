<template>
  <div class="modules-container professional-theme">
    <div class="professional-header">
      <div class="header-content">
        <h3>Professional Support Center</h3>
        <p class="text-muted">Choose a module to access resources and tools designed for professional workers</p>
      </div>
      <div class="professional-badge">
        <i class="bi bi-briefcase-fill"></i>
        <span>Professional</span>
      </div>
    </div>
    
    <!-- Module selection interface -->
    <div v-if="!activeModule" class="modules-grid">
      <div class="row g-4">
        <div class="col-md-4" v-for="(module, index) in modules" :key="index">
          <div class="card h-100 module-card" @click="selectModule(module.id)">
            <div class="module-icon-wrapper">
              <i :class="`bi ${module.icon}`"></i>
            </div>
            <div class="card-body text-center">
              <h5 class="card-title">{{ module.title }}</h5>
              <p class="card-text">{{ module.description }}</p>
              <div class="module-footer">
                <span class="module-tag">{{ module.tag }}</span>
                <small class="text-muted">{{ getLastAccessText(module.id) }}</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Module content -->
    <div v-else class="module-content">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <button @click="activeModule = null" class="btn btn-outline-primary">
          <i class="bi bi-arrow-left"></i> Back to Modules
        </button>
        <div class="active-module-header">
          <h4>{{ getActiveModule.title }}</h4>
          <span class="module-tag">{{ getActiveModule.tag }}</span>
        </div>
      </div>
      
      <!-- Dynamic component -->
      <component :is="getActiveModule.component"></component>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, markRaw, defineAsyncComponent, onMounted } from 'vue'

// Asynchronously load components
const WorkerArticles = defineAsyncComponent(() => import('./WorkerArticles.vue'))
const Community = defineAsyncComponent(() => import('./Community.vue'))
const EmailCenter = defineAsyncComponent(() => import('./EmailCenter.vue'))
const EmotionalSupportHub = defineAsyncComponent(() => import('./EmotionalSupportHub.vue'))
const GeoLocation = defineAsyncComponent(() => import('./GeoLocation.vue'))

// Currently selected module
const activeModule = ref(null)

// User access history
const moduleHistory = ref([])

// Module definitions
const modules = [
  {
    id: 'articles',
    title: 'Workplace Mental Health',
    description: 'Read articles about workplace stress, work-life balance, and mental health for professionals.',
    icon: 'bi-journal-text',
    component: markRaw(WorkerArticles),
    tag: 'Professional Knowledge'
  },
  {
    id: 'community',
    title: 'Professional Community',
    description: 'Connect with other professionals, share experiences, and discuss workplace challenges.',
    icon: 'bi-people-fill',
    component: markRaw(Community),
    tag: 'Peer Exchange'
  },
  {
    id: 'email',
    title: 'Professional Support',
    description: 'Contact mental health professionals for personalized advice on workplace wellness.',
    icon: 'bi-envelope-fill',
    component: markRaw(EmailCenter),
    tag: 'One-on-One Consultation'
  },
  {
    id: 'emotional',
    title: 'Emotional Support Center',
    description: 'Access meditation resources, relaxation techniques, and stress management tools.',
    icon: 'bi-heart-fill',
    component: markRaw(EmotionalSupportHub),
    tag: 'Stress Management'
  },
  {
    id: 'location',
    title: 'Workplace Resources',
    description: 'Find mental health resources and support services near your workplace.',
    icon: 'bi-geo-alt-fill',
    component: markRaw(GeoLocation),
    tag: 'Local Services'
  }
]

// Get currently selected module
const getActiveModule = computed(() => {
  return modules.find(m => m.id === activeModule.value) || null
})

// Select module
function selectModule(moduleId) {
  activeModule.value = moduleId
  
  // Record user module access history
  recordModuleAccess(moduleId)
}

// Get text for module's last access time
function getLastAccessText(moduleId) {
  if (!moduleHistory.value.length) return 'Never accessed'
  
  const moduleAccess = moduleHistory.value.filter(h => h.moduleId === moduleId)
  if (!moduleAccess.length) return 'Never accessed'
  
  // Get most recent access record
  const lastAccess = moduleAccess[moduleAccess.length - 1]
  const lastAccessDate = new Date(lastAccess.timestamp)
  const now = new Date()
  
  // Calculate time difference
  const diffMs = now - lastAccessDate
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  
  if (diffDays > 0) {
    return `Accessed ${diffDays} days ago`
  } else if (diffHours > 0) {
    return `Accessed ${diffHours} hours ago`
  } else if (diffMinutes > 0) {
    return `Accessed ${diffMinutes} minutes ago`
  } else {
    return 'Accessed just now'
  }
}

// Record module access history
function recordModuleAccess(moduleId) {
  const userId = getUserId()
  if (!userId) return
  
  const historyKey = `workerModuleHistory_${userId}`
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
    timestamp: new Date().toISOString()
  })
  
  // Only keep the most recent 50 records
  if (history.length > 50) {
    history = history.slice(-50)
  }
  
  // Save to localStorage
  localStorage.setItem(historyKey, JSON.stringify(history))
  
  // Update local history records
  loadModuleHistory()
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

// Load module access history
function loadModuleHistory() {
  const userId = getUserId()
  if (!userId) return
  
  const historyKey = `workerModuleHistory_${userId}`
  const historyStr = localStorage.getItem(historyKey)
  
  if (historyStr) {
    try {
      moduleHistory.value = JSON.parse(historyStr)
    } catch (e) {
      console.error('Failed to parse module history', e)
    }
  }
}

onMounted(() => {
  // Load module access history
  loadModuleHistory()
})
</script>

<style scoped>
.modules-container {
  margin-top: 1rem;
  margin-bottom: 2rem;
  padding: 25px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.professional-theme {
  background-color: #f8f9fa;
  border-left: 5px solid #0056b3;
  box-shadow: 0 4px 15px rgba(0, 86, 179, 0.1);
}

.professional-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.professional-badge {
  display: inline-flex;
  align-items: center;
  padding: 8px 15px;
  background-color: #0056b3;
  color: white;
  border-radius: 30px;
  font-weight: 500;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.professional-badge i {
  margin-right: 8px;
  font-size: 1.1rem;
}

.module-card {
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  position: relative;
}

.module-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 20px rgba(0, 0, 0, 0.1);
}

.module-icon-wrapper {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #0056b3;
  color: white;
  font-size: 2rem;
  transition: all 0.3s ease;
}

.module-card:hover .module-icon-wrapper {
  background-color: #003d82;
}

.module-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
  padding-top: 10px;
  border-top: 1px solid #e9ecef;
}

.module-tag {
  display: inline-block;
  padding: 3px 8px;
  background-color: #e9ecef;
  color: #495057;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.module-content {
  margin-top: 1rem;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.active-module-header {
  display: flex;
  align-items: center;
}

.active-module-header h4 {
  margin-right: 10px;
  margin-bottom: 0;
}

.active-module-header .module-tag {
  background-color: #0056b3;
  color: white;
}
</style>