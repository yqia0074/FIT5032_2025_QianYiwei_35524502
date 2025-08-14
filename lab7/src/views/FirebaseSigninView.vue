<template>
  <div class="firebase-signin">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h1>Sign in</h1>
            </div>
            <div class="card-body">
              <p><input type="text" placeholder="Email" v-model="email" class="form-control mb-3" /></p>
              <p><input type="password" placeholder="Password" v-model="password" class="form-control mb-3" /></p>
              <p>
                <select v-model="selectedRole" class="form-control mb-3">
                  <option value="">Select Role</option>
                  <option value="admin">Administrator</option>
                  <option value="user">Regular User</option>
                  <option value="guest">Guest</option>
                  <option value="moderator">Moderator</option>
                </select>
              </p>
              <p><button @click="signin" class="btn btn-primary w-100" :disabled="!selectedRole">Sign in via Firebase</button></p>
              <div v-if="currentUser" class="mt-3 alert alert-success">
                <strong>Current User:</strong> {{ currentUser.email }}<br>
                <strong>Role:</strong> {{ userRole }}<br>
                <strong>UID:</strong> {{ currentUser.uid }}
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
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth"
import { useRouter } from "vue-router"

const email = ref("")
const password = ref("")
const selectedRole = ref("")
const currentUser = ref(null)
const userRole = ref("")
const router = useRouter()
const auth = getAuth()

const signin = () => {
  if (!selectedRole.value) {
    alert("Please select a role before signing in.")
    return
  }
  
  signInWithEmailAndPassword(auth, email.value, password.value)
    .then((data) => {
      console.log("Firebase Login Successful!")
      console.log("User:", data.user)
      console.log("Selected Role:", selectedRole.value)
      
      // Store role in localStorage for persistence
      localStorage.setItem('userRole', selectedRole.value)
      userRole.value = selectedRole.value
      currentUser.value = data.user
      
      // Don't redirect immediately, show user info first
      setTimeout(() => {
        router.push("/")
      }, 2000)
    }).catch((error) => {
      console.log("Login Error:", error.code)
      alert("Login failed: " + error.message)
    })
};

// Monitor authentication state
onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      currentUser.value = user
      userRole.value = localStorage.getItem('userRole') || 'user'
      console.log("Current authenticated user:", user)
      console.log("User role:", userRole.value)
    } else {
      currentUser.value = null
      userRole.value = ""
    }
  })
})
</script>

<style scoped>
.firebase-signin {
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
</style>