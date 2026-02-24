const express = require('express');
const router = express.Router();
const { Specialty } = require('../models');

// Get all specialties
router.get('/', async (req, res) => {
  try {
    const specialties = await Specialty.findAll({
      order: [['name', 'ASC']]
    });
    res.json(specialties);
  } catch (err) {
    console.error('Error fetching specialties:', err);
    res.status(500).json({ message: 'Failed to fetch specialties' });
  }
});

// Get specialty by ID
router.get('/:id', async (req, res) => {
  try {
    const specialty = await Specialty.findByPk(req.params.id);
    if (!specialty) {
      return res.status(404).json({ message: 'Specialty not found' });
    }
    res.json(specialty);
  } catch (err) {
    console.error('Error fetching specialty:', err);
    res.status(500).json({ message: 'Failed to fetch specialty' });
  }
});

module.exports = router;
