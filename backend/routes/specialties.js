const express = require('express');
const router = express.Router();
const { Specialty } = require('../models');

router.get('/', async (req, res, next) => {
  try {
    const specialties = await Specialty.findAll({ order: [['name', 'ASC']] });
    res.json(specialties);
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const specialty = await Specialty.findByPk(req.params.id);
    if (!specialty) return res.status(404).json({ message: 'Specialty not found' });
    res.json(specialty);
  } catch (err) { next(err); }
});

module.exports = router;
