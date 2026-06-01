const express = require('express');
const router = express.Router();
const User = require('../models/User');
const PlayRequest = require('../models/PlayRequest');
const Tournament = require('../models/Tournament');
const Community = require('../models/Community');
const { protect, authorize } = require('../middleware/auth');

const adminOnly = [protect, authorize('admin')];

// GET /api/admin/stats
router.get('/stats', adminOnly, async (req, res) => {
  try {
    const [totalUsers, activeUsers, totalRequests, acceptedRequests, totalTournaments, totalCommunities] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      PlayRequest.countDocuments(),
      PlayRequest.countDocuments({ status: 'accepted' }),
      Tournament.countDocuments(),
      Community.countDocuments(),
    ]);
    res.json({ success: true, stats: { totalUsers, activeUsers, totalRequests, acceptedRequests, totalTournaments, totalCommunities } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/users
router.get('/users', adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const search = req.query.search || '';
    const filter = search ? { $or: [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }] } : {};
    const users = await User.find(filter).select('-password').skip((page-1)*limit).limit(limit).sort({ createdAt: -1 });
    const total = await User.countDocuments(filter);
    res.json({ success: true, users, total, pages: Math.ceil(total/limit), currentPage: page });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/users/:id/toggle
router.put('/users/:id/toggle', adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user: { _id: user._id, name: user.name, isActive: user.isActive } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user','organizer','admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/admin/requests
router.get('/requests', adminOnly, async (req, res) => {
  try {
    const requests = await PlayRequest.find()
      .populate('sender', 'name email')
      .populate('receiver', 'name email')
      .sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
