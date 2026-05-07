const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const { Consultation, Appointment, Doctor, Patient } = require('../models');

// Doctor: create consultation
router.post('/', auth, roles(['doctor']), async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
    const { appointmentId, diagnosis, prescription, notes, fileUrl } = req.body;
    if (!appointmentId) return res.status(400).json({ message: 'appointmentId is required' });
    const appt = await Appointment.findByPk(appointmentId);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });
    if (appt.doctorId !== doctor.id) return res.status(403).json({ message: 'Forbidden' });
    const consult = await Consultation.create({ appointmentId, doctorId: doctor.id, patientId: appt.patientId, diagnosis, prescription, notes, fileUrl });
    res.status(201).json(consult);
  } catch (err) { next(err); }
});

// Doctor or Patient: update consultation (doctor can edit all; patient can only add file/notes)
router.put('/:id', auth, async (req, res, next) => {
  try {
    const consult = await Consultation.findByPk(req.params.id);
    if (!consult) return res.status(404).json({ message: 'Consultation not found' });

    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
      if (!doctor || doctor.id !== consult.doctorId) return res.status(403).json({ message: 'Forbidden' });
      const editable = ['diagnosis', 'prescription', 'notes', 'fileUrl'];
      editable.forEach(f => { if (req.body[f] !== undefined) consult[f] = req.body[f]; });
    } else if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patient || patient.id !== consult.patientId) return res.status(403).json({ message: 'Forbidden' });
      // Patients may only attach a file or add their own notes
      if (req.body.fileUrl !== undefined) consult.fileUrl = req.body.fileUrl;
      if (req.body.notes !== undefined) consult.notes = req.body.notes;
    } else {
      return res.status(403).json({ message: 'Forbidden' });
    }

    await consult.save();
    res.json(consult);
  } catch (err) { next(err); }
});

// Patient: create a basic consultation note (so patients can add notes after appointment)
router.post('/patient-note', auth, roles(['patient']), async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ where: { userId: req.user.id } });
    if (!patient) return res.status(404).json({ message: 'Patient profile not found' });
    const { appointmentId, notes, fileUrl } = req.body;
    if (!appointmentId) return res.status(400).json({ message: 'appointmentId is required' });
    const appt = await Appointment.findByPk(appointmentId);
    if (!appt || appt.patientId !== patient.id) return res.status(403).json({ message: 'Forbidden' });

    // Check if consultation already exists
    let consult = await Consultation.findOne({ where: { appointmentId } });
    if (consult) {
      // Update existing
      if (notes !== undefined) consult.notes = notes;
      if (fileUrl !== undefined) consult.fileUrl = fileUrl;
      await consult.save();
    } else {
      // Create new
      consult = await Consultation.create({ appointmentId, patientId: patient.id, doctorId: appt.doctorId, notes, fileUrl });
    }
    res.json(consult);
  } catch (err) { next(err); }
});

// Get single consultation by id
router.get('/:id', auth, async (req, res, next) => {
  try {
    const consult = await Consultation.findByPk(req.params.id);
    if (!consult) return res.status(404).json({ message: 'Consultation not found' });
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
      if (!doctor || doctor.id !== consult.doctorId) return res.status(403).json({ message: 'Forbidden' });
    } else if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patient || patient.id !== consult.patientId) return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(consult);
  } catch (err) { next(err); }
});

// Get consultations (role-based)
router.get('/', auth, async (req, res, next) => {
  try {
    let items;
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patient) return res.status(404).json({ message: 'Patient profile not found' });
      items = await Consultation.findAll({ where: { patientId: patient.id } });
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
      if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
      items = await Consultation.findAll({ where: { doctorId: doctor.id } });
    } else {
      items = await Consultation.findAll();
    }
    res.json(items);
  } catch (err) { next(err); }
});

module.exports = router;
