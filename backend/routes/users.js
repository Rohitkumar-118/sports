const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/users/profile
// @desc    Get own profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('playHistory.partnerId', 'name avatar');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   PUT /api/users/profile
// @desc    Update own profile
// @access  Private
router.put(
  '/profile',
  protect,
  [
    body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
    body('skillLevel')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced'])
      .withMessage('Invalid skill level'),
    body('bio').optional().isLength({ max: 200 }).withMessage('Bio too long'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const allowedFields = [
      'name',
      'phone',
      'avatar',
      'location',
      'preferredGames',
      'skillLevel',
      'availability',
      'preferredVenues',
      'bio',
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    try {
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      res.json({ success: true, user });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// @route   PUT /api/users/change-password
// @desc    Change password
// @access  Private
router.put(
  '/change-password',
  protect,
  [
    body('currentPassword').notEmpty().withMessage('Current password required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 chars'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user._id).select('+password');
      const isMatch = await user.matchPassword(req.body.currentPassword);

      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }

      user.password = req.body.newPassword;
      await user.save();

      res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

// @route   GET /api/users/:id
// @desc    Get public profile of another user
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      'name avatar bio location preferredGames skillLevel availability preferredVenues'
    );

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   DELETE /api/users/profile
// @desc    Deactivate own account
// @access  Private
router.delete('/profile', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    res.json({ success: true, message: 'Account deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// @route   GET /api/users (admin only)
// @desc    Get all users
// @access  Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find({ isActive: true })
      .select('-playHistory')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments({ isActive: true });

    res.json({
      success: true,
      count: users.length,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
