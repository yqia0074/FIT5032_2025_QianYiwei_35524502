<template>
  <div class="geo-location-simple">
    <h4>简化地理位置测试</h4>
    
    <div v-if="status === 'idle'" class="text-center">
      <button @click="handleLocationRequest" class="btn btn-primary">
        <i class="bi bi-geo-alt"></i> 获取位置
      </button>
      <p class="text-muted mt-2">点击按钮获取您的地理位置</p>
    </div>
    
    <div v-else-if="status === 'loading'" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">正在获取位置...</p>
    </div>
    
    <div v-else-if="status === 'success'" class="alert alert-success">
      <h5>位置获取成功！</h5>
      <p><strong>纬度:</strong> {{ locationData.latitude }}</p>
      <p><strong>经度:</strong> {{ locationData.longitude }}</p>
      <p><strong>精度:</strong> {{ locationData.accuracy }}米</p>
      <p><strong>时间:</strong> {{ locationData.timestamp }}</p>
      <button @click="resetLocation" class="btn btn-sm btn-outline-primary">重新获取</button>
    </div>
    
    <div v-else-if="status === 'error'" class="alert alert-danger">
      <h5>获取位置失败</h5>
      <p>{{ errorMessage }}</p>
      <button @click="handleLocationRequest" class="btn btn-sm btn-outline-danger">重试</button>
    </div>
    
    <!-- 调试信息 -->
    <div class="mt-3">
      <h6>调试信息:</h6>
      <ul class="list-unstyled small">
        <li v-for="log in debugLogs" :key="log.id" class="mb-1">
          <span class="text-muted">{{ log.time }}:</span> {{ log.message }}
        </li>
      </ul>
      <button @click="clearLogs" class="btn btn-sm btn-outline-secondary">清空日志</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 响应式数据
const status = ref('idle') // idle, loading, success, error
const locationData = ref(null)
const errorMessage = ref('')
const debugLogs = ref([])
let logId = 0

// 添加调试日志
function addLog(message) {
  const now = new Date()
  debugLogs.value.push({
    id: logId++,
    time: now.toLocaleTimeString(),
    message: message
  })
  console.log(`[GeoLocationSimple] ${message}`)
}

// 清空日志
function clearLogs() {
  debugLogs.value = []
}

// 重置位置
function resetLocation() {
  status.value = 'idle'
  locationData.value = null
  errorMessage.value = ''
  addLog('位置已重置')
}

// 处理位置请求
function handleLocationRequest() {
  addLog('开始位置请求')
  status.value = 'loading'
  errorMessage.value = ''
  
  // 检查地理位置API支持
  if (!navigator.geolocation) {
    addLog('浏览器不支持地理位置API')
    status.value = 'error'
    errorMessage.value = '您的浏览器不支持地理位置功能'
    return
  }
  
  // 检查安全环境
  if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    addLog(`安全检查失败: ${window.location.protocol}, ${window.location.hostname}`)
    status.value = 'error'
    errorMessage.value = '地理位置功能需要HTTPS环境或localhost'
    return
  }
  
  addLog('开始调用getCurrentPosition')
  
  const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  }
  
  addLog(`配置选项: ${JSON.stringify(options)}`)
  
  navigator.geolocation.getCurrentPosition(
    // 成功回调
    (position) => {
      addLog('地理位置获取成功')
      addLog(`坐标: ${position.coords.latitude}, ${position.coords.longitude}`)
      
      locationData.value = {
        latitude: position.coords.latitude.toFixed(6),
        longitude: position.coords.longitude.toFixed(6),
        accuracy: position.coords.accuracy,
        timestamp: new Date(position.timestamp).toLocaleString()
      }
      
      status.value = 'success'
      addLog('状态设置为成功')
    },
    // 错误回调
    (error) => {
      addLog(`地理位置获取失败: 错误代码 ${error.code}`)
      addLog(`错误信息: ${error.message}`)
      
      status.value = 'error'
      
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMessage.value = '用户拒绝了地理位置请求。请在浏览器设置中允许位置访问。'
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage.value = '位置信息不可用。请检查您的网络连接和GPS设置。'
          break
        case error.TIMEOUT:
          errorMessage.value = '获取位置超时。请重试。'
          break
        default:
          errorMessage.value = `未知错误: ${error.message}`
          break
      }
      
      addLog(`错误处理完成: ${errorMessage.value}`)
    },
    options
  )
}

// 组件挂载时添加初始日志
addLog('组件已挂载')
addLog(`当前协议: ${window.location.protocol}`)
addLog(`当前主机: ${window.location.hostname}`)
addLog(`地理位置API支持: ${'geolocation' in navigator ? '是' : '否'}`)
</script>

<style scoped>
.geo-location-simple {
  padding: 1rem;
  border: 1px solid #dee2e6;
  border-radius: 0.5rem;
  background: #f8f9fa;
}

.spinner-border {
  width: 2rem;
  height: 2rem;
}

.list-unstyled li {
  font-family: monospace;
  font-size: 0.8rem;
}
</style>