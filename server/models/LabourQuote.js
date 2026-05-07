const mongoose = require('mongoose');

const labourQuoteSchema = new mongoose.Schema({
  quoteId: { type: String, unique: true },
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'LabourRequest', required: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  supplierName: { type: String, required: true },

  ratePerDay: { type: Number, required: true },
  totalWorkers: { type: Number, default: 1 },
  totalDays: { type: Number },
  totalAmount: { type: Number, required: true },
  notes: { type: String },

  status: { type: String, enum: ['active', 'countered', 'accepted', 'rejected'], default: 'active' },
  currentRate: { type: Number },

  negotiation: [{
    by: { type: String, enum: ['customer', 'supplier'] },
    price: Number,
    note: String,
    at: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

labourQuoteSchema.pre('save', async function () {
  if (!this.quoteId) {
    this.quoteId = 'LQ-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
  }
  if (!this.currentRate) {
    this.currentRate = this.totalAmount;
  }
});

module.exports = mongoose.model('LabourQuote', labourQuoteSchema);
