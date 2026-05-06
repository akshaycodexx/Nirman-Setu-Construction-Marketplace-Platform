const mongoose = require('mongoose');

const negotiationSchema = new mongoose.Schema({
  by: { type: String, enum: ['customer', 'supplier'], required: true },
  price: { type: Number, required: true },
  note: { type: String },
  at: { type: Date, default: Date.now },
}, { _id: false });

const quoteSchema = new mongoose.Schema({
  quoteId: { type: String, unique: true },
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'QuoteRequest', required: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  supplierName: { type: String, required: true },
  pricePerUnit: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  deliveryDays: { type: Number, required: true },
  notes: { type: String },
  status: { type: String, enum: ['active', 'countered', 'accepted', 'rejected', 'withdrawn'], default: 'active' },
  negotiation: [negotiationSchema],
  currentPrice: { type: Number },
}, { timestamps: true });

quoteSchema.pre('save', async function () {
  if (!this.quoteId) {
    this.quoteId = 'QT-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
  }
  if (!this.currentPrice) {
    this.currentPrice = this.totalPrice;
  }
});

module.exports = mongoose.model('Quote', quoteSchema);
