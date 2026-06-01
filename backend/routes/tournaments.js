const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');
const { protect } = require('../middleware/auth');

// GET /api/tournaments
router.get('/', protect, async (req, res) => {
  try {
    const tournaments = await Tournament.find()
      .populate('organizer', 'name avatar')
      .populate('participants.user', 'name avatar')
      .populate('winner', 'name avatar')
      .sort({ createdAt: -1 });
    res.json({ success: true, tournaments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/tournaments
router.post('/', protect, async (req, res) => {
  try {
    const { name, game, description, venue, date, time, maxPlayers, entryFee } = req.body;
    if (!name || !game) return res.status(400).json({ success: false, message: 'Name and game required' });
    const tournament = await Tournament.create({
      name, game, description: description || '', venue: venue || '',
      date: date || '', time: time || '',
      maxPlayers: maxPlayers || 16, entryFee: entryFee || 0,
      organizer: req.user._id,
    });
    await tournament.populate('organizer', 'name avatar');
    res.status(201).json({ success: true, tournament });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/tournaments/:id/join
router.post('/:id/join', protect, async (req, res) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ success: false, message: 'Not found' });
    if (tournament.status !== 'upcoming') {
      return res.status(400).json({ success: false, message: 'Tournament already started' });
    }
    const already = tournament.participants.find(p => p.user.toString() === req.user._id.toString());
    if (already) return res.status(400).json({ success: false, message: 'Already registered' });
    if (tournament.participants.length >= tournament.maxPlayers) {
      return res.status(400).json({ success: false, message: 'Tournament is full' });
    }
    tournament.participants.push({ user: req.user._id, score: 0, rank: 0 });
    await tournament.save();
    res.json({ success: true, message: 'Registered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/tournaments/:id/score - update score (organizer only)
router.put('/:id/score', protect, async (req, res) => {
  try {
    const { userId, score } = req.body;
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) return res.status(404).json({ success: false, message: 'Not found' });
    if (tournament.organizer.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only organizer can update scores' });
    }
    const participant = tournament.participants.find(p => p.user.toString() === userId);
    if (!participant) return res.status(404).json({ success: false, message: 'Participant not found' });
    participant.score = score;
    // Recalculate ranks
    tournament.participants.sort((a, b) => b.score - a.score);
    tournament.participants.forEach((p, i) => { p.rank = i + 1; });
    if (tournament.participants.length > 0) {
      tournament.winner = tournament.participants[0].user;
    }
    await tournament.save();
    await tournament.populate('participants.user', 'name avatar');
    res.json({ success: true, tournament });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
