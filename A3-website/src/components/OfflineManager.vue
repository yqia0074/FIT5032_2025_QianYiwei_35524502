<template>
  <div class="offline-manager">
    <!-- Offline Status Indicator -->
    <div class="offline-status" :class="{ 'offline': !isOnline, 'online': isOnline }">
      <div class="status-indicator">
        <i :class="statusIcon"></i>
        <span class="status-text">{{ statusText }}</span>
      </div>
      <div v-if="!isOnline" class="offline-actions">
        <button @click="syncData" class="btn btn-sm btn-outline-primary" :disabled="isSyncing">
          <i class="bi bi-arrow-repeat" :class="{ 'spin': isSyncing }"></i>
          {{ isSyncing ? 'Syncing...' : 'Sync Now' }}
        </button>
      </div>
    </div>

    <!-- Offline Data Summary -->
    <div v-if="!isOnline" class="offline-summary">
      <div class="summary-item">
        <i class="bi bi-database"></i>
        <span>{{ offlineData.articles }} articles cached</span>
      </div>
      <div class="summary-item">
        <i class="bi bi-person-check"></i>
        <span>{{ offlineData.userProfiles }} profiles available</span>
      </div>
      <div class="summary-item">
        <i class="bi bi-clock-history"></i>
        <span>Last sync: {{ lastSyncTime }}</span>
      </div>
    </div>

    <!-- Offline Features -->
    <div class="offline-features">
      <div class="feature-card">
        <div class="feature-header">
          <i class="bi bi-bookmark-fill"></i>
          <h6>Reading List</h6>
        </div>
        <div class="feature-content">
          <p>Save articles for offline reading</p>
          <div class="reading-list">
            <div v-for="article in readingList" :key="article.id" class="reading-item">
              <span class="article-title">{{ article.title }}</span>
              <button @click="removeFromReadingList(article.id)" class="btn btn-sm btn-outline-danger">
                <i class="bi bi-trash"></i>
              </button>
            </div>
            <div v-if="readingList.length === 0" class="empty-state">
              <i class="bi bi-bookmark"></i>
              <span>No articles saved for offline reading</span>
            </div>
          </div>
        </div>
      </div>

      <div class="feature-card">
        <div class="feature-header">
          <i class="bi bi-journal-text"></i>
          <h6>Offline Notes</h6>
        </div>
        <div class="feature-content">
          <p>Take notes that sync when online</p>
          <div class="notes-section">
            <textarea 
              v-model="newNote" 
              class="form-control" 
              placeholder="Write your note here..."
              rows="3"
            ></textarea>
            <button @click="addNote" class="btn btn-primary btn-sm mt-2" :disabled="!newNote.trim()">
              <i class="bi bi-plus-circle"></i> Add Note
            </button>
          </div>
          <div class="notes-list">
            <div v-for="note in offlineNotes" :key="note.id" class="note-item">
              <div class="note-content">{{ note.content }}</div>
              <div class="note-meta">
                <span class="note-date">{{ formatDate(note.timestamp) }}</span>
                <span class="sync-status" :class="{ 'synced': note.synced, 'pending': !note.synced }">
                  <i :class="note.synced ? 'bi bi-check-circle' : 'bi bi-clock'"></i>
                  {{ note.synced ? 'Synced' : 'Pending' }}
                </span>
                <button @click="deleteNote(note.id)" class="btn btn-sm btn-outline-danger">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
            <div v-if="offlineNotes.length === 0" class="empty-state">
              <i class="bi bi-journal"></i>
              <span>No offline notes yet</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Reactive data
const isOnline = ref(navigator.onLine)
const isSyncing = ref(false)
const lastSyncTime = ref('')
const newNote = ref('')
const readingList = ref([])
const offlineNotes = ref([])

// Offline data statistics
const offlineData = ref({
  articles: 0,
  userProfiles: 0
})

// Computed properties
const statusIcon = computed(() => {
  return isOnline.value ? 'bi bi-wifi' : 'bi bi-wifi-off'
})

const statusText = computed(() => {
  return isOnline.value ? 'Online' : 'Offline Mode'
})

// Event listeners for online/offline status
const handleOnline = () => {
  isOnline.value = true
  console.log('Application is now online')
  // Auto-sync when coming back online
  syncData()
}

const handleOffline = () => {
  isOnline.value = false
  console.log('Application is now offline')
  updateLastSyncTime()
}

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
  
  // Load offline data
  loadOfflineData()
  updateOfflineStats()
  updateLastSyncTime()
})

onUnmounted(() => {
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})

// Load offline data from localStorage
function loadOfflineData() {
  // Load reading list
  const savedReadingList = localStorage.getItem('offlineReadingList')
  if (savedReadingList) {
    try {
      readingList.value = JSON.parse(savedReadingList)
    } catch (e) {
      console.error('Failed to load reading list:', e)
      readingList.value = []
    }
  }
  
  // Load offline notes
  const savedNotes = localStorage.getItem('offlineNotes')
  if (savedNotes) {
    try {
      offlineNotes.value = JSON.parse(savedNotes)
    } catch (e) {
      console.error('Failed to load offline notes:', e)
      offlineNotes.value = []
    }
  }
  
  // Load last sync time
  const savedSyncTime = localStorage.getItem('lastSyncTime')
  if (savedSyncTime) {
    lastSyncTime.value = savedSyncTime
  }
}

// Update offline statistics
function updateOfflineStats() {
  // Count cached articles
  const teenagerArticles = localStorage.getItem('teenagerArticles')
  const workerArticles = localStorage.getItem('workerArticles')
  let articleCount = 0
  
  if (teenagerArticles) {
    try {
      articleCount += JSON.parse(teenagerArticles).length
    } catch (e) {
      console.error('Failed to parse teenager articles:', e)
    }
  }
  
  if (workerArticles) {
    try {
      articleCount += JSON.parse(workerArticles).length
    } catch (e) {
      console.error('Failed to parse worker articles:', e)
    }
  }
  
  // Count user profiles
  const registeredUsers = localStorage.getItem('registeredUsers')
  let userCount = 0
  
  if (registeredUsers) {
    try {
      userCount = JSON.parse(registeredUsers).length
    } catch (e) {
      console.error('Failed to parse registered users:', e)
    }
  }
  
  offlineData.value = {
    articles: articleCount,
    userProfiles: userCount
  }
}

// Sync data when online
async function syncData() {
  if (!isOnline.value) {
    alert('Cannot sync while offline. Please check your internet connection.')
    return
  }
  
  isSyncing.value = true
  
  try {
    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mark all notes as synced
    offlineNotes.value.forEach(note => {
      note.synced = true
    })
    
    // Save updated notes
    localStorage.setItem('offlineNotes', JSON.stringify(offlineNotes.value))
    
    // Update sync time
    updateLastSyncTime()
    
    console.log('Data synced successfully')
    alert('Data synced successfully!')
  } catch (error) {
    console.error('Sync failed:', error)
    alert('Sync failed. Please try again.')
  } finally {
    isSyncing.value = false
  }
}

// Add article to reading list
function addToReadingList(article) {
  const exists = readingList.value.find(item => item.id === article.id)
  if (!exists) {
    readingList.value.push({
      id: article.id,
      title: article.title,
      timestamp: new Date().toISOString()
    })
    localStorage.setItem('offlineReadingList', JSON.stringify(readingList.value))
  }
}

// Remove article from reading list
function removeFromReadingList(articleId) {
  readingList.value = readingList.value.filter(item => item.id !== articleId)
  localStorage.setItem('offlineReadingList', JSON.stringify(readingList.value))
}

// Add new note
function addNote() {
  if (!newNote.value.trim()) return
  
  const note = {
    id: Date.now().toString(),
    content: newNote.value.trim(),
    timestamp: new Date().toISOString(),
    synced: isOnline.value
  }
  
  offlineNotes.value.unshift(note)
  localStorage.setItem('offlineNotes', JSON.stringify(offlineNotes.value))
  newNote.value = ''
  
  // If online, mark as synced immediately
  if (isOnline.value) {
    note.synced = true
  }
}

// Delete note
function deleteNote(noteId) {
  offlineNotes.value = offlineNotes.value.filter(note => note.id !== noteId)
  localStorage.setItem('offlineNotes', JSON.stringify(offlineNotes.value))
}

// Update last sync time
function updateLastSyncTime() {
  const now = new Date()
  lastSyncTime.value = now.toLocaleString()
  localStorage.setItem('lastSyncTime', lastSyncTime.value)
}

// Format date for display
function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString()
}

// Expose methods for parent components
defineExpose({
  addToReadingList,
  isOnline,
  syncData
})
</script>

<style scoped>
.offline-manager {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.offline-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.offline-status.online {
  background-color: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.offline-status.offline {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.status-indicator {
  display: flex;
  align-items: center;
  font-weight: 500;
}

.status-indicator i {
  font-size: 1.2rem;
  margin-right: 8px;
}

.offline-actions button {
  margin-left: 10px;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.offline-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 25px;
}

.summary-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #dee2e6;
}

.summary-item i {
  font-size: 1.1rem;
  margin-right: 8px;
  color: #6c757d;
}

.offline-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.feature-card {
  background-color: white;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  overflow: hidden;
}

.feature-header {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  background-color: #343a40;
  color: white;
}

.feature-header i {
  font-size: 1.2rem;
  margin-right: 10px;
}

.feature-header h6 {
  margin: 0;
  font-weight: 500;
}

.feature-content {
  padding: 20px;
}

.feature-content p {
  margin-bottom: 15px;
  color: #6c757d;
  font-size: 0.9rem;
}

.reading-list,
.notes-list {
  max-height: 200px;
  overflow-y: auto;
}

.reading-item,
.note-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  margin-bottom: 8px;
  background-color: #f8f9fa;
}

.article-title {
  font-size: 0.9rem;
  font-weight: 500;
  flex: 1;
}

.note-item {
  flex-direction: column;
  align-items: stretch;
}

.note-content {
  font-size: 0.9rem;
  margin-bottom: 8px;
  line-height: 1.4;
}

.note-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: #6c757d;
}

.note-date {
  flex: 1;
}

.sync-status {
  display: flex;
  align-items: center;
  margin: 0 10px;
}

.sync-status i {
  margin-right: 4px;
}

.sync-status.synced {
  color: #28a745;
}

.sync-status.pending {
  color: #ffc107;
}

.notes-section {
  margin-bottom: 15px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 30px;
  color: #6c757d;
  text-align: center;
}

.empty-state i {
  font-size: 2rem;
  margin-bottom: 10px;
  opacity: 0.5;
}

@media (max-width: 768px) {
  .offline-status {
    flex-direction: column;
    align-items: stretch;
  }
  
  .offline-actions {
    margin-top: 10px;
    text-align: center;
  }
  
  .offline-summary {
    grid-template-columns: 1fr;
  }
  
  .offline-features {
    grid-template-columns: 1fr;
  }
  
  .note-meta {
    flex-direction: column;
    align-items: stretch;
    gap: 5px;
  }
}
</style>