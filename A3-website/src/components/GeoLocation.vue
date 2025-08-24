<template>
  <div class="geo-location-container">
    <div class="header-section">
      <h2 class="section-title">Geo Location</h2>
      <p class="section-description">Find mental health resources near you</p>
      
      <div class="privacy-notice">
        <i class="bi bi-info-circle"></i>
        Your location data is only used to show nearby resources and is never stored on our servers.
      </div>
    </div>

    <div class="search-section">
      <div class="search-card">
        <h3>Find Mental Health Resources</h3>
        <p>Enter your location to find nearby mental health resources and support services</p>
        
        <!-- Search Input -->
        <div class="search-input-section">
          <div class="search-input-wrapper">
            <input 
              v-model="searchQuery"
              @keyup.enter="performSearch"
              type="text" 
              class="search-input"
              placeholder="Enter your city, suburb, or postcode (e.g., Sydney, Melbourne, Brisbane...)"
            >
            <button 
              @click="performSearch"
              :disabled="isSearching || !searchQuery.trim()"
              class="search-btn"
            >
              <i v-if="isSearching" class="bi bi-arrow-repeat spinning"></i>
              <i v-else class="bi bi-search"></i>
              {{ isSearching ? 'Searching...' : 'Search' }}
            </button>
          </div>
          
          <!-- Search Loading -->
          <div v-if="isSearching" class="search-loading">
            <div class="loading-dots">
              <span></span><span></span><span></span>
            </div>
            <p>Finding mental health resources near you...</p>
          </div>
        </div>
        
        <div class="divider">
          <span>or</span>
        </div>
        
        <div class="city-selection">
          <h4>Quick Access - Popular Cities:</h4>
          <div class="city-buttons">
            <button 
              v-for="city in cities" 
              :key="city.name"
              @click="selectCity(city)"
              :class="['city-btn', { active: selectedCity?.name === city.name }]"
            >
              {{ city.name }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Results Section -->
    <div v-if="selectedCity" class="results-section">
      <div class="map-section">
        <h4>{{ selectedCity.name }} Area Map</h4>
        <div class="fake-map">
          <div class="map-container">
            <!-- Map Header -->
            <div class="map-header">
              <div class="map-title">
                <i class="bi bi-map"></i>
                <span>{{ selectedCity.name }} Mental Health Resources</span>
              </div>
              <div class="map-legend">
                <div class="legend-item">
                  <i class="bi bi-geo-alt-fill" style="color: #e74c3c;"></i>
                  <span>Mental Health Centers</span>
                </div>
              </div>
            </div>
            
            <!-- Interactive Map -->
            <div class="interactive-map">
              <!-- Static Map Image -->
              <div class="map-image-container">
                <img src="/src/assets/sydney-map.svg" alt="Sydney Map" class="static-map-image" />
                
                <!-- Resource Markers Overlay -->
                <div class="map-markers">
                  <div 
                    v-for="(resource, index) in selectedCity.resources" 
                    :key="resource.id"
                    class="marker"
                    :style="{ 
                      left: resource.mapPosition.x + '%', 
                      top: resource.mapPosition.y + '%' 
                    }"
                    :title="resource.name"
                    @click="highlightResource(resource.id)"
                  >
                    <div class="marker-pin">
                      <i class="bi bi-geo-alt-fill"></i>
                    </div>
                    <div class="marker-popup">
                      <strong>{{ resource.name }}</strong><br>
                      <small>{{ resource.distance }}km away</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Map Controls -->
            <div class="map-controls">
              <button class="map-control-btn" title="Zoom In">
                <i class="bi bi-plus"></i>
              </button>
              <button class="map-control-btn" title="Zoom Out">
                <i class="bi bi-dash"></i>
              </button>
              <button class="map-control-btn" title="Center Map">
                <i class="bi bi-crosshair"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="resources-section">
        <h4>Nearby Mental Health Resources in {{ selectedCity.name }}</h4>
        <div class="resources-grid">
          <div 
            v-for="resource in selectedCity.resources" 
            :key="resource.id"
            class="resource-card"
          >
            <div class="resource-header">
              <div class="resource-icon">
                <i :class="resource.icon"></i>
              </div>
              <div class="resource-info">
                <h5>{{ resource.name }}</h5>
                <div class="distance">
                  <i class="bi bi-geo-alt"></i>
                  {{ resource.distance }} km away
                </div>
              </div>
            </div>
            
            <p class="resource-description">{{ resource.description }}</p>
            
            <div class="resource-details">
              <div class="detail-item">
                <i class="bi bi-telephone"></i>
                <span>{{ resource.phone }}</span>
              </div>
              <div class="detail-item">
                <i class="bi bi-clock"></i>
                <span>{{ resource.hours }}</span>
              </div>
              <div class="detail-item">
                <i class="bi bi-star-fill"></i>
                <span>{{ resource.rating }}/5 ({{ resource.reviews }} reviews)</span>
              </div>
            </div>
            
            <div class="resource-actions">
              <button class="btn btn-primary btn-sm">
                <i class="bi bi-telephone"></i>
                Call Now
              </button>
              <button class="btn btn-outline-primary btn-sm">
                <i class="bi bi-info-circle"></i>
                More Info
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Initial State -->
    <div v-else class="initial-state">
      <div class="placeholder-content">
        <i class="bi bi-geo-alt placeholder-icon"></i>
        <h4>Select a City to Get Started</h4>
        <p>Choose from one of the popular cities above to see mental health resources in that area.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 搜索相关的响应式变量
const searchQuery = ref('')
const isSearching = ref(false)
const highlightedResourceId = ref(null)

// 预设的城市数据
const cities = ref([
  {
    name: 'Sydney',
    resources: [
      {
        id: 1,
        name: 'Sydney Mental Health Center',
        distance: '2.3',
        description: 'Comprehensive mental health services including counseling, therapy, and support groups.',
        phone: '(02) 9876-5432',
        icon: 'bi-building',
        hours: 'Mon-Fri 9AM-6PM',
        rating: 4.5,
        reviews: 127,
        mapPosition: { x: 30, y: 40 }
      },
      {
        id: 2,
        name: 'Youth Counseling Sydney',
        distance: '3.7',
        description: 'Specialized mental health services for teenagers and young adults.',
        phone: '(02) 9876-5433',
        icon: 'bi-people',
        hours: 'Mon-Sat 10AM-8PM',
        rating: 4.8,
        reviews: 89,
        mapPosition: { x: 60, y: 25 }
      },
      {
        id: 3,
        name: 'Crisis Support Sydney',
        distance: '1.2',
        description: '24/7 crisis support and emergency mental health services.',
        phone: '1800-123-456',
        icon: 'bi-telephone-fill',
        hours: '24/7',
        rating: 4.9,
        reviews: 234,
        mapPosition: { x: 45, y: 60 }
      }
    ]
  },
  {
    name: 'Melbourne',
    resources: [
      {
        id: 4,
        name: 'Melbourne Wellness Hub',
        distance: '1.8',
        description: 'Holistic mental health approach with therapy, meditation, and wellness programs.',
        phone: '(03) 9876-5432',
        icon: 'bi-heart',
        hours: 'Mon-Fri 8AM-7PM',
        rating: 4.6,
        reviews: 156,
        mapPosition: { x: 35, y: 35 }
      },
      {
        id: 5,
        name: 'Family Counseling Melbourne',
        distance: '4.2',
        description: 'Family therapy and relationship counseling services.',
        phone: '(03) 9876-5433',
        icon: 'bi-house-heart',
        hours: 'Tue-Sat 9AM-6PM',
        rating: 4.4,
        reviews: 92,
        mapPosition: { x: 65, y: 50 }
      },
      {
        id: 6,
        name: 'Mindfulness Center Melbourne',
        distance: '2.9',
        description: 'Mindfulness-based therapy and meditation practices.',
        phone: '(03) 9876-5434',
        icon: 'bi-peace',
        hours: 'Mon-Sun 7AM-9PM',
        rating: 4.7,
        reviews: 78,
        mapPosition: { x: 20, y: 65 }
      }
    ]
  },
  {
    name: 'Brisbane',
    resources: [
      {
        id: 7,
        name: 'Brisbane Community Health',
        distance: '3.1',
        description: 'Community-based mental health services and support programs.',
        phone: '(07) 3876-5432',
        icon: 'bi-people-fill',
        hours: 'Mon-Fri 9AM-5PM',
        rating: 4.3,
        reviews: 143,
        mapPosition: { x: 40, y: 30 }
      },
      {
        id: 8,
        name: 'Teen Support Brisbane',
        distance: '2.5',
        description: 'Specialized support services for teenagers and adolescents.',
        phone: '(07) 3876-5433',
        icon: 'bi-emoji-smile',
        hours: 'Mon-Sat 10AM-7PM',
        rating: 4.8,
        reviews: 67,
        mapPosition: { x: 70, y: 45 }
      }
    ]
  },
  {
    name: 'Perth',
    resources: [
      {
        id: 9,
        name: 'Perth Mental Wellness',
        distance: '2.7',
        description: 'Comprehensive mental health and wellness services.',
        phone: '(08) 9876-5432',
        icon: 'bi-shield-heart',
        hours: 'Mon-Fri 8AM-6PM',
        rating: 4.5,
        reviews: 98,
        mapPosition: { x: 50, y: 40 }
      }
    ]
  },
  {
    name: 'Adelaide',
    resources: [
      {
        id: 10,
        name: 'Adelaide Care Center',
        distance: '1.9',
        description: 'Caring mental health services for all ages.',
        phone: '(08) 8876-5432',
        icon: 'bi-heart-pulse',
        hours: 'Mon-Fri 9AM-5PM',
        rating: 4.4,
        reviews: 76,
        mapPosition: { x: 45, y: 55 }
      }
    ]
  },
  {
    name: 'Canberra',
    resources: [
      {
        id: 11,
        name: 'Capital Mental Health',
        distance: '3.4',
        description: 'Government-supported mental health services.',
        phone: '(02) 6876-5432',
        icon: 'bi-building-gear',
        hours: 'Mon-Fri 8AM-5PM',
        rating: 4.2,
        reviews: 54,
        mapPosition: { x: 55, y: 35 }
      }
    ]
  }
])

const selectedCity = ref(null)

// 搜索功能
function performSearch() {
  if (!searchQuery.value.trim() || isSearching.value) return
  
  isSearching.value = true
  
  // 模拟搜索过程
  setTimeout(() => {
    const query = searchQuery.value.toLowerCase().trim()
    
    // 查找匹配的城市
    const matchedCity = cities.value.find(city => 
      city.name.toLowerCase().includes(query) ||
      query.includes(city.name.toLowerCase())
    )
    
    if (matchedCity) {
      selectedCity.value = matchedCity
    } else {
      // 如果没有找到匹配的城市，默认显示悉尼的结果
      selectedCity.value = cities.value[0] // Sydney
    }
    
    isSearching.value = false
  }, 1500) // 1.5秒的搜索延迟，模拟真实搜索
}

function selectCity(city) {
  selectedCity.value = city
  searchQuery.value = city.name
}

function highlightResource(resourceId) {
  highlightedResourceId.value = resourceId
  
  // 3秒后取消高亮
  setTimeout(() => {
    highlightedResourceId.value = null
  }, 3000)
}
</script>

<style scoped>
.geo-location-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header-section {
  text-align: center;
  margin-bottom: 30px;
}

.section-title {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 2.5rem;
  font-weight: 600;
}

.section-description {
  color: #7f8c8d;
  font-size: 1.1rem;
  margin-bottom: 20px;
}

.privacy-notice {
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
  padding: 15px;
  color: #856404;
  display: flex;
  align-items: center;
  gap: 10px;
  max-width: 600px;
  margin: 0 auto;
}

.search-section {
  margin-bottom: 30px;
}

.search-card {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.search-card h3 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1.8rem;
}

.search-card p {
  color: #7f8c8d;
  margin-bottom: 25px;
  font-size: 1.1rem;
}

/* Search Input Styles */
.search-input-section {
  margin-bottom: 25px;
}

.search-input-wrapper {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e6ed;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.search-input:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.search-btn {
  padding: 12px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
  justify-content: center;
}

.search-btn:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-1px);
}

.search-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.search-loading {
  text-align: center;
  padding: 20px;
  color: #7f8c8d;
}

.loading-dots {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-bottom: 10px;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #3498db;
  animation: bounce 1.4s ease-in-out infinite both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }
.loading-dots span:nth-child(3) { animation-delay: 0s; }

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

.divider {
  position: relative;
  text-align: center;
  margin: 25px 0;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e0e6ed;
}

.divider span {
  background: white;
  padding: 0 15px;
  color: #7f8c8d;
  font-size: 0.9rem;
  position: relative;
}

.city-selection h4 {
  color: #34495e;
  margin-bottom: 20px;
  text-align: left;
}

.city-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}

.city-btn {
  background: #ecf0f1;
  border: 2px solid #bdc3c7;
  border-radius: 25px;
  padding: 10px 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  color: #2c3e50;
}

.city-btn:hover {
  background: #3498db;
  border-color: #3498db;
  color: white;
  transform: translateY(-2px);
}

.city-btn.active {
  background: #2980b9;
  border-color: #2980b9;
  color: white;
}

.results-section {
  margin-top: 30px;
}

.map-section {
  margin-bottom: 30px;
}

.map-section h4 {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 1.5rem;
}

.fake-map {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.map-container {
  position: relative;
}

.map-header {
  background: #f8f9fa;
  padding: 15px 20px;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.map-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2c3e50;
  font-size: 1.1rem;
}

.map-legend {
  display: flex;
  gap: 15px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.9rem;
  color: #6c757d;
}

.interactive-map {
  position: relative;
  height: 350px;
  background: #f8f9fa;
}

.map-image-container {
  position: relative;
  width: 100%;
  height: 100%;
}

.static-map-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.map-markers {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.marker {
  position: absolute;
  transform: translate(-50%, -100%);
  pointer-events: all;
  cursor: pointer;
  z-index: 10;
}

.marker-pin {
  background: #ff6b6b;
  color: white;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 6px rgba(0,0,0,0.3);
  transition: all 0.2s ease;
  border: 3px solid white;
  font-weight: bold;
  font-size: 12px;
}

.marker-pin i {
  font-size: 14px;
}

.marker:hover .marker-pin {
  background: #ff4444;
  transform: scale(1.15);
  box-shadow: 0 4px 8px rgba(0,0,0,0.4);
}

.marker-popup {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  padding: 10px 14px;
  border-radius: 6px;
  box-shadow: 0 3px 12px rgba(0,0,0,0.2);
  white-space: nowrap;
  font-size: 13px;
  margin-bottom: 8px;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  z-index: 20;
  border: 1px solid #e0e0e0;
}

.marker-popup::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 6px solid transparent;
  border-top-color: white;
}

.marker:hover .marker-popup {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(-2px);
}

.map-controls {
  position: absolute;
  top: 70px;
  right: 15px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.map-control-btn {
  width: 35px;
  height: 35px;
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.map-control-btn:hover {
  background: #f8f9fa;
  border-color: #3498db;
  color: #3498db;
}

.resources-section h4 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.5rem;
}

.resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
}

.resource-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.resource-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
}

.resource-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.resource-icon {
  width: 50px;
  height: 50px;
  background: #3498db;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  margin-right: 15px;
}

.resource-info h5 {
  color: #2c3e50;
  margin-bottom: 5px;
  font-size: 1.2rem;
  font-weight: 600;
}

.distance {
  color: #7f8c8d;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.resource-description {
  color: #5a6c7d;
  margin-bottom: 15px;
  line-height: 1.5;
}

.resource-details {
  margin-bottom: 15px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #5a6c7d;
  font-size: 0.9rem;
}

.detail-item i {
  color: #3498db;
  width: 16px;
}

.resource-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 5px;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-outline-primary {
  background: transparent;
  color: #3498db;
  border: 1px solid #3498db;
}

.btn-outline-primary:hover {
  background: #3498db;
  color: white;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 0.8rem;
}

.initial-state {
  text-align: center;
  padding: 60px 20px;
}

.placeholder-content {
  max-width: 400px;
  margin: 0 auto;
}

.placeholder-icon {
  font-size: 4rem;
  color: #bdc3c7;
  margin-bottom: 20px;
}

.placeholder-content h4 {
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 1.5rem;
}

.placeholder-content p {
  color: #7f8c8d;
  line-height: 1.6;
}

@media (max-width: 768px) {
  .city-buttons {
    justify-content: center;
  }
  
  .resources-grid {
    grid-template-columns: 1fr;
  }
  
  .resource-actions {
    flex-direction: column;
  }
  
  .search-card {
    padding: 20px;
  }
  
  .search-input-wrapper {
    flex-direction: column;
    gap: 15px;
  }
  
  .search-input {
    width: 100%;
  }
  
  .search-btn {
    width: 100%;
    justify-content: center;
  }
  
  .map-header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .map-legend {
    justify-content: center;
  }
  
  .interactive-map {
    height: 250px;
  }
  
  .map-controls {
    top: 60px;
    right: 10px;
  }
  
  .map-control-btn {
    width: 30px;
    height: 30px;
    font-size: 0.8rem;
  }
  
  .marker-popup {
    font-size: 0.7rem;
    padding: 6px 8px;
  }
}
</style>