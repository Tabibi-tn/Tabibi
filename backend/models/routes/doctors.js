const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const upload = require('../middleware/upload');
const { Doctor, User, Specialty, Review, Patient } = require('../models');

// Get reviews for a doctor (helper function)
async function getDoctorReviews(doctorId) {
  const reviews = await Review.findAll({
    where: { doctorId },
    include: [{
      model: Patient,
      include: [{ model: User, attributes: ['name'] }]
    }],
    order: [['createdAt', 'DESC']],
    limit: 10
  });
  
  return reviews.map(r => ({
    id: r.id,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt,
    patientName: r.Patient?.User?.name || 'Anonymous'
  }));
}

// Get average rating for a doctor (helper function)
async function getDoctorRating(doctorId) {
  const reviews = await Review.findAll({
    where: { doctorId },
    attributes: ['rating']
  });
  
  if (reviews.length === 0) return { averageRating: 0, totalReviews: 0 };
  
  const total = reviews.reduce((sum, r) => sum + r.rating, 0);
  return {
    averageRating: (total / reviews.length).toFixed(1),
    totalReviews: reviews.length
  };
}

// Availability endpoints
// Get availability for a doctor (public)
router.get('/:id/availability', async (req, res) => {
  const doctor = await Doctor.findByPk(req.params.id);
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
  res.json(doctor.availability || []);
});

// Doctor: get own availability
router.get('/me/availability', auth, roles(['doctor']), async (req, res) => {
  const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
  if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
  res.json(doctor.availability || []);
});

// Doctor: set availability (replace)
router.post('/me/availability', auth, roles(['doctor']), async (req, res) => {
  const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
  if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
  // expect an array of events [{start,end,title}]
  const events = Array.isArray(req.body) ? req.body : req.body.events;
  doctor.availability = events;
  await doctor.save();
  res.json(doctor.availability);
});

// Public: search doctors with pagination
router.get('/', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const offset = (page - 1) * limit;
  const doctors = await Doctor.findAndCountAll({ 
    include: [{ model: User, attributes: ['name','email'] }, { model: Specialty }],
    limit, 
    offset 
  });
  
  // Add rating to each doctor
  const doctorsWithRating = await Promise.all(doctors.rows.map(async (doc) => {
    const rating = await getDoctorRating(doc.id);
    return { ...doc.toJSON(), ...rating };
  }));
  
  res.json({ total: doctors.count, page, doctors: doctorsWithRating });
});

// Doctor: get own profile
router.get('/me', auth, roles(['doctor']), async (req, res) => {
  const doctor = await Doctor.findOne({ 
    where: { userId: req.user.id },
    include: [{ model: User, attributes: ['name', 'email'] }, { model: Specialty }]
  });
  if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
  
  const reviews = await getDoctorReviews(doctor.id);
  const rating = await getDoctorRating(doctor.id);
  
  res.json({ ...doctor.toJSON(), reviews, ...rating });
});

// Public: get a single doctor by ID
router.get('/:id', async (req, res) => {
  const doctor = await Doctor.findByPk(req.params.id, {
    include: [{ model: User, attributes: ['name', 'email'] }, { model: Specialty }]
  });
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
  
  const reviews = await getDoctorReviews(doctor.id);
  const rating = await getDoctorRating(doctor.id);
  
  res.json({ ...doctor.toJSON(), reviews, ...rating });
});

// Doctor: update profile
router.put('/me', auth, roles(['doctor']), async (req, res) => {
  const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
  if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
  await doctor.update(req.body);
  res.json(doctor);
});

// Doctor: complete profile with documents
router.post('/me/complete-profile', auth, roles(['doctor']), async (req, res) => {
  const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
  if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
  
  const { specialtyId, experience, clinicAddress, fee, licenseNumber, bio, diplomaUrl, licenseDocUrl, additionalDocuments } = req.body;
  
  // Update doctor profile fields
  await doctor.update({
    specialtyId: specialtyId || doctor.specialtyId,
    experience: experience || doctor.experience,
    clinicAddress: clinicAddress || doctor.clinicAddress,
    fee: fee || doctor.fee,
    licenseNumber: licenseNumber || doctor.licenseNumber,
    bio: bio || doctor.bio,
    diplomaUrl: diplomaUrl || doctor.diplomaUrl,
    licenseDocUrl: licenseDocUrl || doctor.licenseDocUrl,
    additionalDocuments: additionalDocuments || doctor.additionalDocuments
  });
  
  res.json({ message: 'Profile updated successfully', doctor });
});

// Doctor: upload document
router.post('/me/upload-document', auth, roles(['doctor']), upload.single('file'), async (req, res) => {
  const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
  if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
  
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  const { documentType } = req.body;
  
  // Update the appropriate field based on document type
  if (documentType === 'diploma') {
    doctor.diplomaUrl = fileUrl;
  } else if (documentType === 'license') {
    doctor.licenseDocUrl = fileUrl;
  } else if (documentType === 'additional') {
    const currentDocs = doctor.additionalDocuments || [];
    currentDocs.push({ url: fileUrl, filename: req.file.filename });
    doctor.additionalDocuments = currentDocs;
  }
  
  await doctor.save();
  
  res.json({ message: 'Document uploaded successfully', fileUrl });
});

// Admin: approve doctor
router.post('/:id/approve', auth, roles(['admin']), async (req, res) => {
  const doctor = await Doctor.findByPk(req.params.id);
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
  doctor.status = 'approved';
  await doctor.save();
  res.json(doctor);
});

module.exports = router;
