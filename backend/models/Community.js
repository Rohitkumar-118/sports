const mongoose = require('mongoose');
const communitySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  description: { type: String, default: '', maxlength: 500 },
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  games: [{ type: String }],
  location: { city: { type: String, default: '' }, address: { type: String, default: '' } },
  isActive: { type: Boolean, default: true },
  sessions: [{
    title: String,
    game: String,
    venue: String,
    date: String,
    time: String,
    maxPlayers: { type: Number, default: 10 },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
  }],
}, { timestamps: true });
module.exports = mongoose.model('Community', communitySchema);
