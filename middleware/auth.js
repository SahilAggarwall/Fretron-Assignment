const jwt = require('jsonwebtoken');
const User = require('../models/user');
const Role = require('../models/role');

const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, 'jwtSecret');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('role');
    const adminRole = await Role.findOne({ role: 'Admin' });

    if (user && adminRole) {
      // Check if the user's role matches the admin role
      if (user.role._id.toString() === adminRole._id.toString()) {
        next();
      } else {
        res.status(403).json({ msg: 'Access denied: Admins only' });
      }
    } else {
      res.status(403).json({ msg: 'Access denied: Admins only' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

// Role-based authorization middleware
const roleAuth = (roles) => async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('role');
    const userRole = user.role.role;
    console.log(user);
    console.log(userRole);
    if (roles.includes(userRole)) {
      next();
    } else {
      res.status(403).json({ msg: 'Access denied' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: 'Server error' });
  }
};

module.exports = { auth, adminAuth, roleAuth };
