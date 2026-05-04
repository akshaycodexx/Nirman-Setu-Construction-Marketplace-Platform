const mongoose = require('mongoose');

const platformFeeSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  orderRef: { type: String, required: true },

  paidBy: { type: String, enum: ['supplier', 'customer'], required: true },
  payerId: { type: mongoose.Schema.Types.ObjectId, required: true },
  payerName: { type: String, required: true },

  amount: { type: Number, required: true, min: 0 },
  status: { type: String, enum: ['pending', 'paid', 'waived'], default: 'pending' },
  note: { type: String, default: '' },

  paidAt: { type: Date, default: null },
  waivedAt: { type: Date, default: null },
  waivedReason: { type: String, default: '' },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
}, { timestamps: true });

platformFeeSchema.index({ orderId: 1 }, { unique: true });
platformFeeSchema.index({ payerId: 1, status: 1 });
platformFeeSchema.index({ status: 1, paidAt: 1 });

module.exports = mongoose.model('PlatformFee', platformFeeSchema);
