const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const { User, Doctor, Patient, Appointment } = require('../models');
const { Op } = require('sequelize');

router.get('/admin-stats', auth, roles(['admin']), async (req, res, next) => {
  try {
    const [users, doctors, patients, appointments] = await Promise.all([
      User.count(),
      Doctor.count(),
      Patient.count(),
      Appointment.count()
    ]);
    res.json({ users, doctors, patients, appointments });
  } catch (err) { next(err); }
});

router.get('/doctor-stats', auth, roles(['doctor']), async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    const [totalAppointments, pendingAppointments, completedAppointments] = await Promise.all([
      Appointment.count({ where: { doctorId: doctor.id } }),
      Appointment.count({ where: { doctorId: doctor.id, status: 'pending' } }),
      Appointment.count({ where: { doctorId: doctor.id, status: 'completed' } })
    ]);
    res.json({ totalAppointments, pendingAppointments, completedAppointments });
  } catch (err) { next(err); }
});

router.get('/patient-stats', auth, roles(['patient']), async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ where: { userId: req.user.id } });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const [totalAppointments, upcomingAppointments, completedAppointments] = await Promise.all([
      Appointment.count({ where: { patientId: patient.id } }),
      Appointment.count({ where: { patientId: patient.id, status: 'approved', date: { [Op.gte]: today } } }),
      Appointment.count({ where: { patientId: patient.id, status: 'completed' } })
    ]);
    res.json({ totalAppointments, upcomingAppointments, completedAppointments });
  } catch (err) { next(err); }
});

module.exports = router;
