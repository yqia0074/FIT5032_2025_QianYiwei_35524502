const express = require('express');
const router = express.Router();

// In-memory storage for appointments (in production, use a database)
let appointments = [
  {
    id: '1',
    title: 'Counseling Session',
    start: '2024-01-15T10:00:00',
    end: '2024-01-15T11:00:00',
    counselorId: 'counselor1',
    clientName: 'John Doe',
    clientEmail: 'john@example.com',
    status: 'confirmed',
    type: 'individual',
    notes: 'Initial consultation'
  },
  {
    id: '2',
    title: 'Group Therapy',
    start: '2024-01-16T14:00:00',
    end: '2024-01-16T15:30:00',
    counselorId: 'counselor2',
    clientName: 'Jane Smith',
    clientEmail: 'jane@example.com',
    status: 'confirmed',
    type: 'group',
    notes: 'Anxiety support group'
  }
];

let nextId = 3;

// Helper function to check for appointment conflicts
function hasConflict(newAppointment, excludeId = null) {
  const newStart = new Date(newAppointment.start);
  const newEnd = new Date(newAppointment.end);
  
  return appointments.some(apt => {
    if (excludeId && apt.id === excludeId) return false;
    if (apt.counselorId !== newAppointment.counselorId) return false;
    
    const existingStart = new Date(apt.start);
    const existingEnd = new Date(apt.end);
    
    // Check for overlap
    return (newStart < existingEnd && newEnd > existingStart);
  });
}

// Helper function to validate appointment data
function validateAppointment(appointment) {
  const errors = [];
  
  if (!appointment.title) errors.push('Title is required');
  if (!appointment.start) errors.push('Start time is required');
  if (!appointment.end) errors.push('End time is required');
  if (!appointment.counselorId) errors.push('Counselor ID is required');
  if (!appointment.clientName) errors.push('Client name is required');
  if (!appointment.clientEmail) errors.push('Client email is required');
  
  const start = new Date(appointment.start);
  const end = new Date(appointment.end);
  
  if (start >= end) {
    errors.push('End time must be after start time');
  }
  
  if (start < new Date()) {
    errors.push('Appointment cannot be scheduled in the past');
  }
  
  // Business hours validation (9 AM to 6 PM)
  const startHour = start.getHours();
  const endHour = end.getHours();
  
  if (startHour < 9 || startHour >= 18 || endHour < 9 || endHour > 18) {
    errors.push('Appointments must be scheduled between 9 AM and 6 PM');
  }
  
  // Weekend validation
  const dayOfWeek = start.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    errors.push('Appointments cannot be scheduled on weekends');
  }
  
  return errors;
}

// GET /api/appointments - Get all appointments
router.get('/', (req, res) => {
  try {
    const { counselorId, date, status } = req.query;
    let filteredAppointments = [...appointments];
    
    if (counselorId) {
      filteredAppointments = filteredAppointments.filter(apt => apt.counselorId === counselorId);
    }
    
    if (date) {
      const targetDate = new Date(date);
      filteredAppointments = filteredAppointments.filter(apt => {
        const aptDate = new Date(apt.start);
        return aptDate.toDateString() === targetDate.toDateString();
      });
    }
    
    if (status) {
      filteredAppointments = filteredAppointments.filter(apt => apt.status === status);
    }
    
    res.json({
      success: true,
      data: filteredAppointments,
      total: filteredAppointments.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointments',
      error: error.message
    });
  }
});

// GET /api/appointments/:id - Get specific appointment
router.get('/:id', (req, res) => {
  try {
    const appointment = appointments.find(apt => apt.id === req.params.id);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch appointment',
      error: error.message
    });
  }
});

// POST /api/appointments - Create new appointment
router.post('/', (req, res) => {
  try {
    const appointmentData = req.body;
    
    // Validate appointment data
    const validationErrors = validateAppointment(appointmentData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Check for conflicts
    if (hasConflict(appointmentData)) {
      return res.status(409).json({
        success: false,
        message: 'Appointment conflict detected',
        error: 'The selected time slot is already booked'
      });
    }
    
    // Create new appointment
    const newAppointment = {
      id: nextId.toString(),
      ...appointmentData,
      status: appointmentData.status || 'pending',
      createdAt: new Date().toISOString()
    };
    
    appointments.push(newAppointment);
    nextId++;
    
    res.status(201).json({
      success: true,
      message: 'Appointment created successfully',
      data: newAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create appointment',
      error: error.message
    });
  }
});

// PUT /api/appointments/:id - Update appointment
router.put('/:id', (req, res) => {
  try {
    const appointmentIndex = appointments.findIndex(apt => apt.id === req.params.id);
    
    if (appointmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    const updatedData = req.body;
    
    // Validate updated appointment data
    const validationErrors = validateAppointment(updatedData);
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }
    
    // Check for conflicts (excluding current appointment)
    if (hasConflict(updatedData, req.params.id)) {
      return res.status(409).json({
        success: false,
        message: 'Appointment conflict detected',
        error: 'The selected time slot is already booked'
      });
    }
    
    // Update appointment
    appointments[appointmentIndex] = {
      ...appointments[appointmentIndex],
      ...updatedData,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: 'Appointment updated successfully',
      data: appointments[appointmentIndex]
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment',
      error: error.message
    });
  }
});

// DELETE /api/appointments/:id - Cancel appointment
router.delete('/:id', (req, res) => {
  try {
    const appointmentIndex = appointments.findIndex(apt => apt.id === req.params.id);
    
    if (appointmentIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }
    
    const deletedAppointment = appointments.splice(appointmentIndex, 1)[0];
    
    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: deletedAppointment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel appointment',
      error: error.message
    });
  }
});

// GET /api/appointments/availability/:counselorId - Check availability
router.get('/availability/:counselorId', (req, res) => {
  try {
    const { counselorId } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }
    
    const targetDate = new Date(date);
    const dayOfWeek = targetDate.getDay();
    
    // Check if it's a weekend
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return res.json({
        success: true,
        data: {
          available: false,
          reason: 'Weekends are not available for appointments'
        }
      });
    }
    
    // Get existing appointments for the counselor on that date
    const existingAppointments = appointments.filter(apt => {
      const aptDate = new Date(apt.start);
      return apt.counselorId === counselorId && 
             aptDate.toDateString() === targetDate.toDateString();
    });
    
    // Generate available time slots (9 AM to 6 PM, 1-hour slots)
    const availableSlots = [];
    for (let hour = 9; hour < 18; hour++) {
      const slotStart = new Date(targetDate);
      slotStart.setHours(hour, 0, 0, 0);
      const slotEnd = new Date(slotStart);
      slotEnd.setHours(hour + 1, 0, 0, 0);
      
      // Check if this slot conflicts with existing appointments
      const hasConflict = existingAppointments.some(apt => {
        const aptStart = new Date(apt.start);
        const aptEnd = new Date(apt.end);
        return (slotStart < aptEnd && slotEnd > aptStart);
      });
      
      if (!hasConflict) {
        availableSlots.push({
          start: slotStart.toISOString(),
          end: slotEnd.toISOString()
        });
      }
    }
    
    res.json({
      success: true,
      data: {
        available: availableSlots.length > 0,
        slots: availableSlots,
        totalSlots: availableSlots.length
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check availability',
      error: error.message
    });
  }
});

module.exports = router;