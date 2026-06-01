const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/search?game=chess&city=Salem&skill=beginner
router.get('/', protect, async (req, res) => {
  try {
    const { game, skill, city } = req.query;

    const filter = {
      _id: { $ne: req.user._id },
      isActive: true,
    };

    if (game) filter.preferredGames = { $in: [game] };
    if (skill) filter.skillLevel = skill;
    if (city) filter['location.city'] = { $regex: city, $options: 'i' };

    const users = await User.find(filter).select(
      'name avatar bio location preferredGames skillLevel availability preferredVenues'
    ).limit(20);

    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
});

module.exports = router;
