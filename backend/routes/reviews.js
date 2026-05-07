const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const { Review, User, Patient, Doctor } = require('../models');

// Public: get reviews for a doctor
router.get('/doctor/:doctorId', async (req, res, next) => {
  try {
    const reviews = await Review.findAll({
      where: { doctorId: req.params.doctorId },
      include: [{ model: Patient, include: [{ model: User, attributes: ['name'] }] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews.map(r => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      patientName: r.Patient?.User?.name || 'Anonymous'
    })));
  } catch (err) { next(err); }
});

// Public: get average rating for a doctor
router.get('/doctor/:doctorId/rating', async (req, res, next) => {
  try {
    const reviews = await Review.findAll({ where: { doctorId: req.params.doctorId }, attributes: ['rating'] });
    if (!reviews.length) return res.json({ averageRating: 0, totalReviews: 0 });
    const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    res.json({ averageRating: parseFloat(avg.toFixed(1)), totalReviews: reviews.length });
  } catch (err) { next(err); }
});

// Patient: submit a review
router.post('/', auth, roles(['patient']), async (req, res, next) => {
  try {
    const { doctorId, rating, comment } = req.body;
    if (!doctorId || !rating) return res.status(400).json({ message: 'doctorId and rating are required' });
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    const patient = await Patient.findOne({ where: { userId: req.user.id } });
    if (!patient) return res.status(404).json({ message: 'Patient profile not found' });
    const review = await Review.create({ patientId: patient.id, doctorId, rating, comment });
    res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (err) { next(err); }
});

// Patient: get own reviews
router.get('/my-reviews', auth, roles(['patient']), async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ where: { userId: req.user.id } });
    if (!patient) return res.status(404).json({ message: 'Patient profile not found' });
    const reviews = await Review.findAll({
      where: { patientId: patient.id },
      include: [{ model: Doctor, include: [{ model: User, attributes: ['name'] }] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews.map(r => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      doctorName: r.Doctor?.User?.name || 'Unknown Doctor'
    })));
  } catch (err) { next(err); }
});

module.exports = router;
