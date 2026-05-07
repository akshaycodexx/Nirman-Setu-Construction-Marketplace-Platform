const mongoose = require('mongoose');

const labourRequestSchema = new mongoose.Schema({
  requestId: { type: String, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },

  jobType: {
    type: String,
    enum: ['mason', 'carpenter', 'electrician', 'plumber', 'painter', 'welder', 'tiles', 'other'],
    required: true,
  },
  jobTitle: { type: String, required: true },
  description: { type: String },
  workersNeeded: { type: Number, default: 1, min: 1 },
  estimatedDays: { type: Number, min: 1 },

  city: { type: String, required: true },
  address: { type: String, required: true },
  pincode: { type: String },

  startDate: { type: Date, required: true },
  budgetType: { type: String, enum: ['per_day', 'fixed'], default: 'per_day' },
  budget: { type: Number },

  status: { type: String, enum: ['open', 'accepted', 'cancelled', 'expired'], default: 'open' },
  expiresAt: { type: Date },

  quotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'LabourQuote' }],
  acceptedQuoteId: { type: mongoose.Schema.Types.ObjectId, ref: 'LabourQuote' },
}, { timestamps: true });

labourRequestSchema.pre('save', async function () {
  if (!this.requestId) {
    this.requestId = 'LR-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
  }
  if (!this.expiresAt) {
    this.expiresAt = new Date(Date.now() + 72 * 60 * 60 * 1000); // 72 hours
  }
});

module.exports = mongoose.model('LabourRequest', labourRequestSchema);
