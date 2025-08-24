<template>
  <div class="article-rating">
    <!-- Rating display -->
    <div class="rating-display mb-3">
      <h5>Article Rating</h5>
      <div class="d-flex align-items-center">
        <div class="me-3">
          <button @click="likeArticle" class="btn btn-sm" :class="userLiked ? 'btn-primary' : 'btn-outline-primary'">
            <i class="bi bi-hand-thumbs-up-fill me-1"></i> Like ({{ article.likes }})
          </button>
        </div>
        <div class="me-3">
          <button @click="dislikeArticle" class="btn btn-sm" :class="userDisliked ? 'btn-danger' : 'btn-outline-danger'">
            <i class="bi bi-hand-thumbs-down-fill me-1"></i> Dislike ({{ article.dislikes }})
          </button>
        </div>
        <div class="ms-auto">
          <span class="badge bg-secondary">Rating: {{ calculateRating }}</span>
        </div>
      </div>
    </div>

    <!-- Star rating -->
    <div class="star-rating mb-3">
      <h5>Rate this article</h5>
      <div class="d-flex align-items-center">
        <div class="stars">
          <template v-for="n in 5" :key="n">
            <i 
              class="bi" 
              :class="{
                'bi-star-fill': userRating >= n,
                'bi-star': userRating < n
              }"
              @click="rateArticle(n)"
              style="cursor: pointer; font-size: 1.5rem; color: #ffc107;"
            ></i>
          </template>
        </div>
        <div class="ms-2">
          <span v-if="userRating > 0">Your rating: {{ userRating }}/5</span>
          <span v-else>Click to rate</span>
        </div>
      </div>
      <div v-if="article.ratings.length > 0" class="mt-2">
        <small class="text-muted">Average rating: {{ article.averageRating.toFixed(1) }}/5 ({{ article.ratings.length }} ratings)</small>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Receive article object and article type as props
const props = defineProps({
  article: {
    type: Object,
    required: true
  },
  articleType: {
    type: String,
    required: true,
    validator: (value) => ['teenager', 'worker'].includes(value)
  }
})

// Define events
const emit = defineEmits(['update:article'])

// User rating state
const userLiked = ref(false)
const userDisliked = ref(false)
const userRating = ref(0)

// Check user's previous rating state when component is mounted
onMounted(() => {
  loadUserRatingState()
})

// Load user rating state
function loadUserRatingState() {
  const userId = getUserId()
  if (!userId) return

  // Get user rating records
  const userRatingsKey = `${props.articleType}ArticleRatings_${userId}`
  const userRatingsStr = localStorage.getItem(userRatingsKey)
  
  if (userRatingsStr) {
    try {
      const userRatings = JSON.parse(userRatingsStr)
      const articleRating = userRatings.find(r => r.articleId === props.article.id)
      
      if (articleRating) {
        userLiked.value = articleRating.liked || false
        userDisliked.value = articleRating.disliked || false
        userRating.value = articleRating.rating || 0
      }
    } catch (e) {
      console.error('Failed to parse user ratings', e)
    }
  }
}

// Save user rating state
function saveUserRatingState() {
  const userId = getUserId()
  if (!userId) return

  // Get existing rating records
  const userRatingsKey = `${props.articleType}ArticleRatings_${userId}`
  let userRatings = []
  
  const userRatingsStr = localStorage.getItem(userRatingsKey)
  if (userRatingsStr) {
    try {
      userRatings = JSON.parse(userRatingsStr)
    } catch (e) {
      console.error('Failed to parse user ratings', e)
    }
  }

  // Update or add rating for current article
  const existingIndex = userRatings.findIndex(r => r.articleId === props.article.id)
  const ratingData = {
    articleId: props.article.id,
    liked: userLiked.value,
    disliked: userDisliked.value,
    rating: userRating.value,
    timestamp: new Date().toISOString()
  }

  if (existingIndex >= 0) {
    userRatings[existingIndex] = ratingData
  } else {
    userRatings.push(ratingData)
  }

  // Save to localStorage
  localStorage.setItem(userRatingsKey, JSON.stringify(userRatings))

  // Save article rating data
  saveArticleRatings()
}

// Save article rating data to localStorage
function saveArticleRatings() {
  const articlesKey = `${props.articleType}Articles`
  const articlesStr = localStorage.getItem(articlesKey)
  
  if (articlesStr) {
    try {
      const articles = JSON.parse(articlesStr)
      const index = articles.findIndex(a => a.id === props.article.id)
      
      if (index >= 0) {
        articles[index] = { ...props.article }
        localStorage.setItem(articlesKey, JSON.stringify(articles))
      }
    } catch (e) {
      console.error('Failed to save article ratings', e)
    }
  }
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
const calculateRating = computed(() => {
  const total = props.article.likes + props.article.dislikes
  if (total === 0) return 'N/A'
  
  const percentage = Math.round((props.article.likes / total) * 100)
  return `${percentage}%`
})

// Like article
function likeArticle() {
  if (!getUserId()) {
    alert('Please log in to rate articles')
    return
  }

  const article = { ...props.article }
  
  if (userLiked.value) {
    // Cancel like
    article.likes--
    userLiked.value = false
  } else {
    // Like
    article.likes++
    userLiked.value = true
    
    // If previously disliked, cancel dislike
    if (userDisliked.value) {
      article.dislikes--
      userDisliked.value = false
    }
  }
  
  // Update article
  emit('update:article', article)
  
  // Save user rating state
  saveUserRatingState()
}

// Dislike article
function dislikeArticle() {
  if (!getUserId()) {
    alert('Please log in to rate articles')
    return
  }

  const article = { ...props.article }
  
  if (userDisliked.value) {
    // Cancel dislike
    article.dislikes--
    userDisliked.value = false
  } else {
    // Dislike
    article.dislikes++
    userDisliked.value = true
    
    // If previously liked, cancel like
    if (userLiked.value) {
      article.likes--
      userLiked.value = false
    }
  }
  
  // Update article
  emit('update:article', article)
  
  // Save user rating state
  saveUserRatingState()
}

// Star rating
function rateArticle(rating) {
  if (!getUserId()) {
    alert('Please log in to rate articles')
    return
  }

  const article = { ...props.article }
  const userId = getUserId()
  
  // Check if user has already rated
  const existingRatingIndex = article.ratings.findIndex(r => r.userId === userId)
  
  if (existingRatingIndex >= 0) {
    // Update existing rating
    article.ratings[existingRatingIndex].rating = rating
  } else {
    // Add new rating
    article.ratings.push({
      userId,
      rating,
      timestamp: new Date().toISOString()
    })
  }
  
  // Calculate average rating
  if (article.ratings.length > 0) {
    const sum = article.ratings.reduce((total, r) => total + r.rating, 0)
    article.averageRating = sum / article.ratings.length
  } else {
    article.averageRating = 0
  }
  
  // Update user rating
  userRating.value = rating
  
  // Update article
  emit('update:article', article)
  
  // Save user rating state
  saveUserRatingState()
}
</script>

<style scoped>
.article-rating {
  border-top: 1px solid #eee;
  padding-top: 1rem;
  margin-top: 1rem;
}

.stars {
  display: inline-flex;
  gap: 0.25rem;
}
</style>