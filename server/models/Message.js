const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  orderId: { type: String, required: true, index: true },
  from: { type: String, enum: ['customer', 'admin'], required: true },
  senderName: { type: String, required: true },
  content: { type: String, required: true, maxlength: 1000 },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
