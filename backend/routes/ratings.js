const express = require('express');
const router = express.Router();
const Rating = require('../models/Rating');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// POST /api/ratings
router.post('/', protect, async (req, res) => {
  try {
    const { ratedId, requestId, score, comment, game } = req.body;
    if (!ratedId || !score) {
      return res.status(400).json({ success: false, message: 'Rated user and score are required' });
    }
    if (ratedId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot rate yourself' });
    }
    const existing = await Rating.findOne({ rater: req.user._id, requestId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already rated this match' });
    }
    const rating = await Rating.create({
      rater: req.user._id, rated: ratedId, requestId, score, comment: comment || '', game: game || '',
    });
    res.status(201).json({ success: true, rating });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/ratings/user/:id - get ratings for a user
router.get('/user/:id', protect, async (req, res) => {
  try {
    const ratings = await Rating.find({ rated: req.params.id })
      .populate('rater', 'name avatar')
      .sort({ createdAt: -1 });
    const avg = ratings.length
      ? (ratings.reduce((sum, r) => sum + r.score, 0) / ratings.length).toFixed(1)
      : null;
    res.json({ success: true, ratings, average: avg, count: ratings.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
