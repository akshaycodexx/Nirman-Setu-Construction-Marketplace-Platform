const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema({
  channel: { type: String, enum: ['whatsapp', 'sms', 'email'], required: true },
  event: { type: String, required: true },   // e.g. rfq_bid_received, order_confirmed
  recipient: { type: String, required: true }, // phone or email
  status: { type: String, enum: ['sent', 'failed', 'skipped'], default: 'sent' },
  error: { type: String },
  meta: { type: mongoose.Schema.Types.Mixed }, // orderId, supplierId, etc.
}, { timestamps: true });

notificationLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('NotificationLog', notificationLogSchema);
