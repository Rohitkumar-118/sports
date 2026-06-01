const express = require('express');
const router = express.Router();
const User = require('../models/User');
const PlayRequest = require('../models/PlayRequest');
const Rating = require('../models/Rating');
const { protect } = require('../middleware/auth');

// GET /api/recommendations
router.get('/', protect, async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);

    // Get users already played with
    const pastRequests = await PlayRequest.find({
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
      status: 'accepted',
    });
    const playedWith = new Set(pastRequests.map(r =>
      r.sender.toString() === req.user._id.toString()
        ? r.receiver.toString()
        : r.sender.toString()
    ));

    // Find candidates - same games, exclude already played
    const candidates = await User.find({
      _id: { $ne: req.user._id, $nin: [...playedWith] },
      isActive: true,
      preferredGames: { $in: currentUser.preferredGames || [] },
    }).select('name avatar bio location preferredGames skillLevel availability preferredVenues').limit(50);

    // Score each candidate
    const scored = await Promise.all(candidates.map(async (candidate) => {
      let score = 0;

      // Game overlap score (40%)
      const sharedGames = (currentUser.preferredGames || []).filter(g =>
        (candidate.preferredGames || []).includes(g)
      );
      score += (sharedGames.length / Math.max((currentUser.preferredGames || []).length, 1)) * 40;

      // Skill match (20%)
      if (candidate.skillLevel === currentUser.skillLevel) score += 20;
      else if (
        (candidate.skillLevel === 'intermediate' && currentUser.skillLevel !== 'advanced') ||
        (candidate.skillLevel === 'beginner' && currentUser.skillLevel === 'beginner')
      ) score += 10;

      // Availability overlap (25%)
      const sharedDays = (currentUser.availability?.days || []).filter(d =>
        (candidate.availability?.days || []).includes(d)
      );
      score += (sharedDays.length / 7) * 25;

      // Venue overlap (15%)
      const sharedVenues = (currentUser.preferredVenues || []).filter(v =>
        (candidate.preferredVenues || []).includes(v)
      );
      if (sharedVenues.length > 0) score += 15;

      // Rating bonus
      const ratings = await Rating.find({ rated: candidate._id });
      if (ratings.length > 0) {
        const avg = ratings.reduce((s, r) => s + r.score, 0) / ratings.length;
        score += (avg / 5) * 10;
      }

      return { ...candidate.toObject(), matchScore: Math.round(score), sharedGames };
    }));

    // Sort by score descending, return top 10
    scored.sort((a, b) => b.matchScore - a.matchScore);
    res.json({ success: true, recommendations: scored.slice(0, 10) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
