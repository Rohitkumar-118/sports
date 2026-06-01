const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};

const userResponse = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  phone: user.phone,
  skillLevel: user.skillLevel,
  preferredGames: user.preferredGames,
  availability: user.availability,
  preferredVenues: user.preferredVenues,
  location: user.location,
  bio: user.bio,
  avatar: user.avatar,
});

// POST /api/auth/register
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errors.array().map((e) => e.msg).join(', ');
      return res.status(400).json({ success: false, message });
    }

    const { name, email, password, phone, location, preferredGames, skillLevel, availability, preferredVenues, bio } = req.body;

    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already registered' });
      }

      const user = await User.create({
        name,
        email,
        password,
        phone: phone || '',
        location: location || { address: '', city: '', coordinates: { lat: null, lng: null } },
        preferredGames: Array.isArray(preferredGames) ? preferredGames : [],
        skillLevel: skillLevel || 'beginner',
        availability: { days: availability?.days || [], timeSlots: availability?.timeSlots || [] },
        preferredVenues: Array.isArray(preferredVenues) ? preferredVenues : [],
        bio: bio || '',
      });

      const token = generateToken(user._id);
      return res.status(201).json({ success: true, token, user: userResponse(user) });
    } catch (error) {
      console.error('Register error:', error);
      if (error.name === 'ValidationError') {
        const message = Object.values(error.errors).map((e) => e.message).join(', ');
        return res.status(400).json({ success: false, message });
      }
      return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
  }
);

// POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const message = errors.array().map((e) => e.msg).join(', ');
      return res.status(400).json({ success: false, message });
    }

    const { email, password } = req.body;

    try {
      const user = await User.findOne({ email }).select('+password');
      if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' });

      const isMatch = await user.matchPassword(password);
      if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid email or password' });

      const token = generateToken(user._id);
      return res.json({ success: true, token, user: userResponse(user) });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
    }
  }
);

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  res.json({ success: true, user: req.user });
});

// POST /api/auth/logout
router.post('/logout', protect, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

module.exports = router;
