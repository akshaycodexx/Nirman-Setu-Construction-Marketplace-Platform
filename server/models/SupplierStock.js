const mongoose = require('mongoose');

const supplierStockSchema = new mongoose.Schema({
  stockId: { type: String, unique: true },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true },
  material: { type: String, required: true },
  category: {
    type: String,
    enum: ['cement', 'sand', 'aggregate', 'steel', 'brick', 'equipment', 'labour', 'transport', 'other'],
    default: 'other',
  },
  grade: { type: String, default: '' },
  unit: { type: String, required: true },
  quantity: { type: Number, required: true, min: 0 },
  pricePerUnit: { type: Number, required: true, min: 0 },
  minOrderQty: { type: Number, default: 1 },
  city: { type: String, required: true },
  isAvailable: { type: Boolean, default: true },
  note: { type: String, default: '' },
}, { timestamps: true });

supplierStockSchema.pre('save', async function () {
  if (!this.stockId) {
    const last = await this.constructor.findOne({}, { stockId: 1 }).sort({ createdAt: -1 });
    let num = 1;
    if (last?.stockId) {
      const n = parseInt(last.stockId.replace('SS-', ''), 10);
      if (!isNaN(n)) num = n + 1;
    }
    this.stockId = `SS-${String(num).padStart(3, '0')}`;
  }
});

module.exports = mongoose.model('SupplierStock', supplierStockSchema);
