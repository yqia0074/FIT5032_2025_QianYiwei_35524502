<template>
  <div class="my-4">
    <h3>Community</h3>
    <div class="card mb-3" v-for="(post, index) in posts" :key="index">
      <div class="card-body">
        <h5 class="card-title">{{ post.user }}</h5>
        <p class="card-text">{{ post.content }}</p>
        <div class="d-flex align-items-center">
          <div class="me-3">
            <button @click="likePost(index)" class="btn btn-sm" :class="post.userLiked ? 'btn-primary' : 'btn-outline-primary'">
              <i class="bi bi-hand-thumbs-up-fill me-1"></i> Like ({{ post.likes }})
            </button>
          </div>
          <div class="me-3">
            <button @click="dislikePost(index)" class="btn btn-sm" :class="post.userDisliked ? 'btn-danger' : 'btn-outline-danger'">
              <i class="bi bi-hand-thumbs-down-fill me-1"></i> Dislike ({{ post.dislikes }})
            </button>
          </div>
          <div class="ms-auto">
            <div class="rating-display">
              <span class="badge bg-secondary">Rating: {{ calculateRating(post) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Add new post form -->
    <div class="card mt-4">
      <div class="card-body">
        <h5 class="card-title">Share Your Thoughts</h5>
        <div class="mb-3">
          <textarea v-model="newPostContent" class="form-control" rows="3" placeholder="What's on your mind?"></textarea>
        </div>
        <button @click="addPost" class="btn btn-primary" :disabled="!newPostContent.trim()">Post</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const newPostContent = ref('')
const posts = ref([])

// Load posts from localStorage on component mount
onMounted(() => {
  loadPosts()
})

// Load posts from localStorage
function loadPosts() {
  const storedPosts = localStorage.getItem('communityPosts')
  if (storedPosts) {
    try {
      posts.value = JSON.parse(storedPosts)
    } catch (e) {
      console.error('Failed to parse stored posts', e)
      // If parsing fails, initialize with default posts
      initializeDefaultPosts()
    }
  } else {
    // If no posts found, initialize with default posts
    initializeDefaultPosts()
  }
}

// Initialize with default posts
function initializeDefaultPosts() {
  posts.value = [
    { user: 'UserA', content: 'Today I feel much better after meditation.', likes: 5, dislikes: 1, userLiked: false, userDisliked: false },
    { user: 'UserB', content: 'Work was stressful, but I went for a walk.', likes: 3, dislikes: 0, userLiked: false, userDisliked: false },
    { user: 'UserC', content: 'I tried a new breathing technique today.', likes: 7, dislikes: 2, userLiked: false, userDisliked: false }
  ]
  // Save default posts to localStorage
  savePosts()
}

// Save posts to localStorage
function savePosts() {
  localStorage.setItem('communityPosts', JSON.stringify(posts.value))
}

// Calculate rating based on likes and dislikes
function calculateRating(post) {
  const total = post.likes + post.dislikes
  if (total === 0) return 'N/A'
  
  const percentage = Math.round((post.likes / total) * 100)
  return `${percentage}%`
}

// Like a post
function likePost(index) {
  const post = posts.value[index]
  
  if (post.userLiked) {
    // User is unliking
    post.likes--
    post.userLiked = false
  } else {
    // User is liking
    post.likes++
    post.userLiked = true
    
    // If user had previously disliked, remove the dislike
    if (post.userDisliked) {
      post.dislikes--
      post.userDisliked = false
    }
  }
  
  // Save changes to localStorage
  savePosts()
}

// Dislike a post
function dislikePost(index) {
  const post = posts.value[index]
  
  if (post.userDisliked) {
    // User is undisliking
    post.dislikes--
    post.userDisliked = false
  } else {
    // User is disliking
    post.dislikes++
    post.userDisliked = true
    
    // If user had previously liked, remove the like
    if (post.userLiked) {
      post.likes--
      post.userLiked = false
    }
  }
  
  // Save changes to localStorage
  savePosts()
}

// Add a new post
function addPost() {
  if (!newPostContent.value.trim()) return
  
  // Get current user from localStorage
  let username = 'Guest'
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      username = user.username || user.email
    } catch (e) {
      console.error('Failed to parse user information', e)
    }
  }
  
  // Add new post to the beginning of the array
  posts.value.unshift({
    user: username,
    content: newPostContent.value,
    likes: 0,
    dislikes: 0,
    userLiked: false,
    userDisliked: false,
    timestamp: new Date().toISOString() // Add timestamp for sorting if needed
  })
  
  // Save changes to localStorage
  savePosts()
  
  // Clear the input
  newPostContent.value = ''
}
</script>

<style scoped>
.rating-display {
  font-size: 0.9rem;
}
</style>


