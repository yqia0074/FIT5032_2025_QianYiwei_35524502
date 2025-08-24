<template>
  <div class="geo-test-container p-4">
    <h3>地理位置功能测试</h3>
    
    <!-- 环境信息 -->
    <div class="card mb-3">
      <div class="card-header">
        <h5>环境检查</h5>
      </div>
      <div class="card-body">
        <p><strong>协议:</strong> {{ protocol }}</p>
        <p><strong>主机名:</strong> {{ hostname }}</p>
        <p><strong>地理位置API支持:</strong> {{ geolocationSupported ? '✓ 支持' : '✗ 不支持' }}</p>
        <p><strong>浏览器:</strong> {{ userAgent }}</p>
      </div>
    </div>
    
    <!-- 测试按钮和结果 -->
    <div class="card mb-3">
      <div class="card-header">
        <h5>地理位置测试</h5>
      </div>
      <div class="card-body">
        <button 
          @click="testGeolocation" 
          class="btn btn-primary me-2"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2"></span>
          {{ isLoading ? '获取中...' : '测试地理位置' }}
        </button>
        
        <button 
          @click="checkPermission" 
          class="btn btn-secondary"
        >
          检查权限状态
        </button>
        
        <!-- 结果显示 -->
        <div v-if="result" class="mt-3">
          <div 
            :class="['alert', result.type === 'success' ? 'alert-success' : 'alert-danger']"
          >
            <h6>{{ result.type === 'success' ? '成功' : '错误' }}</h6>
            <pre>{{ result.message }}</pre>
          </div>
        </div>
        
        <!-- 权限状态 -->
        <div v-if="permissionStatus" class="mt-3">
          <div class="alert alert-info">
            <h6>权限状态</h6>
            <p>{{ permissionStatus }}</p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 控制台日志 -->
    <div class="card">
      <div class="card-header">
        <h5>调试日志</h5>
        <button @click="clearLogs" class="btn btn-sm btn-outline-secondary">清空日志</button>
      </div>
      <div class="card-body">
        <div class="logs-container" style="max-height: 300px; overflow-y: auto;">
          <div v-for="(log, index) in logs" :key="index" class="log-entry mb-1">
            <small class="text-muted">{{ log.time }}</small>
            <span class="ms-2">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

// 响应式数据
const protocol = ref(window.location.protocol)
const hostname = ref(window.location.hostname)
const geolocationSupported = ref('geolocation' in navigator)
const userAgent = ref(navigator.userAgent)
const isLoading = ref(false)
const result = ref(null)
const permissionStatus = ref('')
const logs = ref([])

// 添加日志
function addLog(message) {
  const now = new Date()
  logs.value.push({
    time: now.toLocaleTimeString(),
    message: message
  })
  console.log(message)
}

// 清空日志
function clearLogs() {
  logs.value = []
}

// 测试地理位置
function testGeolocation() {
  addLog('开始地理位置测试')
  result.value = null
  isLoading.value = true
  
  // 检查支持性
  if (!navigator.geolocation) {
    addLog('浏览器不支持地理位置API')
    result.value = {
      type: 'error',
      message: '浏览器不支持地理位置API'
    }
    isLoading.value = false
    return
  }
  
  // 检查协议
  if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    addLog(`协议检查失败: ${window.location.protocol}, 主机: ${window.location.hostname}`)
    result.value = {
      type: 'error',
      message: '地理位置API需要HTTPS协议或localhost环境'
    }
    isLoading.value = false
    return
  }
  
  addLog('开始调用getCurrentPosition')
  
  const options = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  }
  
  addLog(`选项配置: ${JSON.stringify(options)}`)
  
  navigator.geolocation.getCurrentPosition(
    // 成功回调
    (position) => {
      addLog('地理位置获取成功')
      addLog(`坐标: ${position.coords.latitude}, ${position.coords.longitude}`)
      addLog(`精度: ${position.coords.accuracy}米`)
      
      result.value = {
        type: 'success',
        message: `纬度: ${position.coords.latitude}\n经度: ${position.coords.longitude}\n精度: ${position.coords.accuracy}米\n时间: ${new Date(position.timestamp).toLocaleString()}`
      }
      isLoading.value = false
    },
    // 错误回调
    (error) => {
      addLog(`地理位置获取失败: 错误代码 ${error.code}`)
      addLog(`错误信息: ${error.message}`)
      
      let errorMessage = ''
      switch(error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = '用户拒绝了地理位置请求'
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage = '位置信息不可用'
          break
        case error.TIMEOUT:
          errorMessage = '请求超时'
          break
        default:
          errorMessage = '未知错误'
          break
      }
      
      result.value = {
        type: 'error',
        message: `错误代码: ${error.code}\n错误类型: ${errorMessage}\n详细信息: ${error.message}`
      }
      isLoading.value = false
    },
    options
  )
}

// 检查权限状态
async function checkPermission() {
  addLog('检查地理位置权限状态')
  
  if (!navigator.permissions) {
    addLog('浏览器不支持权限API')
    permissionStatus.value = '浏览器不支持权限API'
    return
  }
  
  try {
    const permission = await navigator.permissions.query({name: 'geolocation'})
    addLog(`权限状态: ${permission.state}`)
    permissionStatus.value = `当前状态: ${permission.state}`
    
    // 监听权限变化
    permission.onchange = function() {
      addLog(`权限状态变更为: ${this.state}`)
      permissionStatus.value = `当前状态: ${this.state} (已变更)`
    }
  } catch (error) {
    addLog(`权限检查失败: ${error.message}`)
    permissionStatus.value = `检查失败: ${error.message}`
  }
}

// 组件挂载时的初始化
onMounted(() => {
  addLog('地理位置测试组件已加载')
  addLog(`当前环境: ${protocol.value}//${hostname.value}`)
  addLog(`地理位置API支持: ${geolocationSupported.value}`)
})
</script>

<style scoped>
.geo-test-container {
  max-width: 800px;
  margin: 0 auto;
}

.log-entry {
  font-family: monospace;
  font-size: 0.9em;
  padding: 2px 0;
  border-bottom: 1px solid #eee;
}

.logs-container {
  background-color: #f8f9fa;
  padding: 10px;
  border-radius: 4px;
}

pre {
  white-space: pre-wrap;
  margin: 0;
}
</style>