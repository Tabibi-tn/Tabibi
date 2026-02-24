const express = require('express');
const router = express.Router();
const { Doctor, Appointment } = require('../models');

// Get available time slots for a doctor on a specific date
// GET /availability/doctor/:doctorId?date=2024-01-15
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;
    
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    
    // Get doctor's availability schedule
    const availability = doctor.availability || [];
    
    // Default time slots
    const allTimeSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
    ];
    
    // If no date provided, return all slots as available
    if (!date) {
      return res.json({ slots: allTimeSlots });
    }
    
    // Check if the date is in the doctor's availability
    const dateAvailability = availability.find(a => a.start && a.start.startsWith(date));
    
    // If no availability set for this date, return all slots as available
    if (!dateAvailability) {
      return res.json({ slots: allTimeSlots });
    }
    
    // Get existing appointments for this doctor on this date
    const appointments = await Appointment.findAll({
      where: {
        doctorId,
        date,
        status: ['pending', 'approved']
      }
    });
    
    // Get booked time slots
    const bookedSlots = appointments.map(a => a.time).filter(t => t);
    
    // Filter out booked slots
    const availableSlots = allTimeSlots.filter(slot => !bookedSlots.includes(slot));
    
    res.json({ slots: availableSlots });
  } catch (err) {
    console.error('Error fetching availability:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
