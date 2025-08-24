<template>
  <div class="my-4">
    <h3>User Ratings Analytics</h3>
    
    <!-- Tab navigation -->
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'articles' }" href="#" @click.prevent="activeTab = 'articles'">Article Ratings</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" :class="{ active: activeTab === 'forum' }" href="#" @click.prevent="activeTab = 'forum'">Forum Ratings</a>
      </li>
    </ul>
    
    <!-- Article rating data -->
    <div v-if="activeTab === 'articles'">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h4>Article Ratings</h4>
        <div class="btn-group">
          <button 
            class="btn btn-sm" 
            :class="articleCategory === 'teenager' ? 'btn-primary' : 'btn-outline-primary'"
            @click="articleCategory = 'teenager'"
          >
            Teenager Articles
          </button>
          <button 
            class="btn btn-sm" 
            :class="articleCategory === 'worker' ? 'btn-primary' : 'btn-outline-primary'"
            @click="articleCategory = 'worker'"
          >
            Worker Articles
          </button>
        </div>
      </div>
      
      <div v-if="articleRatings.length > 0">
        <div class="table-responsive">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th>Article Title</th>
                <th>Likes</th>
                <th>Dislikes</th>
                <th>Star Ratings</th>
                <th>Average Rating</th>
                <th>Total Interactions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="article in articleRatings" :key="article.id">
                <td>{{ article.title }}</td>
                <td>{{ article.likes }}</td>
                <td>{{ article.dislikes }}</td>
                <td>{{ article.ratings.length }}</td>
                <td>
                  <div v-if="article.ratings.length > 0">
                    {{ article.averageRating.toFixed(1) }}/5
                    <div class="progress" style="height: 5px;">
                      <div 
                        class="progress-bar bg-warning" 
                        :style="{ width: (article.averageRating / 5 * 100) + '%' }"
                      ></div>
                    </div>
                  </div>
                  <span v-else>No ratings</span>
                </td>
                <td>{{ article.likes + article.dislikes + article.ratings.length }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="alert alert-info">
        No ratings data available for {{ articleCategory }} articles.
      </div>
    </div>
    
    <!-- Forum rating data -->
    <div v-if="activeTab === 'forum'">
      <h4>Forum Post Ratings</h4>
      
      <div v-if="forumRatings.length > 0">
        <div class="table-responsive">
          <table class="table table-striped table-hover">
            <thead>
              <tr>
                <th>User</th>
                <th>Post Content</th>
                <th>Likes</th>
                <th>Dislikes</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(post, index) in forumRatings" :key="index">
                <td>{{ post.user }}</td>
                <td>{{ truncateText(post.content, 50) }}</td>
                <td>{{ post.likes }}</td>
                <td>{{ post.dislikes }}</td>
                <td>
                  <div class="d-flex align-items-center">
                    <div class="progress flex-grow-1" style="height: 5px;">
                      <div 
                        class="progress-bar" 
                        :class="getProgressBarClass(post)"
                        :style="{ width: calculatePercentage(post) + '%' }"
                      ></div>
                    </div>
                    <span class="ms-2 badge" :class="getRatingBadgeClass(post)">
                      {{ calculateRating(post) }}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-else class="alert alert-info">
        No ratings data available for forum posts.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Active tab and article category
const activeTab = ref('articles')
const articleCategory = ref('teenager')

// Article rating data
const teenagerArticles = ref([])
const workerArticles = ref([])
const forumPosts = ref([])

// Load data when component is mounted
onMounted(() => {
  loadData()
})

// Load all rating data
function loadData() {
  // Load teenager articles data
  const teenagerArticlesStr = localStorage.getItem('teenagerArticles')
  if (teenagerArticlesStr) {
    try {
      teenagerArticles.value = JSON.parse(teenagerArticlesStr)
    } catch (e) {
      console.error('Failed to parse teenager articles', e)
      teenagerArticles.value = []
    }
  }
  
  // Load worker articles data
  const workerArticlesStr = localStorage.getItem('workerArticles')
  if (workerArticlesStr) {
    try {
      workerArticles.value = JSON.parse(workerArticlesStr)
    } catch (e) {
      console.error('Failed to parse worker articles', e)
      workerArticles.value = []
    }
  }
  
  // Load forum posts data
  const forumPostsStr = localStorage.getItem('communityPosts')
  if (forumPostsStr) {
    try {
      forumPosts.value = JSON.parse(forumPostsStr)
    } catch (e) {
      console.error('Failed to parse forum posts', e)
      forumPosts.value = []
    }
  }
}

// Calculate current selected article rating data
const articleRatings = computed(() => {
  return articleCategory.value === 'teenager' ? teenagerArticles.value : workerArticles.value
})

// Calculate forum rating data
const forumRatings = computed(() => {
  return forumPosts.value
})

// Truncate text
function truncateText(text, maxLength) {
  if (!text) return ''
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
}

// Calculate rating percentage
function calculatePercentage(post) {
  const total = post.likes + post.dislikes
  if (total === 0) return 0
  return Math.round((post.likes / total) * 100)
}

// Calculate rating text
function calculateRating(post) {
  const total = post.likes + post.dislikes
  if (total === 0) return 'No ratings'
  
  const percentage = calculatePercentage(post)
  return `${percentage}%`
}

// Get progress bar style class
function getProgressBarClass(post) {
  const percentage = calculatePercentage(post)
  
  if (percentage >= 70) return 'bg-success'
  if (percentage >= 40) return 'bg-warning'
  return 'bg-danger'
}

// Get rating badge style class
function getRatingBadgeClass(post) {
  const percentage = calculatePercentage(post)
  
  if (percentage >= 70) return 'bg-success'
  if (percentage >= 40) return 'bg-warning'
  return 'bg-danger'
}
</script>

<style scoped>
.progress {
  min-width: 100px;
}
</style>