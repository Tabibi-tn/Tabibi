const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const { Consultation, Appointment, Doctor, Patient } = require('../models');

// Doctor: create consultation for an appointment
router.post('/', auth, roles(['doctor']), async (req, res) => {
  const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
  const { appointmentId, diagnosis, prescription, notes, fileUrl } = req.body;
  const appt = await Appointment.findByPk(appointmentId);
  if (!appt) return res.status(404).json({ message: 'Appointment not found' });
  if (appt.doctorId !== doctor.id) return res.status(403).json({ message: 'Forbidden' });
  const consult = await Consultation.create({ appointmentId, doctorId: doctor.id, patientId: appt.patientId, diagnosis, prescription, notes, fileUrl });
  res.status(201).json(consult);
});

// Doctor: update consultation (only owner doctor)
router.put('/:id', auth, roles(['doctor']), async (req, res) => {
  const consult = await Consultation.findByPk(req.params.id);
  if (!consult) return res.status(404).json({ message: 'Consultation not found' });
  const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
  if (!doctor || doctor.id !== consult.doctorId) return res.status(403).json({ message: 'Forbidden' });
  const fields = ['diagnosis','prescription','notes','fileUrl'];
  fields.forEach(f => { if (req.body[f] !== undefined) consult[f] = req.body[f]; });
  await consult.save();
  res.json(consult);
});

// Patient: view own consultations
router.get('/', auth, roles(['patient','doctor','admin']), async (req, res) => {
  if (req.user.role === 'patient') {
    const patient = await Patient.findOne({ where: { userId: req.user.id } });
    const items = await Consultation.findAll({ where: { patientId: patient.id } });
    return res.json(items);
  }
  if (req.user.role === 'doctor') {
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    const items = await Consultation.findAll({ where: { doctorId: doctor.id } });
    return res.json(items);
  }
  // admin: read-only all
  const items = await Consultation.findAll();
  res.json(items);
});

module.exports = router;
