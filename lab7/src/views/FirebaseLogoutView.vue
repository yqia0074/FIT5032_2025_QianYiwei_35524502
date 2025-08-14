<template>
  <div class="firebase-logout">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8">
          <div class="card">
            <div class="card-header">
              <h1>User Logout</h1>
            </div>
            <div class="card-body">
              <div v-if="currentUser" class="user-info">
                <h3>Current User Information</h3>
                <div class="alert alert-info">
                  <p><strong>Email:</strong> {{ currentUser.email }}</p>
                  <p><strong>User ID:</strong> {{ currentUser.uid }}</p>
                  <p><strong>Role:</strong> {{ userRole }}</p>
                  <p><strong>Email Verified:</strong> {{ currentUser.emailVerified ? 'Yes' : 'No' }}</p>
                  <p><strong>Creation Time:</strong> {{ formatDate(currentUser.metadata.creationTime) }}</p>
                  <p><strong>Last Sign In:</strong> {{ formatDate(currentUser.metadata.lastSignInTime) }}</p>
                </div>
                
                <div class="logout-actions">
                  <button @click="logout" class="btn btn-danger me-3">Sign Out</button>
                  <button @click="goHome" class="btn btn-secondary">Go to Home</button>
                </div>
              </div>
              
              <div v-else class="alert alert-warning">
                <h4>No User Signed In</h4>
                <p>You are not currently signed in to the system.</p>
                <button @click="goToLogin" class="btn btn-primary">Go to Login</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue"
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth"
import { useRouter } from "vue-router"

const currentUser = ref(null)
const userRole = ref("")
const router = useRouter()
const auth = getAuth()

const logout = () => {
  signOut(auth).then(() => {
    console.log("User signed out successfully")
    localStorage.removeItem('userRole')
    currentUser.value = null
    userRole.value = ""
    alert("You have been signed out successfully!")
    router.push("/FireLogin")
  }).catch((error) => {
    console.error("Sign out error:", error)
    alert("Error signing out: " + error.message)
  })
}

const goHome = () => {
  router.push("/")
}

const goToLogin = () => {
  router.push("/FireLogin")
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleString()
}

// Monitor authentication state
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser.value = user
      userRole.value = localStorage.getItem('userRole') || 'user'
      console.log("Current user in logout page:", user)
      console.log("User role:", userRole.value)
    } else {
      currentUser.value = null
      userRole.value = ""
      console.log("No user signed in")
    }
  })
})
</script>

<style scoped>
.firebase-logout {
  padding: 2rem 0;
}

.card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: none;
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.card-header h1 {
  margin: 0;
  font-size: 1.5rem;
  text-align: center;
}

.user-info {
  text-align: left;
}

.user-info h3 {
  color: #495057;
  margin-bottom: 1rem;
}

.logout-actions {
  margin-top: 1.5rem;
  text-align: center;
}

.alert {
  margin-bottom: 1rem;
}

.alert p {
  margin-bottom: 0.5rem;
}

.alert p:last-child {
  margin-bottom: 0;
}
</style>