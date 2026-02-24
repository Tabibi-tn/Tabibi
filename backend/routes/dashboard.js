const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const { User, Doctor, Patient, Appointment } = require('../models');
const { Op } = require('sequelize');

// Admin: get dashboard stats
router.get('/admin-stats', auth, roles(['admin']), async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalDoctors = await Doctor.count();
    const totalPatients = await Patient.count();
    const totalAppointments = await Appointment.count();
    
    res.json({
      users: totalUsers,
      doctors: totalDoctors,
      patients: totalPatients,
      appointments: totalAppointments
    });
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Doctor: get dashboard stats
router.get('/doctor-stats', auth, roles(['doctor']), async (req, res) => {
  try {
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    
    const totalAppointments = await Appointment.count({ where: { doctorId: doctor.id } });
    const pendingAppointments = await Appointment.count({ where: { doctorId: doctor.id, status: 'pending' } });
    const completedAppointments = await Appointment.count({ where: { doctorId: doctor.id, status: 'completed' } });
    
    res.json({
      totalAppointments,
      pendingAppointments,
      completedAppointments
    });
  } catch (err) {
    console.error('Error fetching doctor stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Patient: get dashboard stats
router.get('/patient-stats', auth, roles(['patient']), async (req, res) => {
  try {
    const patient = await Patient.findOne({ where: { userId: req.user.id } });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const totalAppointments = await Appointment.count({ where: { patientId: patient.id } });
    const upcomingAppointments = await Appointment.count({ 
      where: { 
        patientId: patient.id,
        status: 'approved',
        date: { [Op.gte]: today }
      }
    });
    const completedAppointments = await Appointment.count({ where: { patientId: patient.id, status: 'completed' } });
    
    res.json({
      totalAppointments,
      upcomingAppointments,
      completedAppointments
    });
  } catch (err) {
    console.error('Error fetching patient stats:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
