<template>
  <div class="articles-container">
    <h3>Mental Health Articles for Teenagers</h3>
    <p class="text-muted">Browse through our collection of articles designed to support teenage mental health.</p>
    
    <!-- Safety Tip -->
    <div class="alert alert-info" role="alert">
      <i class="bi bi-shield-lock"></i> Your reading history and ratings are stored securely on your device only.
    </div>

    <!-- Article list and detail view toggle -->
    <div v-if="!selectedArticle" class="article-list">
      <div class="row">
        <div class="col-md-4 mb-3" v-for="article in articles" :key="article.id">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">{{ article.title }}</h5>
              <h6 class="card-subtitle mb-2 text-muted">By {{ article.author }}</h6>
              <p class="card-text">{{ article.content.substring(0, 100) }}...</p>
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <button @click="viewArticle(article)" class="btn btn-primary btn-sm me-2">Read More</button>
                  <button @click="addToOfflineReading(article)" class="btn btn-outline-success btn-sm" :disabled="isInOfflineList(article.id)">
                    <i class="bi bi-bookmark-plus"></i>
                    {{ isInOfflineList(article.id) ? 'Saved' : 'Save' }}
                  </button>
                </div>
                <div>
                  <span class="badge bg-secondary me-1">{{ calculateRating(article) }}</span>
                  <span class="badge bg-info">{{ article.ratings.length }} ratings</span>
                </div>
              </div>
            </div>
            <div class="card-footer">
              <small class="text-muted">
                <span v-for="(tag, index) in article.tags" :key="index" class="badge bg-light text-dark me-1">
                  #{{ tag }}
                </span>
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Article detail view -->
    <div v-else class="article-detail">
      <button @click="selectedArticle = null" class="btn btn-outline-secondary mb-3">
        <i class="bi bi-arrow-left"></i> Back to Articles
      </button>
      
      <div class="card">
        <div class="card-body">
          <h3 class="card-title">{{ selectedArticle.title }}</h3>
          <h6 class="card-subtitle mb-3 text-muted">By {{ selectedArticle.author }}</h6>
          
          <div class="tags mb-3">
            <span v-for="(tag, index) in selectedArticle.tags" :key="index" class="badge bg-light text-dark me-1">
              #{{ tag }}
            </span>
          </div>
          
          <p class="card-text article-content">{{ selectedArticle.content }}</p>
          
          <!-- Offline reading action -->
          <div class="mb-3">
            <button @click="addToOfflineReading(selectedArticle)" class="btn btn-outline-success" :disabled="isInOfflineList(selectedArticle.id)">
              <i class="bi bi-bookmark-plus"></i>
              {{ isInOfflineList(selectedArticle.id) ? 'Already Saved for Offline Reading' : 'Save for Offline Reading' }}
            </button>
          </div>
          
          <!-- Article rating component -->
          <ArticleRating 
            v-model:article="selectedArticle" 
            articleType="teenager"
            @update:article="updateArticle"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import ArticleRating from './ArticleRating.vue'
import teenagerArticles from '../assets/teenagerArticles.json'

// Article data
const articles = ref([])
const selectedArticle = ref(null)

// Load articles when component is mounted
onMounted(() => {
  loadArticles()
})

// Load article data
function loadArticles() {
  // Try to get article data from localStorage
  const storedArticles = localStorage.getItem('teenagerArticles')
  
  if (storedArticles) {
    try {
      articles.value = JSON.parse(storedArticles)
    } catch (e) {
      console.error('Failed to parse stored articles', e)
      initializeArticles()
    }
  } else {
    initializeArticles()
  }
}

// Initialize article data
function initializeArticles() {
  articles.value = teenagerArticles
  saveArticles()
}

// Save article data to localStorage
function saveArticles() {
  localStorage.setItem('teenagerArticles', JSON.stringify(articles.value))
}

// View article details
function viewArticle(article) {
  selectedArticle.value = { ...article }
  
  // Record reading history
  recordReadingHistory(article.id)
}

// Update article
function updateArticle(updatedArticle) {
  // Update selected article
  selectedArticle.value = updatedArticle
  
  // Update article in the article list
  const index = articles.value.findIndex(a => a.id === updatedArticle.id)
  if (index >= 0) {
    articles.value[index] = updatedArticle
    saveArticles()
  }
}

// Record reading history
function recordReadingHistory(articleId) {
  const userId = getUserId()
  if (!userId) return
  
  const historyKey = `teenagerArticleHistory_${userId}`
  let history = []
  
  const historyStr = localStorage.getItem(historyKey)
  if (historyStr) {
    try {
      history = JSON.parse(historyStr)
    } catch (e) {
      console.error('Failed to parse reading history', e)
    }
  }
  
  // Add or update reading record
  const existingIndex = history.findIndex(h => h.articleId === articleId)
  const readData = {
    articleId,
    timestamp: new Date().toISOString(),
    count: 1
  }
  
  if (existingIndex >= 0) {
    readData.count = history[existingIndex].count + 1
    history[existingIndex] = readData
  } else {
    history.push(readData)
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

// Calculate rating percentage
function calculateRating(article) {
  const total = article.likes + article.dislikes
  if (total === 0) return 'No ratings'
  
  const percentage = Math.round((article.likes / total) * 100)
  return `${percentage}% positive`
}

// Add article to offline reading list
function addToOfflineReading(article) {
  if (isInOfflineList(article.id)) {
    alert('This article is already saved for offline reading.')
    return
  }
  
  // Get existing offline reading list
  let offlineList = []
  const offlineListStr = localStorage.getItem('offlineReadingList')
  
  if (offlineListStr) {
    try {
      offlineList = JSON.parse(offlineListStr)
    } catch (e) {
      console.error('Failed to parse offline reading list', e)
      offlineList = []
    }
  }
  
  // Add article to offline list
  const offlineArticle = {
    id: article.id,
    title: article.title,
    author: article.author,
    content: article.content,
    tags: article.tags,
    type: 'teenager',
    timestamp: new Date().toISOString()
  }
  
  offlineList.push(offlineArticle)
  
  // Save to localStorage
  localStorage.setItem('offlineReadingList', JSON.stringify(offlineList))
  
  alert('Article saved for offline reading!')
}

// Check if article is in offline reading list
function isInOfflineList(articleId) {
  const offlineListStr = localStorage.getItem('offlineReadingList')
  
  if (!offlineListStr) return false
  
  try {
    const offlineList = JSON.parse(offlineListStr)
    return offlineList.some(item => item.id === articleId)
  } catch (e) {
    console.error('Failed to parse offline reading list', e)
    return false
  }
}

// Watch for article changes and save to localStorage
watch(articles, () => {
  saveArticles()
}, { deep: true })
</script>

<style scoped>
.article-content {
  white-space: pre-line;
  line-height: 1.6;
}

.article-list {
  margin-top: 1rem;
}

.article-detail {
  margin-top: 1rem;
}
</style>