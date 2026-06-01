const mongoose = require('mongoose');
const tournamentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  game: { type: String, required: true },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, default: '' },
  venue: { type: String, default: '' },
  date: { type: String, default: '' },
  time: { type: String, default: '' },
  maxPlayers: { type: Number, default: 16 },
  entryFee: { type: Number, default: 0 },
  status: { type: String, enum: ['upcoming','ongoing','completed'], default: 'upcoming' },
  participants: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    score: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
  }],
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });
module.exports = mongoose.model('Tournament', tournamentSchema);
