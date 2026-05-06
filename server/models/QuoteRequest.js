const mongoose = require('mongoose');

const quoteRequestSchema = new mongoose.Schema({
  requestId: { type: String, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  material: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true, enum: ['ton', 'bag', 'piece', 'truck', 'cubic_meter', 'kg', 'litre', 'sqft'] },
  description: { type: String },
  city: { type: String, required: true },
  pincode: { type: String },
  address: { type: String, required: true },
  requiredBy: { type: Date, required: true },
  budget: { type: Number },
  status: { type: String, enum: ['open', 'accepted', 'cancelled', 'expired'], default: 'open' },
  quotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quote' }],
  acceptedQuoteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quote', default: null },
  convertedOrderId: { type: String, default: null },
  expiresAt: { type: Date },
}, { timestamps: true });

quoteRequestSchema.pre('save', async function () {
  if (!this.requestId) {
    this.requestId = 'QR-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
  }
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
  }
});

module.exports = mongoose.model('QuoteRequest', quoteRequestSchema);
