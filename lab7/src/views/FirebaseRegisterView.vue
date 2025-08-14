<template>
  <div class="firebase-register">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card">
            <div class="card-header">
              <h1>Create an Account</h1>
            </div>
            <div class="card-body">
              <p><input type="text" placeholder="Email" v-model="email" class="form-control mb-3" /></p>
              <p><input type="password" placeholder="Password" v-model="password" class="form-control mb-3" /></p>
              <p><button @click="register" class="btn btn-primary w-100">Save to Firebase</button></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"
import { useRouter } from "vue-router"

const email = ref("")
const password = ref("")
const router = useRouter()
const auth = getAuth()

const register = () => {
  createUserWithEmailAndPassword(auth, email.value, password.value)
    .then((data) => {
      console.log("Firebase Register Successful!")
      router.push("/FireLogin")
    }).catch((error) => {
      console.log(error.code);
    })
};
</script>

<style scoped>
.firebase-register {
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