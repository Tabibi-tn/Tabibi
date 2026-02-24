const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const { User, Doctor, Patient } = require('../models');

// Get current profile
router.get('/me', auth, async (req, res) => {
  const user = await User.findByPk(req.user.id);
  res.json({ id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive });
});

// Admin: list users with their status
router.get('/', auth, roles(['admin']), async (req, res) => {
  const users = await User.findAll({ 
    attributes: ['id','name','email','role','isActive','createdAt'],
    include: [
      { model: Doctor, attributes: ['id', 'status'], required: false },
      { model: Patient, attributes: ['id'], required: false }
    ]
  });
  res.json(users);
});

// Admin: activate/deactivate user
router.put('/:id/toggle-active', auth, roles(['admin']), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    // Prevent deactivating admin
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot deactivate admin users' });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.json({ 
      message: user.isActive ? 'User activated successfully' : 'User deactivated successfully',
      user: { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive }
    });
  } catch (err) { next(err); }
});

// Admin: approve/reject doctor
router.put('/doctors/:id/approve', auth, roles(['admin']), async (req, res) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['name', 'email'] }]
    });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    
    const { status, rejectionReason } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // If rejecting, require a reason
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

// Admin: get all doctors with pending status
router.get('/doctors/pending', auth, roles(['admin']), async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      where: { status: 'pending' },
      include: [{ model: User, attributes: ['name', 'email'] }]
    });
    res.json(doctors);
  } catch (err) { next(err); }
});

module.exports = router;
