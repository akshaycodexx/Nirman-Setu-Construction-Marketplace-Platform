const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  projectId: { type: String, unique: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },

  name: { type: String, required: true },
  description: { type: String },
  city: { type: String },
  address: { type: String },

  estimatedBudget: { type: Number },
  status: { type: String, enum: ['active', 'paused', 'completed'], default: 'active' },

  linkedOrders: [{
    orderId: { type: String },
    addedAt: { type: Date, default: Date.now },
  }],

  linkedLabour: [{
    requestId: { type: String },
    addedAt: { type: Date, default: Date.now },
  }],

  notes: { type: String },
}, { timestamps: true });

projectSchema.pre('save', async function () {
  if (!this.projectId) {
    this.projectId = 'PR-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase();
  }
});

module.exports = mongoose.model('Project', projectSchema);
