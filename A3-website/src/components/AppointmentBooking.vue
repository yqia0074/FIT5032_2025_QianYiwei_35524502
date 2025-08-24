<template>
  <div class="appointment-booking" role="main" aria-labelledby="booking-title">
    <div class="booking-header">
      <h2 id="booking-title">
        <i class="bi bi-calendar-check" aria-hidden="true"></i>
        Appointment Booking
      </h2>
      <p class="booking-description">
        Schedule your mental health support sessions with our qualified counselors
      </p>
    </div>

    <!-- Booking Form -->
    <div class="booking-form-section" v-if="showBookingForm">
      <div class="form-card">
        <h3>Book New Appointment</h3>
        <form @submit.prevent="submitBooking" class="booking-form">
          <div class="form-group">
            <label for="appointment-type">Appointment Type</label>
            <select 
              id="appointment-type" 
              v-model="newBooking.type" 
              required
              class="form-control"
            >
              <option value="">Select appointment type</option>
              <option value="individual">Individual Counseling</option>
              <option value="group">Group Therapy</option>
              <option value="crisis">Crisis Support</option>
              <option value="assessment">Mental Health Assessment</option>
            </select>
          </div>

          <div class="form-group">
            <label for="counselor">Preferred Counselor</label>
            <select 
              id="counselor" 
              v-model="newBooking.counselorId" 
              required
              class="form-control"
            >
              <option value="">Select counselor</option>
              <option 
                v-for="counselor in availableCounselors" 
                :key="counselor.id" 
                :value="counselor.id"
              >
                {{ counselor.name }} - {{ counselor.specialty }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="appointment-date">Preferred Date</label>
            <input 
              id="appointment-date" 
              type="date" 
              v-model="newBooking.date" 
              :min="minDate"
              :max="maxDate"
              required
              class="form-control"
            >
          </div>

          <div class="form-group">
            <label for="appointment-time">Preferred Time</label>
            <select 
              id="appointment-time" 
              v-model="newBooking.time" 
              required
              class="form-control"
            >
              <option value="">Select time slot</option>
              <option 
                v-for="slot in availableTimeSlots" 
                :key="slot.value" 
                :value="slot.value"
                :disabled="slot.booked"
              >
                {{ slot.label }} {{ slot.booked ? '(Booked)' : '' }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="notes">Additional Notes (Optional)</label>
            <textarea 
              id="notes" 
              v-model="newBooking.notes" 
              class="form-control"
              rows="3"
              placeholder="Any specific concerns or requirements..."
            ></textarea>
          </div>

          <div class="form-actions">
            <button type="button" @click="cancelBooking" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
              <span v-if="isSubmitting">
                <i class="bi bi-hourglass-split"></i> Booking...
              </span>
              <span v-else>
                <i class="bi bi-check-circle"></i> Book Appointment
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Calendar Section -->
    <div class="calendar-section">
      <div class="calendar-controls">
        <button 
          @click="showBookingForm = !showBookingForm" 
          class="btn btn-primary"
          :aria-expanded="showBookingForm"
        >
          <i class="bi bi-plus-circle"></i>
          {{ showBookingForm ? 'Hide Form' : 'Book New Appointment' }}
        </button>
        
        <div class="view-controls">
          <button 
            @click="changeView('dayGridMonth')" 
            :class="['btn', 'btn-outline-secondary', { active: currentView === 'dayGridMonth' }]"
          >
            Month
          </button>
          <button 
            @click="changeView('timeGridWeek')" 
            :class="['btn', 'btn-outline-secondary', { active: currentView === 'timeGridWeek' }]"
          >
            Week
          </button>
          <button 
            @click="changeView('timeGridDay')" 
            :class="['btn', 'btn-outline-secondary', { active: currentView === 'timeGridDay' }]"
          >
            Day
          </button>
        </div>
      </div>

      <div class="calendar-container">
        <FullCalendar
          ref="calendar"
          :options="calendarOptions"
        />
      </div>
    </div>

    <!-- Appointment Details Modal -->
    <div 
      v-if="selectedAppointment" 
      class="modal-overlay" 
      @click="closeAppointmentModal"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Appointment Details</h3>
          <button @click="closeAppointmentModal" class="btn-close">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="appointment-info">
            <div class="info-item">
              <strong>Type:</strong> {{ selectedAppointment.extendedProps.type }}
            </div>
            <div class="info-item">
              <strong>Counselor:</strong> {{ selectedAppointment.extendedProps.counselor }}
            </div>
            <div class="info-item">
              <strong>Date:</strong> {{ formatDate(selectedAppointment.start) }}
            </div>
            <div class="info-item">
              <strong>Time:</strong> {{ formatTime(selectedAppointment.start) }} - {{ formatTime(selectedAppointment.end) }}
            </div>
            <div class="info-item" v-if="selectedAppointment.extendedProps.notes">
              <strong>Notes:</strong> {{ selectedAppointment.extendedProps.notes }}
            </div>
            <div class="info-item">
              <strong>Status:</strong> 
              <span :class="['status-badge', selectedAppointment.extendedProps.status]">
                {{ selectedAppointment.extendedProps.status }}
              </span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button 
            v-if="selectedAppointment.extendedProps.status === 'confirmed'"
            @click="cancelAppointment(selectedAppointment.id)"
            class="btn btn-danger"
          >
            Cancel Appointment
          </button>
          <button @click="closeAppointmentModal" class="btn btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="message.text" :class="['alert', message.type === 'success' ? 'alert-success' : 'alert-danger']">
      <i :class="['bi', message.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle']"></i>
      {{ message.text }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

// Reactive data
const calendar = ref(null)
const showBookingForm = ref(false)
const currentView = ref('dayGridMonth')
const selectedAppointment = ref(null)
const isSubmitting = ref(false)
const message = ref({ text: '', type: '' })

// Form data
const newBooking = ref({
  type: '',
  counselorId: '',
  date: '',
  time: '',
  notes: ''
})

// Sample data
const availableCounselors = ref([
  { id: 1, name: 'Dr. Sarah Johnson', specialty: 'Anxiety & Depression' },
  { id: 2, name: 'Dr. Michael Chen', specialty: 'Teen Counseling' },
  { id: 3, name: 'Dr. Emily Davis', specialty: 'Crisis Intervention' },
  { id: 4, name: 'Dr. James Wilson', specialty: 'Group Therapy' }
])

const appointments = ref([])

// Computed properties
const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const maxDate = computed(() => {
  const maxDate = new Date()
  maxDate.setMonth(maxDate.getMonth() + 3) // 3 months ahead
  return maxDate.toISOString().split('T')[0]
})

const availableTimeSlots = computed(() => {
  const slots = []
  for (let hour = 9; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 60) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      const isBooked = checkTimeSlotBooked(newBooking.value.date, time)
      slots.push({
        value: time,
        label: time,
        booked: isBooked
      })
    }
  }
  return slots
})

// Calendar options
const calendarOptions = ref({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: ''
  },
  events: appointments.value,
  eventClick: handleEventClick,
  dateClick: handleDateClick,
  businessHours: {
    daysOfWeek: [1, 2, 3, 4, 5], // Monday - Friday
    startTime: '09:00',
    endTime: '18:00'
  },
  slotMinTime: '09:00:00',
  slotMaxTime: '18:00:00',
  height: 'auto',
  eventDisplay: 'block',
  dayMaxEvents: 3
})

// Methods
const changeView = (viewName) => {
  currentView.value = viewName
  const calendarApi = calendar.value.getApi()
  calendarApi.changeView(viewName)
}

const handleEventClick = (info) => {
  selectedAppointment.value = info.event
}

const handleDateClick = (info) => {
  newBooking.value.date = info.dateStr
  showBookingForm.value = true
}

const checkTimeSlotBooked = (date, time) => {
  if (!date || !time) return false
  
  const checkDateTime = new Date(`${date}T${time}:00`)
  return appointments.value.some(appointment => {
    const appointmentStart = new Date(appointment.start)
    const appointmentEnd = new Date(appointment.end)
    return checkDateTime >= appointmentStart && checkDateTime < appointmentEnd
  })
}

const submitBooking = async () => {
  isSubmitting.value = true
  
  try {
    const bookingDateTime = new Date(`${newBooking.value.date}T${newBooking.value.time}:00`)
    const endDateTime = new Date(bookingDateTime.getTime() + 60 * 60 * 1000) // 1 hour duration
    
    const appointmentData = {
      type: newBooking.value.type,
      counselorId: newBooking.value.counselorId,
      date: newBooking.value.date,
      time: newBooking.value.time,
      notes: newBooking.value.notes || ''
    }
    
    const response = await fetch('/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(appointmentData)
    })
    
    const result = await response.json()
    
    if (result.success) {
      showMessage('Appointment booked successfully!', 'success')
      resetBookingForm()
      showBookingForm.value = false
      await loadAppointments() // Reload appointments
    } else {
      showMessage(result.message || 'Failed to book appointment', 'error')
    }
    
  } catch (error) {
    console.error('Failed to book appointment:', error)
    showMessage('Failed to book appointment. Please try again.', 'error')
  } finally {
    isSubmitting.value = false
  }
}

const cancelBooking = () => {
  resetBookingForm()
  showBookingForm.value = false
}

const resetBookingForm = () => {
  newBooking.value = {
    type: '',
    counselorId: '',
    date: '',
    time: '',
    notes: ''
  }
}

const cancelAppointment = async (appointmentId) => {
  try {
    const response = await fetch(`/api/appointments/${appointmentId}`, {
      method: 'DELETE'
    })
    
    const result = await response.json()
    
    if (result.success) {
      showMessage('Appointment cancelled successfully.', 'success')
      closeAppointmentModal()
      await loadAppointments() // Reload appointments
    } else {
      showMessage(result.message || 'Failed to cancel appointment', 'error')
    }
  } catch (error) {
    console.error('Failed to cancel appointment:', error)
    showMessage('Failed to cancel appointment. Please try again.', 'error')
  }
}

const closeAppointmentModal = () => {
  selectedAppointment.value = null
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatTime = (dateString) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const showMessage = (text, type) => {
  message.value = { text, type }
  setTimeout(() => {
    message.value = { text: '', type: '' }
  }, 5000)
}

// Load appointments from API
const loadAppointments = async () => {
  try {
    const response = await fetch('/api/appointments')
    const result = await response.json()
    
    if (result.success) {
      appointments.value = result.data
      
      // Update calendar
      const calendarApi = calendar.value.getApi()
      calendarApi.removeAllEvents()
      
      appointments.value.forEach(appointment => {
        calendarApi.addEvent({
          id: appointment.id,
          title: appointment.title,
          start: appointment.start,
          end: appointment.end,
          backgroundColor: appointment.backgroundColor || '#28a745',
          borderColor: appointment.borderColor || '#28a745',
          extendedProps: appointment.extendedProps || {}
        })
      })
    }
  } catch (error) {
    console.error('Failed to load appointments:', error)
    showMessage('Failed to load appointments', 'error')
  }
}

onMounted(async () => {
  // Initialize calendar and load appointments
  console.log('Appointment Booking component mounted')
  await loadAppointments()
})
</script>

<style scoped>
.appointment-booking {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.booking-header {
  text-align: center;
  margin-bottom: 30px;
}

.booking-header h2 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.booking-header i {
  margin-right: 10px;
  color: #3498db;
}

.booking-description {
  color: #7f8c8d;
  font-size: 1.1em;
}

.booking-form-section {
  margin-bottom: 30px;
}

.form-card {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.form-card h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.booking-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 5px;
  color: #2c3e50;
}

.form-control {
  padding: 10px;
  border: 2px solid #e9ecef;
  border-radius: 5px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.form-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 20px;
}

.calendar-section {
  background: white;
  border-radius: 10px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid #e9ecef;
}

.calendar-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 15px;
}

.view-controls {
  display: flex;
  gap: 5px;
}

.view-controls .btn {
  padding: 8px 16px;
  border-radius: 5px;
}

.view-controls .btn.active {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
}

.calendar-container {
  min-height: 600px;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 10px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
}

.btn-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #7f8c8d;
  padding: 5px;
}

.btn-close:hover {
  color: #2c3e50;
}

.modal-body {
  padding: 20px;
}

.appointment-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 5px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.confirmed {
  background: #d4edda;
  color: #155724;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.cancelled {
  background: #f8d7da;
  color: #721c24;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 20px;
  border-top: 1px solid #e9ecef;
}

/* Button Styles */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}

.btn-outline-secondary {
  background: transparent;
  color: #6c757d;
  border: 1px solid #6c757d;
}

.btn-outline-secondary:hover {
  background: #6c757d;
  color: white;
}

/* Alert Styles */
.alert {
  padding: 15px;
  border-radius: 5px;
  margin: 20px 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.alert-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert-danger {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

/* Responsive Design */
@media (max-width: 768px) {
  .appointment-booking {
    padding: 15px;
  }
  
  .booking-form {
    grid-template-columns: 1fr;
  }
  
  .calendar-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .view-controls {
    justify-content: center;
  }
  
  .form-actions {
    flex-direction: column;
  }
}

/* FullCalendar Custom Styles */
:deep(.fc-toolbar) {
  margin-bottom: 20px;
}

:deep(.fc-button-primary) {
  background-color: #3498db;
  border-color: #3498db;
}

:deep(.fc-button-primary:hover) {
  background-color: #2980b9;
  border-color: #2980b9;
}

:deep(.fc-event) {
  cursor: pointer;
  border-radius: 4px;
}

:deep(.fc-event:hover) {
  opacity: 0.8;
}

:deep(.fc-daygrid-event) {
  margin: 1px;
}

:deep(.fc-timegrid-event) {
  border-radius: 4px;
}
</style>