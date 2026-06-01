const mongoose = require('mongoose');
const playRequestSchema = new mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    game: { type: String, required: true },
    venue: { type: String, required: true },
    message: { type: String, default: '', maxlength: 200 },
    proposedDate: { type: String, default: '' },
    proposedTime: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'accepted', 'declined', 'expired'], default: 'pending' },
  },
  { timestamps: true }
);
module.exports = mongoose.model('PlayRequest', playRequestSchema);
