const mongoose = require('mongoose');
const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['request_received','request_accepted','request_declined','match_rated','tournament_invite','community_invite'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  link: { type: String, default: '' },
  meta: { type: mongoose.Schema.Types.Mixed, default: {} },
}, { timestamps: true });
module.exports = mongoose.model('Notification', notificationSchema);
