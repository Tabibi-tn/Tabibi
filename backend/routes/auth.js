const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User, Patient, Doctor } = require('../models');

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: role || 'patient' });
    if (user.role === 'patient') await Patient.create({ userId: user.id });
    if (user.role === 'doctor') await Doctor.create({ userId: user.id, status: 'pending' });
    res.status(201).json({ id: user.id, email: user.email, role: user.role, message: 'Registration successful. Please wait for admin approval if you registered as a doctor.' });
  } catch (err) { next(err); }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    
    // Check if account is active
    if (!user.isActive) return res.status(401).json({ message: 'Your account has been deactivated. Please contact admin.' });
    
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    
    // Check doctor status - allow login if pending but profile incomplete
    let doctorStatus = null;
    if (user.role === 'doctor') {
      const doctor = await Doctor.findOne({ where: { userId: user.id } });
      if (doctor) {
        doctorStatus = doctor.status;
        // If pending and profile is incomplete, allow login to complete profile
        if (doctor.status === 'pending' && (!doctor.specialtyId || !doctor.licenseNumber || !doctor.diplomaUrl || !doctor.licenseDocUrl)) {
          doctorStatus = 'needs_profile';
        }
      }
    }
    
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, doctorStatus } });
  } catch (err) { next(err); }
});

module.exports = router;
