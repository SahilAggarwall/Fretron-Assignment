const express = require('express');
const router = express.Router();
const User = require('../models/user');
const Organization = require('../models/organization');
const UserOrg = require('../models/userOrg');
const { auth, roleAuth } = require('../middleware/auth');

// Add user to organization
router.post('/add-user-org', auth, roleAuth(['Admin', 'Employee']), async (req, res) => {
  const { orgName, username } = req.body;

  try {
    // Find organization by name
    const org = await Organization.findOne({ name: orgName });
    if (!org) {
      return res.status(400).json({ msg: 'Organization not found' });
    }

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: 'User not found' });
    }

    // Find or create UserOrg entry
    let userOrg = await UserOrg.findOne({ org: org._id });
    if (!userOrg) {
      userOrg = new UserOrg({ org: org._id, users: [] });
    }

    // Add user to organization if not already added
    if (!userOrg.users.includes(user._id)) {
      userOrg.users.push(user._id);
      await userOrg.save();
      res.status(201).json({ msg: 'User added to organization successfully' });
    } else {
      res.status(400).json({ msg: 'User already in organization' });
    }
  } catch (err) {
    console.error('Error adding user to organization:', err.message);
    res.status(500).send('Server Error by userorg.js');
  }
});

module.exports = router;
