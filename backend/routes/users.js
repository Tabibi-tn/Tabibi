const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const { User, Doctor, Patient, Specialty } = require('../models');

// Get current user profile
router.get('/me', auth, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive });
  } catch (err) { next(err); }
});

// Update own profile
router.put('/profile', auth, async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { name, email, phone, dateOfBirth, address, emergencyContact, bloodType, allergies, medicalConditions } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (dateOfBirth !== undefined) updates.dateOfBirth = dateOfBirth;
    if (address !== undefined) updates.address = address;
    if (emergencyContact !== undefined) updates.emergencyContact = emergencyContact;
    if (bloodType !== undefined) updates.bloodType = bloodType;
    if (allergies !== undefined) updates.allergies = allergies;
    if (medicalConditions !== undefined) updates.medicalConditions = medicalConditions;
    await user.update(updates);
    res.json({ id: user.id, name: user.name, email: user.email, role: user.role, phone: user.phone, address: user.address });
  } catch (err) { next(err); }
});

// Change password
router.put('/password', auth, async (req, res, next) => {
  try {
    const bcrypt = require('bcrypt');
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both passwords required' });
    const ok = await bcrypt.compare(currentPassword, user.password);
    if (!ok) return res.status(401).json({ message: 'Current password is incorrect' });
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) { next(err); }
});

// Admin: list all users
router.get('/', auth, roles(['admin']), async (req, res, next) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role', 'isActive', 'createdAt'],
      include: [
        { model: Doctor, attributes: ['id', 'status'], required: false, include: [{ model: Specialty, attributes: ['name'], required: false }] },
        { model: Patient, attributes: ['id'], required: false }
      ]
    });
    res.json(users);
  } catch (err) { next(err); }
});

// Admin: activate/deactivate user
router.put('/:id/toggle-active', auth, roles(['admin']), async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot deactivate admin users' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({
      message: user.isActive ? 'User activated successfully' : 'User deactivated successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive }
    });
  } catch (err) { next(err); }
});

// Admin: get pending doctors — must be before /doctors/:id
router.get('/doctors/pending', auth, roles(['admin']), async (req, res, next) => {
  try {
    const doctors = await Doctor.findAll({
      where: { status: 'pending' },
      include: [
        { model: User, attributes: ['name', 'email'] },
        { model: Specialty, attributes: ['name'], required: false }
      ]
    });
    res.json(doctors);
  } catch (err) { next(err); }
});

// Admin: approve/reject doctor
router.put('/doctors/:id/approve', auth, roles(['admin']), async (req, res, next) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['name', 'email'] }]
    });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    const { status, rejectionReason } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    if (status === 'rejected' && !rejectionReason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }
    doctor.status = status;
    doctor.rejectionReason = status === 'rejected' ? rejectionReason : null;
    await doctor.save();
    res.json({
      message: `Doctor ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'updated'} successfully`,
      doctor: { id: doctor.id, status: doctor.status, rejectionReason: doctor.rejectionReason, user: doctor.User }
    });
  } catch (err) { next(err); }
});

module.exports = router;
