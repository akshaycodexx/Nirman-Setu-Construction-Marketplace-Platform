const mongoose = require('mongoose');

const materialRateSchema = new mongoose.Schema({
  rateId: { type: String, unique: true },
  material: { type: String, required: true },
  grade: { type: String, default: '' },
  unit: { type: String, required: true },
  minRate: { type: Number, required: true },
  maxRate: { type: Number, required: true },
  category: {
    type: String,
    enum: ['cement', 'sand', 'aggregate', 'steel', 'brick', 'equipment', 'labour', 'other'],
    default: 'other',
  },
  city: { type: String, default: 'All Cities' },
  isActive: { type: Boolean, default: true },
  note: { type: String, default: '' },
}, { timestamps: true });

materialRateSchema.pre('save', async function () {
  if (!this.rateId) {
    const last = await this.constructor.findOne({}, { rateId: 1 }).sort({ createdAt: -1 });
    let num = 1;
    if (last?.rateId) {
      const n = parseInt(last.rateId.replace('MR-', ''), 10);
      if (!isNaN(n)) num = n + 1;
    }
    this.rateId = `MR-${String(num).padStart(3, '0')}`;
  }
});

module.exports = mongoose.model('MaterialRate', materialRateSchema);
