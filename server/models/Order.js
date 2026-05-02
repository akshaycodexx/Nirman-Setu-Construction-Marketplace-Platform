const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
  },
  category: {
    type: String,
    enum: ['material', 'transport', 'equipment'],
    required: true,
  },
  items: [itemSchema],
  delivery: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    pincode: { type: String },
    date: { type: Date, required: true },
    slot: { type: String, enum: ['morning', 'evening', 'anytime'], default: 'anytime' },
  },
  customer: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
  },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', default: null },
  notes: { type: String },
  status: {
    type: String,
    enum: ['pending', 'quoted', 'confirmed', 'dispatched', 'delivered', 'cancelled'],
    default: 'pending',
  },
  adminNote: { type: String },
  supplierId: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', default: null },
  supplierNote: { type: String },
  quote: {
    amount: Number,
    breakdown: String,
    sentAt: Date,
  },
  payment: {
    status: { type: String, enum: ['none', 'advance_paid', 'fully_paid', 'refunded'], default: 'none' },
    advanceAmount: Number,
    advancePaidAt: Date,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
  },
  timeline: [{
    status: String,
    note: String,
    by: { type: String, enum: ['admin', 'supplier', 'customer'] },
    at: { type: Date, default: Date.now },
  }],
}, { timestamps: true });


module.exports = mongoose.model('Order', orderSchema);
