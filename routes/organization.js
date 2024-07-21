const express = require('express');
const router = express.Router();
const Organization = require('../models/organization');
const { auth, adminAuth } = require('../middleware/auth');

// Create Organization route
router.post('/create', auth, adminAuth, async (req, res) => {
  const { name } = req.body;

  try {
    // Create new organization
    const organization = new Organization({ name });
    // Save to database
    await organization.save();

    res.status(201).json({ msg: 'Organization created successfully', organization });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error by Organization');
  }
});

module.exports = router;
