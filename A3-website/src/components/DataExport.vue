<template>
  <div class="data-export-component">
    <!-- Export Header -->
    <div class="export-header mb-4">
      <h4 class="mb-3">
        <i class="bi bi-download me-2" aria-hidden="true"></i>
        Data Export
      </h4>
      <p class="text-muted">Export your data in various formats for analysis or backup purposes.</p>
    </div>

    <!-- Export Configuration -->
    <div class="export-config card">
      <div class="card-body">
        <!-- Format Selection -->
        <div class="mb-4">
          <label class="form-label fw-bold">Export Format</label>
          <div class="format-options">
            <div 
              v-for="format in exportFormats" 
              :key="format.value"
              class="format-option"
              :class="{ active: selectedFormat === format.value }"
              @click="selectedFormat = format.value"
              role="radio"
              :aria-checked="selectedFormat === format.value"
              tabindex="0"
              @keydown.enter="selectedFormat = format.value"
              @keydown.space.prevent="selectedFormat = format.value"
            >
              <i :class="format.icon" class="format-icon" aria-hidden="true"></i>
              <div class="format-info">
                <div class="format-label">{{ format.label }}</div>
                <div class="format-description">{{ getFormatDescription(format.value) }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Export Options -->
        <div class="mb-4">
          <label class="form-label fw-bold">Export Options</label>
          
          <!-- Filename -->
          <div class="mb-3">
            <label for="export-filename" class="form-label">Filename</label>
            <input 
              id="export-filename"
              v-model="exportOptions.filename" 
              type="text" 
              class="form-control"
              placeholder="Enter filename (without extension)"
              aria-describedby="filename-help"
            >
            <div id="filename-help" class="form-text">
              The file extension will be added automatically based on the selected format.
            </div>
          </div>

          <!-- Date Range (if applicable) -->
          <div v-if="showDateRange" class="row mb-3">
            <div class="col-md-6">
              <label for="start-date" class="form-label">Start Date</label>
              <input 
                id="start-date"
                v-model="exportOptions.startDate" 
                type="date" 
                class="form-control"
              >
            </div>
            <div class="col-md-6">
              <label for="end-date" class="form-label">End Date</label>
              <input 
                id="end-date"
                v-model="exportOptions.endDate" 
                type="date" 
                class="form-control"
              >
            </div>
          </div>

          <!-- PDF Specific Options -->
          <div v-if="selectedFormat === 'pdf'" class="pdf-options">
            <div class="mb-3">
              <label for="pdf-title" class="form-label">Document Title</label>
              <input 
                id="pdf-title"
                v-model="exportOptions.pdfTitle" 
                type="text" 
                class="form-control"
                placeholder="Enter document title"
              >
            </div>
            
            <div class="form-check mb-2">
              <input 
                id="include-stats"
                v-model="exportOptions.includeStats" 
                class="form-check-input" 
                type="checkbox"
              >
              <label class="form-check-label" for="include-stats">
                Include summary statistics
              </label>
            </div>
            
            <div class="form-check mb-2">
              <input 
                id="include-date"
                v-model="exportOptions.includeDate" 
                class="form-check-input" 
                type="checkbox"
              >
              <label class="form-check-label" for="include-date">
                Include generation date
              </label>
            </div>
          </div>

          <!-- CSV Specific Options -->
          <div v-if="selectedFormat === 'csv'" class="csv-options">
            <div class="form-check mb-2">
              <input 
                id="include-headers"
                v-model="exportOptions.includeHeaders" 
                class="form-check-input" 
                type="checkbox"
              >
              <label class="form-check-label" for="include-headers">
                Include column headers
              </label>
            </div>
          </div>
        </div>

        <!-- Data Preview -->
        <div class="mb-4">
          <label class="form-label fw-bold">Data Preview</label>
          <div class="data-preview">
            <div class="preview-stats">
              <span class="badge bg-primary me-2">{{ dataCount }} records</span>
              <span v-if="filteredDataCount !== dataCount" class="badge bg-info">
                {{ filteredDataCount }} after filters
              </span>
            </div>
            
            <div v-if="previewData.length > 0" class="preview-table-container">
              <table class="table table-sm table-bordered preview-table">
                <thead class="table-light">
                  <tr>
                    <th v-for="header in previewHeaders" :key="header">{{ header }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, index) in previewData" :key="index">
                    <td v-for="header in previewHeaders" :key="header">
                      {{ formatPreviewValue(row[header]) }}
                    </td>
                  </tr>
                </tbody>
              </table>
              <div v-if="dataCount > 3" class="text-muted small">
                Showing first 3 rows of {{ dataCount }} total records
              </div>
            </div>
            
            <div v-else class="text-muted text-center py-3">
              No data available for export
            </div>
          </div>
        </div>

        <!-- Export Actions -->
        <div class="export-actions">
          <button 
            @click="performExport" 
            :disabled="!canExport || isExporting"
            class="btn btn-primary me-2"
            :aria-describedby="!canExport ? 'export-disabled-help' : null"
          >
            <span v-if="isExporting" class="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>
            <i v-else class="bi bi-download me-2" aria-hidden="true"></i>
            {{ isExporting ? 'Exporting...' : 'Export Data' }}
          </button>
          
          <button 
            @click="resetOptions" 
            class="btn btn-outline-secondary"
            :disabled="isExporting"
          >
            <i class="bi bi-arrow-clockwise me-2" aria-hidden="true"></i>
            Reset Options
          </button>
          
          <div v-if="!canExport" id="export-disabled-help" class="form-text text-danger mt-2">
          {{ exportDisabledReason }}
        </div>
        </div>

        <!-- Export Status -->
        <div v-if="exportStatus" class="export-status mt-3">
          <div 
            :class="[
              'alert',
              exportStatus.type === 'success' ? 'alert-success' : 'alert-danger'
            ]"
            role="alert"
          >
            <i 
              :class="[
                'bi',
                exportStatus.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle',
                'me-2'
              ]"
              aria-hidden="true"
            ></i>
            {{ exportStatus.message }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { 
  exportData, 
  getExportFormats, 
  validateExportData 
} from '../utils/exportUtils.js'

// Props
const props = defineProps({
  data: {
    type: Array,
    default: () => []
  },
  defaultFilename: {
    type: String,
    default: 'export'
  },
  showDateRange: {
    type: Boolean,
    default: false
  },
  maxPreviewRows: {
    type: Number,
    default: 3
  }
})

// Emits
const emit = defineEmits(['export-started', 'export-completed', 'export-failed'])

// Reactive data
const selectedFormat = ref('csv')
const isExporting = ref(false)
const exportStatus = ref(null)

const exportOptions = ref({
  filename: props.defaultFilename,
  startDate: '',
  endDate: '',
  pdfTitle: 'Data Export Report',
  includeStats: true,
  includeDate: true,
  includeHeaders: true
})

// Export formats
const exportFormats = ref(getExportFormats())

// Computed properties
const dataCount = computed(() => props.data.length)

const filteredDataCount = computed(() => {
  // Apply date filtering if date range is specified
  if (!props.showDateRange || !exportOptions.value.startDate || !exportOptions.value.endDate) {
    return dataCount.value
  }
  
  // This would be implemented based on your data structure
  return dataCount.value
})

const previewData = computed(() => {
  return props.data.slice(0, props.maxPreviewRows)
})

const previewHeaders = computed(() => {
  if (props.data.length === 0) return []
  return Object.keys(props.data[0])
})

const canExport = computed(() => {
  const validation = validateExportData(props.data)
  return validation.valid && exportOptions.value.filename.trim() !== ''
})

const exportDisabledReason = computed(() => {
  const validation = validateExportData(props.data)
  if (!validation.valid) {
    return validation.error
  }
  if (exportOptions.value.filename.trim() === '') {
    return 'Please enter a filename'
  }
  return ''
})

// Methods
const getFormatDescription = (format) => {
  const descriptions = {
    csv: 'Spreadsheet compatible format, ideal for data analysis',
    json: 'Structured data format, perfect for developers and APIs',
    pdf: 'Formatted document, great for reports and presentations'
  }
  return descriptions[format] || ''
}

const formatPreviewValue = (value) => {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string' && value.length > 30) {
    return value.substring(0, 30) + '...'
  }
  return value
}

const performExport = async () => {
  if (!canExport.value || isExporting.value) return
  
  isExporting.value = true
  exportStatus.value = null
  
  try {
    emit('export-started', { format: selectedFormat.value, options: exportOptions.value })
    
    const options = {
      headers: exportOptions.value.includeHeaders ? previewHeaders.value : null,
      title: exportOptions.value.pdfTitle,
      includeStats: exportOptions.value.includeStats,
      includeDate: exportOptions.value.includeDate
    }
    
    await exportData(
      props.data,
      selectedFormat.value,
      exportOptions.value.filename,
      options
    )
    
    exportStatus.value = {
      type: 'success',
      message: `Data exported successfully as ${selectedFormat.value.toUpperCase()}`
    }
    
    emit('export-completed', { 
      format: selectedFormat.value, 
      filename: exportOptions.value.filename,
      recordCount: props.data.length
    })
    
  } catch (error) {
    console.error('Export failed:', error)
    exportStatus.value = {
      type: 'error',
      message: `Export failed: ${error.message}`
    }
    
    emit('export-failed', { error: error.message, format: selectedFormat.value })
  } finally {
    isExporting.value = false
    
    // Clear status after 5 seconds
    setTimeout(() => {
      exportStatus.value = null
    }, 5000)
  }
}

const resetOptions = () => {
  exportOptions.value = {
    filename: props.defaultFilename,
    startDate: '',
    endDate: '',
    pdfTitle: 'Data Export Report',
    includeStats: true,
    includeDate: true,
    includeHeaders: true
  }
  selectedFormat.value = 'csv'
  exportStatus.value = null
}

// Watch for data changes
watch(() => props.data, () => {
  exportStatus.value = null
}, { deep: true })

// Initialize component
onMounted(() => {
  // Set default end date to today
  const today = new Date().toISOString().split('T')[0]
  exportOptions.value.endDate = today
  
  // Set default start date to 30 days ago
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  exportOptions.value.startDate = thirtyDaysAgo.toISOString().split('T')[0]
  
  // Ensure filename is set if not already
  if (!exportOptions.value.filename || exportOptions.value.filename.trim() === '') {
    exportOptions.value.filename = props.defaultFilename || 'export'
  }
})
</script>

<style scoped>
.data-export-component {
  max-width: 800px;
}

.export-header {
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 1rem;
}

.format-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
}

.format-option {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 2px solid #dee2e6;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: #fff;
}

.format-option:hover {
  border-color: #007bff;
  background-color: #f8f9fa;
}

.format-option.active {
  border-color: #007bff;
  background-color: #e7f3ff;
}

.format-option:focus {
  outline: 3px solid #007bff;
  outline-offset: 2px;
}

.format-icon {
  font-size: 2rem;
  margin-right: 1rem;
  color: #007bff;
}

.format-info {
  flex: 1;
}

.format-label {
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.format-description {
  font-size: 0.875rem;
  color: #6c757d;
}

.data-preview {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 1rem;
  background-color: #f8f9fa;
}

.preview-stats {
  margin-bottom: 1rem;
}

.preview-table-container {
  max-height: 200px;
  overflow-y: auto;
}

.preview-table {
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.preview-table th,
.preview-table td {
  padding: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 150px;
}

.export-actions {
  border-top: 1px solid #dee2e6;
  padding-top: 1rem;
}

.export-status {
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.pdf-options,
.csv-options {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.375rem;
  margin-top: 0.5rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .format-options {
    grid-template-columns: 1fr;
  }
  
  .format-option {
    padding: 0.75rem;
  }
  
  .format-icon {
    font-size: 1.5rem;
    margin-right: 0.75rem;
  }
}
</style>