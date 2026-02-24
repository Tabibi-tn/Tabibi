const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { Review, User, Patient, Doctor } = require('../models');

// Get reviews for a doctor
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { doctorId: req.params.doctorId },
      include: [
        { 
          model: Patient, 
          include: [{ model: User, attributes: ['name'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      patientName: review.Patient?.User?.name || 'Anonymous'
    }));
    
    res.json(formattedReviews);
  } catch (err) {
    console.error('Error fetching reviews:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get average rating for a doctor
router.get('/doctor/:doctorId/rating', async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { doctorId: req.params.doctorId },
      attributes: ['rating']
    });
    
    if (reviews.length === 0) {
      return res.json({ averageRating: 0, totalReviews: 0 });
    }
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = (totalRating / reviews.length).toFixed(1);
    
    res.json({ 
      averageRating: parseFloat(averageRating), 
      totalReviews: reviews.length 
    });
  } catch (err) {
    console.error('Error fetching rating:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a review (patients only)
router.post('/', auth, async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Only patients can write reviews' });
    }
    
    const { doctorId, rating, comment } = req.body;
    
    // Check if doctor exists
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    
    // Get patient profile
    const patient = await Patient.findOne({ where: { userId: req.user.id } });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    
    // Create review
    const review = await Review.create({
      patientId: patient.id,
      doctorId,
      rating,
      comment
    });
    
    res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (err) {
    console.error('Error creating review:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get patient's own reviews
router.get('/my-reviews', auth, async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Only patients can view their reviews' });
    }
    
    const patient = await Patient.findOne({ where: { userId: req.user.id } });
    if (!patient) {
      return res.status(404).json({ message: 'Patient profile not found' });
    }
    
    const reviews = await Review.findAll({
      where: { patientId: patient.id },
      include: [
        { 
          model: Doctor,
          include: [{ model: User, attributes: ['name'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    const formattedReviews = reviews.map(review => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      doctorName: review.Doctor?.User?.name || 'Unknown Doctor'
    }));
    
    res.json(formattedReviews);
  } catch (err) {
    console.error('Error fetching patient reviews:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
