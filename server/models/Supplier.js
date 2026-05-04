const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  email: { type: String },
  password: { type: String, required: true },

  businessName: { type: String },
  categories: [{
    type: String,
    enum: [
      'basic_materials', 'structural', 'wood_carpentry', 'chemicals',
      'paint_finishing', 'flooring_tiling', 'doors_windows', 'interior_furniture',
      'electrical', 'plumbing_sanitary', 'machinery', 'transport',
      'labour', 'contractors', 'design_planning', 'shuttering',
      'water_utilities', 'smart_features', 'complete_services',
      'commercial', 'support_services',
    ],
  }],
  serviceAreas: [{ type: String }],

  kycStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending',
  },
  verifiedBadge: { type: Boolean, default: false },

  rating: {
    average: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },
  },

  availability: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },
  selfRegistered: { type: Boolean, default: false },

  notes: { type: String },
}, { timestamps: true });

supplierSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

supplierSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('Supplier', supplierSchema);
