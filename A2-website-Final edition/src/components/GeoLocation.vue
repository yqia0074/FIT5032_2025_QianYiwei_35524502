<template>
  <div class="geo-location-container">
    <h4>Geo Location</h4>
    <p class="text-muted">Find mental health resources near you</p>
    
    <!-- Security notice -->
    <div class="alert alert-warning" role="alert">
      <i class="bi bi-shield-exclamation"></i> 
      Your location data is only used to show nearby resources and is never stored on our servers.
    </div>
    
    <!-- Location information display -->
    <div v-if="locationStatus === 'loading'" class="text-center my-4">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Requesting your location...</p>
    </div>
    
    <div v-else-if="locationStatus === 'error'" class="alert alert-danger">
      <i class="bi bi-exclamation-triangle"></i> 
      {{ locationError }}
      <button @click="requestLocation" class="btn btn-sm btn-outline-danger mt-2">Try Again</button>
    </div>
    
    <div v-else-if="locationStatus === 'success'" class="location-info">
      <div class="card mb-3">
        <div class="card-body">
          <h5 class="card-title">Your Location</h5>
          <p class="card-text">
            <i class="bi bi-geo-alt-fill text-danger"></i> 
            <span v-if="address">
              {{ address }}
            </span>
            <span v-else>
              Latitude: {{ location.latitude.toFixed(6) }}, 
              Longitude: {{ location.longitude.toFixed(6) }}
            </span>
          </p>
        </div>
      </div>
      
      <!-- Simulated nearby resources -->
      <h5>Mental Health Resources Near You</h5>
      <div class="list-group">
        <a href="#" class="list-group-item list-group-item-action" v-for="(resource, index) in nearbyResources" :key="index">
          <div class="d-flex w-100 justify-content-between">
            <h6 class="mb-1">{{ resource.name }}</h6>
            <small>{{ resource.distance }} km</small>
          </div>
          <p class="mb-1">{{ resource.description }}</p>
          <small>
            <i class="bi bi-telephone"></i> {{ resource.phone }}
          </small>
        </a>
      </div>
    </div>
    
    <div v-else class="text-center my-3">
      <button @click="requestLocation" class="btn btn-primary">
        <i class="bi bi-geo-alt"></i> Share Your Location
      </button>
      <p class="text-muted mt-2 small">We need your location to show nearby mental health resources</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// Location status and data
const locationStatus = ref('idle') // idle, loading, success, error
const locationError = ref('')
const location = ref(null)
const address = ref('')

// Simulated nearby resources data
const nearbyResources = ref([])

// Check geolocation permissions when component is mounted
onMounted(() => {
  // Check if browser supports geolocation API
  if (!navigator.geolocation) {
    locationStatus.value = 'error'
    locationError.value = 'Geolocation is not supported by your browser.'
    return
  }
  
  // Check if there is saved location data
  const savedLocation = localStorage.getItem('userLocation')
  if (savedLocation) {
    try {
      location.value = JSON.parse(savedLocation)
      locationStatus.value = 'success'
      generateNearbyResources()
    } catch (e) {
      console.error('Failed to parse saved location', e)
      localStorage.removeItem('userLocation')
    }
  }
})

// Request user location
function requestLocation() {
  // Security check: ensure HTTPS environment or localhost
  if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    locationStatus.value = 'error'
    locationError.value = 'Geolocation requires a secure connection (HTTPS).'
    return
  }
  
  locationStatus.value = 'loading'
  
  // Request geolocation
  navigator.geolocation.getCurrentPosition(
    // Success callback
    (position) => {
      location.value = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        timestamp: new Date().toISOString()
      }
      
      // Save location to localStorage (only coordinates, no personal information)
      localStorage.setItem('userLocation', JSON.stringify(location.value))
      
      // Try to get address
      reverseGeocode(position.coords.latitude, position.coords.longitude)
      
      // Generate nearby resources
      generateNearbyResources()
      
      locationStatus.value = 'success'
    },
    // Error callback
    (error) => {
      locationStatus.value = 'error'
      
      switch(error.code) {
        case error.PERMISSION_DENIED:
          locationError.value = 'User denied the request for geolocation.'
          break
        case error.POSITION_UNAVAILABLE:
          locationError.value = 'Location information is unavailable.'
          break
        case error.TIMEOUT:
          locationError.value = 'The request to get user location timed out.'
          break
        default:
          locationError.value = 'An unknown error occurred.'
          break
      }
    },
    // Options
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  )
}

// Reverse geocoding (convert coordinates to address)
function reverseGeocode(latitude, longitude) {
  // Note: In real applications, this should call a geocoding API (like Google Maps API, Mapbox, etc.)
  // Since this is a demo, we use simulated data
  
  // Simulate API call delay
  setTimeout(() => {
    // Generate a simulated address
    address.value = 'Sample Street, City, Country'
  }, 1000)
}

// Generate nearby resources (simulated data)
function generateNearbyResources() {
  // In real applications, this should get real data from API based on user location
  // Here we use simulated data
  
  nearbyResources.value = [
    {
      name: 'Community Mental Health Center',
      distance: (Math.random() * 5).toFixed(1),
      description: 'Offers counseling, therapy, and support groups for various mental health issues.',
      phone: '(123) 456-7890'
    },
    {
      name: 'Youth Counseling Services',
      distance: (Math.random() * 8).toFixed(1),
      description: 'Specialized mental health services for teenagers and young adults.',
      phone: '(123) 456-7891'
    },
    {
      name: 'Workplace Wellness Center',
      distance: (Math.random() * 10).toFixed(1),
      description: 'Provides resources and counseling for work-related stress and mental health concerns.',
      phone: '(123) 456-7892'
    },
    {
      name: 'Crisis Support Hotline',
      distance: 'N/A',
      description: '24/7 hotline for immediate mental health crisis support.',
      phone: '1-800-123-4567'
    }
  ]
  
  // Sort by distance (except crisis hotline)
  nearbyResources.value.sort((a, b) => {
    if (a.distance === 'N/A') return 1
    if (b.distance === 'N/A') return -1
    return parseFloat(a.distance) - parseFloat(b.distance)
  })
}
</script>

<style scoped>
.geo-location-container {
  margin-top: 1.5rem;
  margin-bottom: 1.5rem;
}

.location-info {
  margin-top: 1rem;
}
</style>