const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Order = require('../models/Order');
const Supplier = require('../models/Supplier');
const { sendQuoteNotification } = require('../utils/mailer');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/admin/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email and password required' });

    const admin = await Admin.findOne({ email });
    if (!admin || !(await admin.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    res.json({
      success: true,
      token: signToken(admin._id),
      admin: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (err) {
    console.error('login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/me
const getMe = (req, res) => {
  res.json({ success: true, admin: req.admin });
};

// GET /api/admin/dashboard
const getDashboard = async (req, res) => {
  try {
    const [total, pending, confirmed, dispatched, delivered, cancelled] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'confirmed' }),
      Order.countDocuments({ status: 'dispatched' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' }),
    ]);

    const recent = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderId status category customer.name delivery.city createdAt');

    res.json({
      success: true,
      stats: { total, pending, confirmed, dispatched, delivered, cancelled },
      recent,
    });
  } catch (err) {
    console.error('getDashboard error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/orders
const getOrders = async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { 'customer.name': { $regex: search, $options: 'i' } },
        { 'customer.phone': { $regex: search, $options: 'i' } },
        { 'delivery.city': { $regex: search, $options: 'i' } },
      ];
    }

    const total = await Order.countDocuments(filter);
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, orders, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('getOrders error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/orders/:orderId
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId })
      .populate('supplierId', 'name phone businessName');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    console.error('getOrderById error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/admin/orders/:orderId/status
const updateStatus = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const validStatuses = ['pending', 'quoted', 'confirmed', 'dispatched', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status))
      return res.status(400).json({ success: false, message: 'Invalid status' });

    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { status, ...(adminNote !== undefined && { adminNote }) },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, order });
  } catch (err) {
    console.error('updateStatus error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/admin/orders/:orderId/quote
const sendQuote = async (req, res) => {
  try {
    const { amount, breakdown, adminNote } = req.body;
    if (!amount || !breakdown)
      return res.status(400).json({ success: false, message: 'Amount and breakdown required' });

    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      {
        status: 'quoted',
        quote: { amount, breakdown, sentAt: new Date() },
        ...(adminNote && { adminNote }),
      },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Notify customer — fire and forget
    sendQuoteNotification(order).catch(err =>
      console.error('Quote email failed:', err.message)
    );

    res.json({ success: true, order });
  } catch (err) {
    console.error('sendQuote error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/admin/orders/:orderId/assign-supplier
const assignSupplier = async (req, res) => {
  try {
    const { supplierId } = req.body;
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });

    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { supplierId, status: 'confirmed' },
      { new: true }
    ).populate('supplierId', 'name phone businessName');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    console.error('assignSupplier error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── Supplier Management ──────────────────────────────────────────────────────

// GET /api/admin/suppliers
const getSuppliers = async (req, res) => {
  try {
    const { kycStatus, search } = req.query;
    const filter = {};
    if (kycStatus && kycStatus !== 'all') filter.kycStatus = kycStatus;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { businessName: { $regex: search, $options: 'i' } },
      ];
    }
    const suppliers = await Supplier.find(filter).sort({ createdAt: -1 }).select('-password');
    res.json({ success: true, suppliers });
  } catch (err) {
    console.error('getSuppliers error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/admin/suppliers
const createSupplier = async (req, res) => {
  try {
    const { name, phone, password, businessName, categories, serviceAreas, notes } = req.body;
    if (!name || !phone || !password)
      return res.status(400).json({ success: false, message: 'Name, phone, password required' });

    const exists = await Supplier.findOne({ phone });
    if (exists) return res.status(409).json({ success: false, message: 'Phone already registered' });

    const supplier = await Supplier.create({
      name, phone, password, businessName, categories, serviceAreas, notes,
      kycStatus: 'verified', verifiedBadge: true,
    });

    res.status(201).json({
      success: true,
      supplier: { ...supplier.toObject(), password: undefined },
    });
  } catch (err) {
    console.error('createSupplier error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/admin/suppliers/:id/kyc
const updateSupplierKyc = async (req, res) => {
  try {
    const { kycStatus } = req.body;
    const valid = ['pending', 'verified', 'rejected'];
    if (!valid.includes(kycStatus))
      return res.status(400).json({ success: false, message: 'Invalid kycStatus' });

    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { kycStatus, verifiedBadge: kycStatus === 'verified' },
      { new: true }
    ).select('-password');

    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    res.json({ success: true, supplier });
  } catch (err) {
    console.error('updateSupplierKyc error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/admin/suppliers/:id/toggle
const toggleSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    supplier.isActive = !supplier.isActive;
    await supplier.save();
    res.json({ success: true, isActive: supplier.isActive });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  login, getMe, getDashboard, getOrders, getOrderById, updateStatus, sendQuote,
  assignSupplier, getSuppliers, createSupplier, updateSupplierKyc, toggleSupplier,
};
