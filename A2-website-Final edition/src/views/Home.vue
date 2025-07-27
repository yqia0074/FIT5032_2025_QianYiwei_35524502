<template>
  <div class="container mt-5">

    <!-- Welcome section -->
    <div class="row align-items-center">
      <div class="col-md-8">
        <h1>Welcome to the Psychological Support Platform</h1>
        <p class="lead">
          Our platform provides mental health support, self-help tools, and community sharing for teenagers, workers, and administrators.
        </p>
        <div class="mt-4">
          <router-link v-if="!isAuthenticated" to="/login" class="btn btn-primary me-2">Login</router-link>
          <router-link v-if="!isAuthenticated" to="/register" class="btn btn-outline-secondary me-2">Register</router-link>
          <router-link v-if="isAuthenticated" to="/about" class="btn btn-info">Learn More</router-link>
        </div>
      </div>
      <div class="col-md-4 d-none d-md-block">
        <div class="bg-secondary text-white p-5 rounded d-flex align-items-center justify-content-center" style="height: 300px;">
          <h3 class="text-center">Mental Health Support</h3>
        </div>
      </div>
    </div>

    <!-- Features section -->
    <section class="my-5">
      <h2 class="text-center mb-4">Our Services</h2>
      <div class="row g-4">
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body text-center">
              <h3 class="h5 card-title">Mental Health Resources</h3>
              <p class="card-text">Access professional mental health articles, guides, and resources to help you understand and manage emotions.</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body text-center">
              <h3 class="h5 card-title">Self-Help Tools</h3>
              <p class="card-text">Use our mood diary, meditation audio, and other self-help tools to improve your mental health.</p>
            </div>
          </div>
        </div>
        <div class="col-md-4">
          <div class="card h-100">
            <div class="card-body text-center">
              <h3 class="h5 card-title">Community Support</h3>
              <p class="card-text">Join our community to share experiences, get support, and connect with others.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Carousel section -->
    <section class="my-5">
      <h2 class="text-center mb-4">Latest Announcements</h2>
      <div id="carouselExampleIndicators" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-indicators">
          <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="0" class="active"></button>
          <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="1"></button>
          <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="2"></button>
        </div>
        <div class="carousel-inner">
          <div class="carousel-item active">
            <div class="bg-primary text-white p-5 d-flex align-items-center justify-content-center" style="height: 300px;">
              <h3 class="text-center">Mental Health Lecture: How to Deal with Exam Stress</h3>
            </div>
          </div>
          <div class="carousel-item">
            <div class="bg-success text-white p-5 d-flex align-items-center justify-content-center" style="height: 300px;">
              <h3 class="text-center">New Meditation Course: Workplace Stress Relief Techniques</h3>
            </div>
          </div>
          <div class="carousel-item">
            <div class="bg-info text-white p-5 d-flex align-items-center justify-content-center" style="height: 300px;">
              <h3 class="text-center">Community Event: Share Your Mental Health Story</h3>
            </div>
          </div>
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="prev">
          <span class="carousel-control-prev-icon"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide="next">
          <span class="carousel-control-next-icon"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
    </section>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const isAuthenticated = ref(false)

onMounted(() => {
  // Check if user is authenticated
  const authStatus = localStorage.getItem('isAuthenticated')
  if (authStatus === 'true') {
    isAuthenticated.value = true
  }
})
</script>



