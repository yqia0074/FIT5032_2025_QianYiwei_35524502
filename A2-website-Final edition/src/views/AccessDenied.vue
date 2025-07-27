<template>
  <div class="container mt-5 text-center">
    <div class="alert alert-danger">
      <h2><i class="bi bi-exclamation-triangle-fill me-2"></i>Access Denied</h2>
      <p class="mt-3">You do not have permission to access this page. Please log in first.</p>
      <router-link to="/login" class="btn btn-primary mt-3">Go to Login</router-link>
    </div>
  </div>
</template>

<script setup>
// No additional logic needed
</script>