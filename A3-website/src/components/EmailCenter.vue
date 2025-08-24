<template>
  <div class="my-4">
    <h3>Enhanced Email Center</h3>
    
    <!-- Email Mode Selection -->
    <div class="mb-3">
      <div class="btn-group" role="group" aria-label="Email mode selection">
        <input type="radio" class="btn-check" name="emailMode" id="single" v-model="emailMode" value="single" autocomplete="off" checked>
        <label class="btn btn-outline-primary" for="single">Single Email</label>
        
        <input type="radio" class="btn-check" name="emailMode" id="bulk" v-model="emailMode" value="bulk" autocomplete="off">
        <label class="btn btn-outline-primary" for="bulk">Bulk Email</label>
      </div>
    </div>

    <form @submit.prevent="sendEmail" class="email-form">
      <!-- Single Email Mode -->
      <div v-if="emailMode === 'single'">
        <div class="mb-3">
          <label for="recipient" class="form-label">Recipient Email *</label>
          <input 
            id="recipient"
            v-model="recipient" 
            type="email"
            class="form-control" 
            placeholder="Enter recipient email" 
            required 
            aria-describedby="recipientHelp"
          />
          <div id="recipientHelp" class="form-text">Enter a valid email address</div>
        </div>
      </div>

      <!-- Bulk Email Mode -->
      <div v-if="emailMode === 'bulk'">
        <div class="mb-3">
          <label for="userSelection" class="form-label">Select Recipients</label>
          <div class="form-check">
            <input class="form-check-input" type="checkbox" id="selectAll" v-model="selectAll" @change="toggleSelectAll">
            <label class="form-check-label" for="selectAll">
              Select All Users ({{ availableUsers.length }} users)
            </label>
          </div>
          <div class="user-selection-container mt-2">
            <div v-for="user in availableUsers" :key="user.id" class="form-check">
              <input 
                class="form-check-input" 
                type="checkbox" 
                :id="`user-${user.id}`" 
                v-model="selectedUsers" 
                :value="user.email"
              >
              <label class="form-check-label" :for="`user-${user.id}`">
                {{ user.username }} ({{ user.email }}) - {{ user.role }}
              </label>
            </div>
          </div>
          <div class="form-text">{{ selectedUsers.length }} users selected</div>
        </div>
      </div>

      <!-- Email Subject -->
      <div class="mb-3">
        <label for="subject" class="form-label">Subject *</label>
        <input 
          id="subject"
          v-model="subject" 
          type="text"
          class="form-control" 
          placeholder="Enter email subject" 
          required
        />
      </div>

      <!-- Email Message -->
      <div class="mb-3">
        <label for="message" class="form-label">Message *</label>
        <textarea 
          id="message"
          v-model="message" 
          class="form-control" 
          rows="5"
          placeholder="Enter your message" 
          required
          aria-describedby="messageHelp"
        ></textarea>
        <div id="messageHelp" class="form-text">Write your email content here</div>
      </div>

      <!-- File Attachment -->
      <div class="mb-3">
        <label for="attachment" class="form-label">Attachment (Optional)</label>
        <input 
          id="attachment"
          type="file" 
          class="form-control" 
          @change="handleFileUpload"
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
          aria-describedby="attachmentHelp"
        />
        <div id="attachmentHelp" class="form-text">Supported formats: PDF, DOC, DOCX, TXT, JPG, PNG (Max 5MB)</div>
        <div v-if="attachedFile" class="mt-2">
          <small class="text-success">
            <i class="bi bi-paperclip"></i> {{ attachedFile.name }} ({{ formatFileSize(attachedFile.size) }})
            <button type="button" class="btn btn-sm btn-outline-danger ms-2" @click="removeAttachment">
              Remove
            </button>
          </small>
        </div>
      </div>

      <!-- Email Template Selection -->
      <div class="mb-3">
        <label for="template" class="form-label">Email Template (Optional)</label>
        <select id="template" v-model="selectedTemplate" class="form-select" @change="applyTemplate">
          <option value="">Select a template</option>
          <option value="welcome">Welcome Message</option>
          <option value="newsletter">Newsletter</option>
          <option value="reminder">Appointment Reminder</option>
          <option value="support">Mental Health Support</option>
        </select>
      </div>

      <!-- Send Button -->
      <div class="d-grid">
        <button 
          type="submit" 
          class="btn btn-primary btn-lg"
          :disabled="isLoading || !isFormValid"
        >
          <span v-if="isLoading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ isLoading ? 'Sending...' : (emailMode === 'bulk' ? `Send to ${selectedUsers.length} users` : 'Send Email') }}
        </button>
      </div>
    </form>

    <!-- Status Messages -->
    <div v-if="status" class="mt-3">
      <div :class="statusClass" role="alert">
        <i :class="statusIcon"></i>
        {{ status }}
      </div>
    </div>

    <!-- Email History -->
    <div class="mt-4">
      <h5>Recent Email History</h5>
      <div v-if="emailHistory.length === 0" class="text-muted">
        No emails sent yet.
      </div>
      <div v-else class="email-history">
        <div v-for="email in emailHistory.slice(0, 5)" :key="email.id" class="card mb-2">
          <div class="card-body py-2">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <strong>{{ email.subject }}</strong>
                <br>
                <small class="text-muted">
                  To: {{ email.recipients.length > 1 ? `${email.recipients.length} recipients` : email.recipients[0] }}
                  | {{ formatDate(email.timestamp) }}
                </small>
              </div>
              <span :class="`badge ${email.status === 'sent' ? 'bg-success' : 'bg-danger'}`">
                {{ email.status }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// Reactive data
const emailMode = ref('single')
const recipient = ref('')
const selectedUsers = ref([])
const selectAll = ref(false)
const subject = ref('')
const message = ref('')
const attachedFile = ref(null)
const selectedTemplate = ref('')
const status = ref('')
const isLoading = ref(false)
const availableUsers = ref([])
const emailHistory = ref([])

// Email templates
const emailTemplates = {
  welcome: {
    subject: 'Welcome to Mental Health Support Platform',
    message: 'Dear User,\n\nWelcome to our mental health support platform! We\'re here to provide you with resources and support for your mental wellbeing journey.\n\nBest regards,\nMental Health Support Team'
  },
  newsletter: {
    subject: 'Monthly Mental Health Newsletter',
    message: 'Dear Subscriber,\n\nHere\'s your monthly update on mental health resources, tips, and community highlights.\n\nStay healthy,\nMental Health Support Team'
  },
  reminder: {
    subject: 'Appointment Reminder',
    message: 'Dear User,\n\nThis is a friendly reminder about your upcoming appointment. Please don\'t hesitate to contact us if you need to reschedule.\n\nBest regards,\nMental Health Support Team'
  },
  support: {
    subject: 'Mental Health Support Resources',
    message: 'Dear User,\n\nWe hope you\'re doing well. Here are some mental health resources that might be helpful for you.\n\nRemember, you\'re not alone in this journey.\n\nWith care,\nMental Health Support Team'
  }
}

// Computed properties
const isFormValid = computed(() => {
  const hasRecipients = emailMode.value === 'single' ? recipient.value.trim() : selectedUsers.value.length > 0
  return hasRecipients && subject.value.trim() && message.value.trim()
})

const statusClass = computed(() => {
  if (!status.value) return ''
  return status.value.includes('successfully') || status.value.includes('sent') 
    ? 'alert alert-success' 
    : 'alert alert-danger'
})

const statusIcon = computed(() => {
  if (!status.value) return ''
  return status.value.includes('successfully') || status.value.includes('sent')
    ? 'bi bi-check-circle-fill me-2'
    : 'bi bi-exclamation-triangle-fill me-2'
})

// Methods
function loadAvailableUsers() {
  // Load users from localStorage or use sample data
  const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]')
  if (users.length === 0) {
    // Sample users for demonstration
    availableUsers.value = [
      { id: 1, username: 'john_doe', email: 'john@example.com', role: 'teenager' },
      { id: 2, username: 'jane_smith', email: 'jane@example.com', role: 'worker' },
      { id: 3, username: 'admin_user', email: 'admin@example.com', role: 'admin' },
      { id: 4, username: 'sarah_wilson', email: 'sarah@example.com', role: 'teenager' },
      { id: 5, username: 'mike_johnson', email: 'mike@example.com', role: 'worker' }
    ]
  } else {
    availableUsers.value = users.filter(user => user.email)
  }
}

function toggleSelectAll() {
  if (selectAll.value) {
    selectedUsers.value = availableUsers.value.map(user => user.email)
  } else {
    selectedUsers.value = []
  }
}

function handleFileUpload(event) {
  const file = event.target.files[0]
  if (file) {
    // Check file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      status.value = 'File size must be less than 5MB'
      event.target.value = ''
      return
    }
    attachedFile.value = file
    status.value = ''
  }
}

function removeAttachment() {
  attachedFile.value = null
  const fileInput = document.getElementById('attachment')
  if (fileInput) fileInput.value = ''
}

function applyTemplate() {
  if (selectedTemplate.value && emailTemplates[selectedTemplate.value]) {
    const template = emailTemplates[selectedTemplate.value]
    subject.value = template.subject
    message.value = template.message
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString()
}

function loadEmailHistory() {
  const history = JSON.parse(localStorage.getItem('emailHistory') || '[]')
  emailHistory.value = history.sort((a, b) => b.timestamp - a.timestamp)
}

function saveEmailToHistory(emailData) {
  const history = JSON.parse(localStorage.getItem('emailHistory') || '[]')
  history.unshift({
    id: Date.now(),
    ...emailData,
    timestamp: Date.now()
  })
  // Keep only last 50 emails
  if (history.length > 50) {
    history.splice(50)
  }
  localStorage.setItem('emailHistory', JSON.stringify(history))
  loadEmailHistory()
}

async function sendEmail() {
  if (!isFormValid.value) {
    status.value = 'Please fill in all required fields'
    return
  }

  isLoading.value = true
  status.value = ''

  try {
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    const recipients = emailMode.value === 'single' ? [recipient.value] : selectedUsers.value
    
    // Simulate email API call
    const emailData = {
      recipients,
      subject: subject.value,
      message: message.value,
      attachment: attachedFile.value ? attachedFile.value.name : null,
      mode: emailMode.value,
      status: 'sent'
    }

    // Save to history
    saveEmailToHistory(emailData)

    // Show success message
    if (emailMode.value === 'bulk') {
      status.value = `Bulk email sent successfully to ${recipients.length} recipients!`
    } else {
      status.value = `Email sent successfully to ${recipient.value}!`
    }

    // Reset form
    resetForm()

  } catch (error) {
    status.value = 'Failed to send email. Please try again.'
    console.error('Email sending error:', error)
  } finally {
    isLoading.value = false
  }
}

function resetForm() {
  recipient.value = ''
  selectedUsers.value = []
  selectAll.value = false
  subject.value = ''
  message.value = ''
  selectedTemplate.value = ''
  removeAttachment()
}

// Watch for changes in selectedUsers to update selectAll
watch(selectedUsers, (newVal) => {
  selectAll.value = newVal.length === availableUsers.value.length && availableUsers.value.length > 0
}, { deep: true })

// Lifecycle
onMounted(() => {
  loadAvailableUsers()
  loadEmailHistory()
})
</script>

<style scoped>
.email-form {
  max-width: 800px;
}

.user-selection-container {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
  padding: 0.5rem;
  background-color: #f8f9fa;
}

.email-history {
  max-height: 300px;
  overflow-y: auto;
}

.btn-check:checked + .btn-outline-primary {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
}

.form-label {
  font-weight: 600;
  color: #495057;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

@media (max-width: 768px) {
  .email-form {
    max-width: 100%;
  }
  
  .user-selection-container {
    max-height: 150px;
  }
}
</style>


