const mongoose = require('mongoose');
const ratingSchema = new mongoose.Schema({
  rater: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rated: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'PlayRequest' },
  score: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, default: '', maxlength: 200 },
  game: { type: String, default: '' },
}, { timestamps: true });
ratingSchema.index({ rater: 1, requestId: 1 }, { unique: true });
module.exports = mongoose.model('Rating', ratingSchema);
