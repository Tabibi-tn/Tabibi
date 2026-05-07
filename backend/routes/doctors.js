const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const auth = require('../middleware/auth');
const roles = require('../middleware/roles');
const upload = require('../middleware/upload');
const { Doctor, User, Specialty, Review, Patient } = require('../models');

/* ─── Helpers ─────────────────────────────────────────────── */

async function getDoctorRating(doctorId) {
  const reviews = await Review.findAll({ where: { doctorId }, attributes: ['rating'] });
  if (!reviews.length) return { averageRating: null, reviewCount: 0 };
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return { averageRating: parseFloat(avg.toFixed(1)), reviewCount: reviews.length };
}

/* ─── /me routes — MUST come before /:id routes ──────────── */

// Doctor: get own profile
router.get('/me', auth, roles(['doctor']), async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({
      where: { userId: req.user.id },
      include: [{ model: User, attributes: ['name', 'email'] }, { model: Specialty }]
    });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
    const rating = await getDoctorRating(doctor.id);
    res.json({ ...doctor.toJSON(), ...rating });
  } catch (err) { next(err); }
});

// Doctor: update own profile
router.put('/me', auth, roles(['doctor']), async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
    await doctor.update(req.body);
    res.json(doctor);
  } catch (err) { next(err); }
});

// Doctor: complete profile with documents
router.post('/me/complete-profile', auth, roles(['doctor']), async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
    const { specialtyId, experience, clinicAddress, fee, licenseNumber, bio, diplomaUrl, licenseDocUrl, additionalDocuments } = req.body;
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
  } catch (err) { next(err); }
});

// Doctor: upload document
router.post('/me/upload-document', auth, roles(['doctor']), upload.single('file'), async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    const { documentType } = req.body;
    if (documentType === 'diploma') {
      doctor.diplomaUrl = fileUrl;
    } else if (documentType === 'license') {
      doctor.licenseDocUrl = fileUrl;
    } else if (documentType === 'additional') {
      const current = doctor.additionalDocuments || [];
      current.push({ url: fileUrl, filename: req.file.filename });
      doctor.additionalDocuments = current;
    }
    await doctor.save();
    res.json({ message: 'Document uploaded successfully', fileUrl });
  } catch (err) { next(err); }
});

// Doctor: get own availability
router.get('/me/availability', auth, roles(['doctor']), async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
    res.json(doctor.availability || []);
  } catch (err) { next(err); }
});

// Doctor: set own availability
router.post('/me/availability', auth, roles(['doctor']), async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ where: { userId: req.user.id } });
    if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
    const events = Array.isArray(req.body) ? req.body : req.body.events;
    doctor.availability = events;
    await doctor.save();
    res.json(doctor.availability);
  } catch (err) { next(err); }
});

/* ─── Public list ─────────────────────────────────────────── */

router.get('/', async (req, res, next) => {
  try {
    const { search, specialtyId } = req.query;
    const where = { status: 'approved' };
    if (specialtyId) where.specialtyId = specialtyId;

    const doctors = await Doctor.findAll({
      where,
      include: [
        { model: User, attributes: ['name', 'email'] },
        { model: Specialty }
      ]
    });

    // Filter by name/specialty search server-side too
    let result = doctors;
    if (search) {
      const q = search.toLowerCase();
      result = doctors.filter(d =>
        (d.User?.name || '').toLowerCase().includes(q) ||
        (d.Specialty?.name || '').toLowerCase().includes(q)
      );
    }

    const withRatings = await Promise.all(result.map(async (doc) => {
      const rating = await getDoctorRating(doc.id);
      return { ...doc.toJSON(), ...rating };
    }));

    res.json(withRatings);
  } catch (err) { next(err); }
});

/* ─── /:id routes — AFTER /me ─────────────────────────────── */

// Public: get single doctor
router.get('/:id', async (req, res, next) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id, {
      include: [{ model: User, attributes: ['name', 'email'] }, { model: Specialty }]
    });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    const rating = await getDoctorRating(doctor.id);
    res.json({ ...doctor.toJSON(), ...rating });
  } catch (err) { next(err); }
});

// Public: get doctor availability
router.get('/:id/availability', async (req, res, next) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    res.json(doctor.availability || []);
  } catch (err) { next(err); }
});

// Admin: approve doctor
router.post('/:id/approve', auth, roles(['admin']), async (req, res, next) => {
  try {
    const doctor = await Doctor.findByPk(req.params.id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
    doctor.status = 'approved';
    await doctor.save();
    res.json(doctor);
  } catch (err) { next(err); }
});

module.exports = router;
