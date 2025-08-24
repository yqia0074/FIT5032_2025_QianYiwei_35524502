<template>
  <div class="my-4" role="region" aria-labelledby="analytics-title">
    <h3 id="analytics-title">Analytics and Tables</h3>
    
    <!-- Search and Filter Controls -->
    <div class="row mb-3" role="search" aria-labelledby="search-controls-title">
      <h4 id="search-controls-title" class="visually-hidden">Search and Filter Controls</h4>
      <div class="col-md-6">
        <div class="input-group">
          <span class="input-group-text" aria-hidden="true"><i class="bi bi-search"></i></span>
          <input 
            id="analytics-search"
            v-model="searchQuery" 
            type="text" 
            class="form-control" 
            placeholder="Search users, posts, or dates..."
            aria-label="Search analytics data"
            aria-describedby="search-help"
          >
          <div id="search-help" class="visually-hidden">Search through user data, posts, and activity dates</div>
        </div>
      </div>
      <div class="col-md-3">
        <label for="items-per-page" class="visually-hidden">Items per page</label>
        <select 
          id="items-per-page"
          v-model="itemsPerPage" 
          class="form-select"
          aria-describedby="pagination-help"
        >
          <option value="5">5 per page</option>
          <option value="10">10 per page</option>
          <option value="25">25 per page</option>
          <option value="50">50 per page</option>
        </select>
        <div id="pagination-help" class="visually-hidden">Select number of items to display per page</div>
      </div>
      <div class="col-md-3">
        <button 
          @click="toggleExportPanel" 
          class="btn btn-outline-success"
          :class="{ active: showExportPanel }"
          aria-describedby="export-help"
          :aria-expanded="showExportPanel"
          aria-controls="export-panel"
        >
          <i class="bi bi-download" aria-hidden="true"></i> 
          {{ showExportPanel ? 'Hide Export' : 'Export Data' }}
        </button>
        <div id="export-help" class="visually-hidden">Toggle data export options panel</div>
      </div>
    </div>
    
    <!-- Results Info -->
    <div class="mb-2" role="status" aria-live="polite">
      <small class="text-muted">
        Showing {{ startIndex + 1 }}-{{ Math.min(endIndex, filteredData.length) }} of {{ filteredData.length }} entries
        <span v-if="searchQuery">(filtered from {{ data.length }} total entries)</span>
      </small>
    </div>

    <!-- Export Panel -->
    <div 
      v-if="showExportPanel" 
      id="export-panel"
      class="export-panel mb-4"
      role="region"
      aria-labelledby="export-panel-title"
    >
      <DataExport 
        :data="filteredData"
        :default-filename="'analytics-data'"
        @export-started="onExportStarted"
        @export-completed="onExportCompleted"
        @export-failed="onExportFailed"
      />
    </div>
    
    <!-- Interactive Table -->
    <div class="table-responsive">
      <table 
        class="table table-striped table-hover" 
        role="table"
        aria-labelledby="analytics-title"
        aria-describedby="table-description"
      >
        <caption id="table-description" class="visually-hidden">
          Analytics data table with user information, posts, activity, and engagement scores. Use arrow keys to navigate and Enter to sort columns.
        </caption>
        <thead class="table-dark">
          <tr role="row">
            <th 
              @click="sortBy('user')" 
              @keydown.enter="sortBy('user')"
              @keydown.space.prevent="sortBy('user')"
              class="sortable"
              role="columnheader"
              tabindex="0"
              :aria-sort="getSortAriaLabel('user')"
              aria-describedby="user-sort-help"
            >
              User 
              <i class="bi" :class="getSortIcon('user')" aria-hidden="true"></i>
              <span id="user-sort-help" class="visually-hidden">Click or press Enter to sort by user name</span>
            </th>
            <th 
              @click="sortBy('posts')" 
              @keydown.enter="sortBy('posts')"
              @keydown.space.prevent="sortBy('posts')"
              class="sortable"
              role="columnheader"
              tabindex="0"
              :aria-sort="getSortAriaLabel('posts')"
              aria-describedby="posts-sort-help"
            >
              Posts 
              <i class="bi" :class="getSortIcon('posts')" aria-hidden="true"></i>
              <span id="posts-sort-help" class="visually-hidden">Click or press Enter to sort by number of posts</span>
            </th>
            <th 
              @click="sortBy('lastActive')" 
              @keydown.enter="sortBy('lastActive')"
              @keydown.space.prevent="sortBy('lastActive')"
              class="sortable"
              role="columnheader"
              tabindex="0"
              :aria-sort="getSortAriaLabel('lastActive')"
              aria-describedby="activity-sort-help"
            >
              Last Active 
              <i class="bi" :class="getSortIcon('lastActive')" aria-hidden="true"></i>
              <span id="activity-sort-help" class="visually-hidden">Click or press Enter to sort by last activity date</span>
            </th>
            <th 
              @click="sortBy('engagement')" 
              @keydown.enter="sortBy('engagement')"
              @keydown.space.prevent="sortBy('engagement')"
              class="sortable"
              role="columnheader"
              tabindex="0"
              :aria-sort="getSortAriaLabel('engagement')"
              aria-describedby="engagement-sort-help"
            >
              Engagement Score 
              <i class="bi" :class="getSortIcon('engagement')" aria-hidden="true"></i>
              <span id="engagement-sort-help" class="visually-hidden">Click or press Enter to sort by engagement score</span>
            </th>
            <th role="columnheader">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in paginatedData" :key="index" class="table-row">
            <td>
              <div class="d-flex align-items-center">
                <div class="user-avatar me-2">
                  {{ row.user.charAt(0) }}
                </div>
                <div>
                  <strong>{{ row.user }}</strong>
                  <br>
                  <small class="text-muted">{{ row.email }}</small>
                </div>
              </div>
            </td>
            <td>
              <span class="badge bg-primary">{{ row.posts }}</span>
            </td>
            <td>
              <span :class="getActivityClass(row.lastActive)">{{ formatDate(row.lastActive) }}</span>
              <br>
              <small class="text-muted">{{ getTimeAgo(row.lastActive) }}</small>
            </td>
            <td>
              <div class="progress" style="height: 20px;">
                <div 
                  class="progress-bar" 
                  :class="getEngagementClass(row.engagement)"
                  :style="{ width: row.engagement + '%' }"
                >
                  {{ row.engagement }}%
                </div>
              </div>
            </td>
            <td>
              <div class="btn-group btn-group-sm">
                <button @click="viewUser(row)" class="btn btn-outline-info">
                  <i class="bi bi-eye"></i>
                </button>
                <button @click="editUser(row)" class="btn btn-outline-warning">
                  <i class="bi bi-pencil"></i>
                </button>
                <button @click="deleteUser(row)" class="btn btn-outline-danger">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- No Results Message -->
    <div v-if="filteredData.length === 0" class="text-center py-4">
      <i class="bi bi-search display-1 text-muted"></i>
      <h5 class="text-muted mt-2">No results found</h5>
      <p class="text-muted">Try adjusting your search criteria</p>
    </div>
    
    <!-- Pagination -->
    <nav v-if="totalPages > 1" aria-label="Table pagination">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button @click="goToPage(1)" class="page-link" :disabled="currentPage === 1">
            <i class="bi bi-chevron-double-left"></i>
          </button>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button @click="goToPage(currentPage - 1)" class="page-link" :disabled="currentPage === 1">
            <i class="bi bi-chevron-left"></i>
          </button>
        </li>
        
        <li 
          v-for="page in visiblePages" 
          :key="page" 
          class="page-item" 
          :class="{ active: page === currentPage }"
        >
          <button @click="goToPage(page)" class="page-link">
            {{ page }}
          </button>
        </li>
        
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button @click="goToPage(currentPage + 1)" class="page-link" :disabled="currentPage === totalPages">
            <i class="bi bi-chevron-right"></i>
          </button>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button @click="goToPage(totalPages)" class="page-link" :disabled="currentPage === totalPages">
            <i class="bi bi-chevron-double-right"></i>
          </button>
        </li>
      </ul>
    </nav>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { FocusManager, AriaManager, KeyboardNavigation } from '../utils/accessibility.js'
import DataExport from './DataExport.vue'

// Initialize accessibility managers
const focusManager = new FocusManager()
const ariaManager = new AriaManager()
const keyboardNav = new KeyboardNavigation()

// Reactive data
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const sortField = ref('user')
const sortDirection = ref('asc')
const showExportPanel = ref(false)

// Enhanced sample data with more fields
const data = ref([
  { 
    user: 'Alice Johnson', 
    email: 'alice@example.com',
    posts: 45, 
    lastActive: '2025-01-15', 
    engagement: 92,
    id: 1
  },
  { 
    user: 'Bob Smith', 
    email: 'bob@example.com',
    posts: 23, 
    lastActive: '2025-01-14', 
    engagement: 78,
    id: 2
  },
  { 
    user: 'Carol Davis', 
    email: 'carol@example.com',
    posts: 67, 
    lastActive: '2025-01-13', 
    engagement: 95,
    id: 3
  },
  { 
    user: 'David Wilson', 
    email: 'david@example.com',
    posts: 12, 
    lastActive: '2025-01-10', 
    engagement: 65,
    id: 4
  },
  { 
    user: 'Eva Brown', 
    email: 'eva@example.com',
    posts: 89, 
    lastActive: '2025-01-12', 
    engagement: 88,
    id: 5
  },
  { 
    user: 'Frank Miller', 
    email: 'frank@example.com',
    posts: 34, 
    lastActive: '2025-01-08', 
    engagement: 72,
    id: 6
  },
  { 
    user: 'Grace Lee', 
    email: 'grace@example.com',
    posts: 56, 
    lastActive: '2025-01-11', 
    engagement: 84,
    id: 7
  },
  { 
    user: 'Henry Taylor', 
    email: 'henry@example.com',
    posts: 19, 
    lastActive: '2025-01-09', 
    engagement: 69,
    id: 8
  },
  { 
    user: 'Iris Chen', 
    email: 'iris@example.com',
    posts: 78, 
    lastActive: '2025-01-14', 
    engagement: 91,
    id: 9
  },
  { 
    user: 'Jack Anderson', 
    email: 'jack@example.com',
    posts: 41, 
    lastActive: '2025-01-07', 
    engagement: 76,
    id: 10
  },
  { 
    user: 'Kate Williams', 
    email: 'kate@example.com',
    posts: 63, 
    lastActive: '2025-01-13', 
    engagement: 87,
    id: 11
  },
  { 
    user: 'Liam Garcia', 
    email: 'liam@example.com',
    posts: 28, 
    lastActive: '2025-01-06', 
    engagement: 73,
    id: 12
  }
])

// Computed properties for filtering and sorting
const filteredData = computed(() => {
  let filtered = data.value
  
  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item => 
      item.user.toLowerCase().includes(query) ||
      item.email.toLowerCase().includes(query) ||
      item.posts.toString().includes(query) ||
      item.lastActive.includes(query) ||
      item.engagement.toString().includes(query)
    )
  }
  
  // Apply sorting
  filtered.sort((a, b) => {
    let aVal = a[sortField.value]
    let bVal = b[sortField.value]
    
    // Handle different data types
    if (sortField.value === 'posts' || sortField.value === 'engagement') {
      aVal = Number(aVal)
      bVal = Number(bVal)
    } else if (sortField.value === 'lastActive') {
      aVal = new Date(aVal)
      bVal = new Date(bVal)
    } else {
      aVal = String(aVal).toLowerCase()
      bVal = String(bVal).toLowerCase()
    }
    
    if (sortDirection.value === 'asc') {
      return aVal < bVal ? -1 : aVal > bVal ? 1 : 0
    } else {
      return aVal > bVal ? -1 : aVal < bVal ? 1 : 0
    }
  })
  
  return filtered
})

// Pagination computed properties
const totalPages = computed(() => {
  return Math.ceil(filteredData.value.length / itemsPerPage.value)
})

const startIndex = computed(() => {
  return (currentPage.value - 1) * itemsPerPage.value
})

const endIndex = computed(() => {
  return startIndex.value + itemsPerPage.value
})

const paginatedData = computed(() => {
  return filteredData.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  // Show up to 5 page numbers
  let start = Math.max(1, current - 2)
  let end = Math.min(total, start + 4)
  
  // Adjust start if we're near the end
  if (end - start < 4) {
    start = Math.max(1, end - 4)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Watch for search query changes to reset pagination
watch(searchQuery, () => {
  currentPage.value = 1
})

watch(itemsPerPage, () => {
  currentPage.value = 1
})

// Methods
const sortBy = (field) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortDirection.value = 'asc'
  }
}

const getSortIcon = (field) => {
  if (sortField.value !== field) {
    return 'bi-arrow-down-up'
  }
  return sortDirection.value === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down'
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const getTimeAgo = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return '1 day ago'
  if (diffDays < 7) return `${diffDays} days ago`
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
  return `${Math.floor(diffDays / 30)} months ago`
}

const getActivityClass = (dateString) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now - date)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays <= 1) return 'text-success'
  if (diffDays <= 3) return 'text-warning'
  return 'text-danger'
}

const getEngagementClass = (engagement) => {
  if (engagement >= 90) return 'bg-success'
  if (engagement >= 75) return 'bg-info'
  if (engagement >= 60) return 'bg-warning'
  return 'bg-danger'
}

// Export panel methods
const toggleExportPanel = () => {
  showExportPanel.value = !showExportPanel.value
  if (showExportPanel.value) {
    ariaManager.announceToScreenReader('Export panel opened')
  } else {
    ariaManager.announceToScreenReader('Export panel closed')
  }
}

const onExportStarted = (details) => {
  console.log('Export started:', details)
  ariaManager.announceToScreenReader(`Starting ${details.format.toUpperCase()} export`)
}

const onExportCompleted = (details) => {
  console.log('Export completed:', details)
  ariaManager.announceToScreenReader(
    `Export completed successfully. ${details.recordCount} records exported as ${details.format.toUpperCase()}`
  )
}

const onExportFailed = (details) => {
  console.error('Export failed:', details)
  ariaManager.announceToScreenReader(`Export failed: ${details.error}`)
}

const viewUser = (user) => {
  alert(`Viewing details for ${user.user}\nEmail: ${user.email}\nPosts: ${user.posts}\nEngagement: ${user.engagement}%`)
}

const editUser = (user) => {
  const newPosts = prompt(`Edit posts count for ${user.user}:`, user.posts)
  if (newPosts !== null && !isNaN(newPosts)) {
    const userIndex = data.value.findIndex(u => u.id === user.id)
    if (userIndex !== -1) {
      data.value[userIndex].posts = parseInt(newPosts)
    }
  }
}

const deleteUser = (user) => {
  if (confirm(`Are you sure you want to delete ${user.user}?`)) {
    const userIndex = data.value.findIndex(u => u.id === user.id)
    if (userIndex !== -1) {
      data.value.splice(userIndex, 1)
      ariaManager.announceToScreenReader(`User ${user.user} has been deleted`)
    }
  }
}

// Get ARIA sort label for accessibility
const getSortAriaLabel = (field) => {
  if (sortField.value !== field) {
    return 'none'
  }
  return sortDirection.value === 'asc' ? 'ascending' : 'descending'
}

// Initialize accessibility features
const initializeAccessibility = () => {
  // Set up keyboard shortcuts
  keyboardNav.addShortcut('Alt+T', () => {
    const table = document.querySelector('table')
    if (table) {
      const firstHeader = table.querySelector('th[tabindex="0"]')
      if (firstHeader) {
        firstHeader.focus()
        ariaManager.announceToScreenReader('Focused on analytics table headers')
      }
    }
  })
  
  keyboardNav.addShortcut('Alt+S', () => {
    const searchInput = document.getElementById('analytics-search')
    if (searchInput) {
      searchInput.focus()
      ariaManager.announceToScreenReader('Focused on search input')
    }
  })
  
  keyboardNav.addShortcut('Alt+E', () => {
    const exportBtn = document.querySelector('.btn-outline-success')
    if (exportBtn) {
      exportBtn.focus()
      ariaManager.announceToScreenReader('Focused on export button')
    }
  })
  
  // Add arrow key navigation for table headers
  keyboardNav.addArrowNavigation('th.sortable')
  
  // Set up focus management for table
  focusManager.createFocusTrap('.table-responsive')
}

// Initialize accessibility on component mount
onMounted(() => {
  initializeAccessibility()
})
</script>

<style scoped>
/* Accessibility styles */
.visually-hidden {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

/* Focus styles for better accessibility */
.sortable:focus,
.btn:focus,
select:focus,
input:focus {
  outline: 3px solid #007bff;
  outline-offset: 2px;
}

/* Export panel styles */
.export-panel {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  padding: 1.5rem;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.btn.active {
  background-color: #007bff;
  border-color: #007bff;
  color: white;
}

.sortable {
  cursor: pointer;
  user-select: none;
  transition: background-color 0.2s ease;
}

.sortable:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.table-row {
  transition: all 0.2s ease;
}

.table-row:hover {
  background-color: rgba(0, 123, 255, 0.1);
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(45deg, #007bff, #6610f2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 16px;
}

.progress {
  border-radius: 10px;
  overflow: hidden;
}

.progress-bar {
  transition: width 0.3s ease;
  font-size: 12px;
  font-weight: bold;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  border-radius: 0.2rem;
}

.pagination .page-link {
  border-radius: 0.375rem;
  margin: 0 2px;
  border: 1px solid #dee2e6;
}

.pagination .page-item.active .page-link {
  background-color: #007bff;
  border-color: #007bff;
}

.pagination .page-link:hover {
  background-color: #e9ecef;
  border-color: #adb5bd;
}

.table-responsive {
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
}

.input-group-text {
  background-color: #f8f9fa;
  border-color: #ced4da;
}

.form-control:focus, .form-select:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.badge {
  font-size: 0.875em;
  padding: 0.5em 0.75em;
}

@media (max-width: 768px) {
  .table-responsive {
    font-size: 0.875rem;
  }
  
  .user-avatar {
    width: 32px;
    height: 32px;
    font-size: 14px;
  }
  
  .btn-group-sm .btn {
    padding: 0.125rem 0.25rem;
    font-size: 0.75rem;
  }
}
</style>
