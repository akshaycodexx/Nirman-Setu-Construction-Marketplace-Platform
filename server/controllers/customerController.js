const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');
const Order = require('../models/Order');
const { createRazorpayOrder, verifySignature } = require('../utils/razorpay');
const { sendPaymentConfirmation } = require('../utils/mailer');

function signToken(id) {
  return jwt.sign({ id, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

// Link anonymous orders (same phone) to this customer account
async function linkOrdersByPhone(customerId, phone) {
  await Order.updateMany(
    { 'customer.phone': phone, customerId: null },
    { $set: { customerId } }
  );
}

// POST /api/customer/register
exports.register = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    if (!name || !phone || !password) return res.status(400).json({ message: 'Name, phone and password required' });
    const exists = await Customer.findOne({ phone });
    if (exists) return res.status(409).json({ message: 'Phone already registered' });
    const customer = await Customer.create({ name, phone, email, password });
    await linkOrdersByPhone(customer._id, phone);
    const token = signToken(customer._id);
    res.status(201).json({ token, customer: { _id: customer._id, name: customer.name, phone: customer.phone, email: customer.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/customer/login
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    const customer = await Customer.findOne({ phone });
    if (!customer || !(await customer.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid phone or password' });
    }
    if (!customer.isActive) return res.status(403).json({ message: 'Account deactivated' });
    await linkOrdersByPhone(customer._id, phone);
    const token = signToken(customer._id);
    res.json({ token, customer: { _id: customer._id, name: customer.name, phone: customer.phone, email: customer.email } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/customer/me
exports.getMe = async (req, res) => {
  res.json(req.customer);
};

// PATCH /api/customer/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, address } = req.body;
    const update = {};
    if (name) update.name = name;
    if (email !== undefined) update.email = email;
    if (address) update.address = address;

    const customer = await Customer.findByIdAndUpdate(req.customer._id, update, { new: true }).select('-password');
    res.json(customer);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/customer/orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customerId: req.customer._id })
      .select('-supplierId -supplierNote -adminNote')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/customer/orders/:orderId
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId, customerId: req.customer._id })
      .select('-supplierId -supplierNote -adminNote');
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/customer/orders/:orderId/cancel
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId, customerId: req.customer._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'pending') return res.status(400).json({ message: 'Only pending orders can be cancelled' });
    order.status = 'cancelled';
    order.timeline.push({ status: 'cancelled', note: 'Cancelled by customer', by: 'customer' });
    await order.save();
    res.json({ message: 'Order cancelled', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/customer/orders/:orderId/payment/create
exports.createPayment = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId, customerId: req.customer._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    if (order.status !== 'quoted') return res.status(400).json({ message: 'Order must be quoted before payment' });
    if (order.payment.status !== 'none') return res.status(400).json({ message: 'Payment already initiated' });
    if (!order.quote?.amount) return res.status(400).json({ message: 'No quote available' });

    const advanceAmount = Math.ceil(order.quote.amount * 0.3);
    const rzpOrder = await createRazorpayOrder(advanceAmount, order.orderId);

    order.payment.razorpayOrderId = rzpOrder.id;
    order.payment.advanceAmount = advanceAmount;
    await order.save();

    res.json({
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      advanceAmount,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/customer/orders/:orderId/review
exports.reviewOrder = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const r = Number(rating);
    if (!r || r < 1 || r > 5) return res.status(400).json({ message: 'Rating must be 1–5' });
    const existing = await Order.findOne({ orderId: req.params.orderId, customerId: req.customer._id }).select('status review');
    if (!existing) return res.status(404).json({ message: 'Order not found' });
    if (existing.status !== 'delivered') return res.status(400).json({ message: 'Only delivered orders can be reviewed' });
    if (existing.review?.rating) return res.status(400).json({ message: 'Already reviewed' });
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId, customerId: req.customer._id },
      { $set: { review: { rating: r, comment: comment || '', reviewedAt: new Date() } } },
      { new: true, runValidators: false }
    );
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/customer/orders/:orderId/payment/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayPaymentId, razorpaySignature } = req.body;
    const order = await Order.findOne({ orderId: req.params.orderId, customerId: req.customer._id });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const valid = verifySignature(order.payment.razorpayOrderId, razorpayPaymentId, razorpaySignature);
    if (!valid) return res.status(400).json({ message: 'Payment verification failed' });

    order.payment.status = 'advance_paid';
    order.payment.razorpayPaymentId = razorpayPaymentId;
    order.payment.razorpaySignature = razorpaySignature;
    order.payment.advancePaidAt = new Date();
    order.status = 'confirmed';
    order.timeline.push({ status: 'confirmed', note: 'Advance payment received', by: 'customer' });
    await order.save();

    sendPaymentConfirmation(order).catch(e => console.error('Payment email failed:', e.message));

    res.json({ message: 'Payment verified', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
