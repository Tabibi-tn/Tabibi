const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const { Appointment, Patient, Doctor, User } = require('../models');

// Patient: book appointment
router.post('/', auth, roles(['patient']), async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ where: { userId: req.user.id } });
    if (!patient) return res.status(404).json({ message: 'Patient profile not found' });
    const { doctorId, date, time } = req.body;
    const appt = await Appointment.create({ patientId: patient.id, doctorId, date, time });
    res.status(201).json(appt);
  } catch (err) { next(err); }
});

// Doctor: accept/reject
router.post('/:id/status', auth, roles(['doctor']), async (req, res) => {
  const appt = await Appointment.findByPk(req.params.id);
  if (!appt) return res.status(404).json({ message: 'Appointment not found' });
  // Ensure the doctor owns the appointment
  const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
  if (!doctor || doctor.id !== appt.doctorId) return res.status(403).json({ message: 'Forbidden' });
  if (req.body.status && ['approved','cancelled','completed'].includes(req.body.status)) {
    appt.status = req.body.status;
    await appt.save();
  }
  res.json(appt);
});

// Patient: cancel or list own appointments
router.get('/', auth, async (req, res) => {
  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ where: { userId: req.user.id } });
    const appts = await Appointment.findAll({ 
      where: { patientId: patient.id },
      include: [
        { model: Doctor, include: [{ model: User, attributes: ['name'] }] }
      ]
    });
    return res.json(appts);
  }
  if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    const appts = await Appointment.findAll({ 
      where: { doctorId: doctor.id },
      include: [
        { model: Patient, include: [{ model: User, attributes: ['name'] }] }
      ]
    });
    return res.json(appts);
  }
   // admin: list all
   const appts = await Appointment.findAll({
     include: [
       { model: Patient, include: [{ model: User, attributes: ['name'] }] },
       { model: Doctor, include: [{ model: User, attributes: ['name'] }] }
     ]
   });
   res.json(appts);
});

// Update appointment (status update)
router.put('/:id', auth, async (req, res) => {
  try {
    const appt = await Appointment.findByPk(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });
    
    // Only the doctor assigned to this appointment or the patient can update
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
      if (!doctor || doctor.id !== appt.doctorId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    } else if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patient || patient.id !== appt.patientId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }
    
    const { status } = req.body;
    if (status && ['pending', 'approved', 'cancelled', 'completed'].includes(status)) {
      appt.status = status;
      await appt.save();
    }
    
    res.json(appt);
  } catch (err) {
    console.error('Error updating appointment:', err);
    res.status(500).json({ message: 'Server error' });
  }
});
 
 // Get approved appointments for the logged-in doctor
 router.get('/approved', auth, roles(['doctor']), async (req, res) => {
   try {
     const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
     if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
     
     const appointments = await Appointment.findAll({
       where: { doctorId: doctor.id, status: 'approved' },
       include: [{
         model: Patient,
         include: [{
           model: User,
           attributes: ['name']
         }]
       }]
     });
     
     const formattedAppointments = appointments.map(appt => ({
       id: appt.id,
       date: appt.date,
       time: appt.time,
       status: appt.status,
       patientId: appt.patientId,
       doctorId: appt.doctorId,
       patientName: appt.Patient?.User?.name || 'Unknown Patient'
     }));
     
     res.json(formattedAppointments);
   } catch (err) {
     console.error('Error fetching approved appointments:', err);
     res.status(500).json({ message: 'Server error' });

   }
 });
 
 module.exports = router;
