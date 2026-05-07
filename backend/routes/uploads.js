const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// POST /api/uploads - authenticated
router.post('/', auth, upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ fileUrl, filename: req.file.filename, mimetype: req.file.mimetype });
  } catch (err) { next(err); }
});

module.exports = router;
