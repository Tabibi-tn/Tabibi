const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const { Appointment, Patient, Doctor, User, Specialty } = require('../models');

// Patient: book appointment
router.post('/', auth, roles(['patient']), async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ where: { userId: req.user.id } });
    if (!patient) return res.status(404).json({ message: 'Patient profile not found' });
    const { doctorId, date, time, notes } = req.body;
    if (!doctorId || !date || !time) return res.status(400).json({ message: 'doctorId, date and time are required' });
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    const appt = await Appointment.create({ patientId: patient.id, doctorId, date, time, notes });
    res.status(201).json(appt);
  } catch (err) { next(err); }
});

// Get appointments — role-based
router.get('/', auth, async (req, res, next) => {
  try {
    let appts;
    if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patient) return res.status(404).json({ message: 'Patient profile not found' });
      appts = await Appointment.findAll({
        where: { patientId: patient.id },
        include: [{ model: Doctor, include: [{ model: User, attributes: ['name'] }, { model: Specialty, attributes: ['name'] }] }],
        order: [['date', 'DESC'], ['time', 'DESC']]
      });
    } else if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
      if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
      appts = await Appointment.findAll({
        where: { doctorId: doctor.id },
        include: [{ model: Patient, include: [{ model: User, attributes: ['name'] }] }],
        order: [['date', 'DESC'], ['time', 'DESC']]
      });
    } else {
      // admin: all
      appts = await Appointment.findAll({
        include: [
          { model: Patient, include: [{ model: User, attributes: ['name'] }] },
          { model: Doctor, include: [{ model: User, attributes: ['name'] }, { model: Specialty, attributes: ['name'] }] }
        ],
        order: [['date', 'DESC']]
      });
    }
    res.json(appts);
  } catch (err) { next(err); }
});

// Get approved appointments for current doctor (used by calendar)
router.get('/approved', auth, roles(['doctor']), async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
    const appointments = await Appointment.findAll({
      where: { doctorId: doctor.id, status: 'approved' },
      include: [{ model: Patient, include: [{ model: User, attributes: ['name'] }] }]
    });
    const formatted = appointments.map(a => ({
      id: a.id,
      date: a.date,
      time: a.time,
      status: a.status,
      patientId: a.patientId,
      patientName: a.Patient?.User?.name || 'Patient'
    }));
    res.json(formatted);
  } catch (err) { next(err); }
});

// Update appointment status
router.put('/:id', auth, async (req, res, next) => {
  try {
    const appt = await Appointment.findByPk(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });
    if (req.user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
      if (!doctor || doctor.id !== appt.doctorId) return res.status(403).json({ message: 'Forbidden' });
    } else if (req.user.role === 'patient') {
      const patient = await Patient.findOne({ where: { userId: req.user.id } });
      if (!patient || patient.id !== appt.patientId) return res.status(403).json({ message: 'Forbidden' });
    }
    const { status } = req.body;
    const allowed = ['pending', 'approved', 'cancelled', 'completed'];
    if (status && allowed.includes(status)) {
      appt.status = status;
      await appt.save();
    }
    res.json(appt);
  } catch (err) { next(err); }
});

// Doctor accept/reject (legacy route — kept for backward compat)
router.post('/:id/status', auth, roles(['doctor']), async (req, res, next) => {
  try {
    const appt = await Appointment.findByPk(req.params.id);
    if (!appt) return res.status(404).json({ message: 'Appointment not found' });
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctor || doctor.id !== appt.doctorId) return res.status(403).json({ message: 'Forbidden' });
    if (req.body.status && ['approved', 'cancelled', 'completed'].includes(req.body.status)) {
      appt.status = req.body.status;
      await appt.save();
    }
    res.json(appt);
  } catch (err) { next(err); }
});

module.exports = router;
