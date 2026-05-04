const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const path = require('path');
const multer = require('multer');
const Supplier = require('../models/Supplier');
const Order = require('../models/Order');

// Multer config — save to uploads/proofs/
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads', 'proofs');
    require('fs').mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) cb(null, true);
  else cb(new Error('Only images allowed'));
}});
exports.uploadMiddleware = upload.single('photo');

const signToken = (id) =>
  jwt.sign({ id, role: 'supplier' }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/supplier/register (public — self-registration, requires admin approval)
const register = async (req, res) => {
  try {
    const { name, phone, email, password, businessName, categories, serviceAreas } = req.body;
    if (!name || !phone || !password) return res.status(400).json({ success: false, message: 'Name, phone and password required' });
    if (password.length < 6) return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    const exists = await Supplier.findOne({ phone });
    if (exists) return res.status(409).json({ success: false, message: 'Phone already registered' });
    await Supplier.create({
      name, phone, email, password, businessName,
      categories: categories || [],
      serviceAreas: serviceAreas || [],
      isActive: false,
      selfRegistered: true,
      kycStatus: 'pending',
    });
    res.status(201).json({ success: true, message: 'Registration submitted! Admin review ke baad login milega.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/supplier/login
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password)
      return res.status(400).json({ success: false, message: 'Phone and password required' });

    const supplier = await Supplier.findOne({ phone });
    if (!supplier || !(await supplier.comparePassword(password)))
      return res.status(401).json({ success: false, message: 'Invalid credentials' });

    if (!supplier.isActive)
      return res.status(403).json({ success: false, message: 'Account suspended. Contact admin.' });

    res.json({
      success: true,
      token: signToken(supplier._id),
      supplier: {
        id: supplier._id,
        name: supplier.name,
        phone: supplier.phone,
        businessName: supplier.businessName,
        kycStatus: supplier.kycStatus,
        verifiedBadge: supplier.verifiedBadge,
        categories: supplier.categories,
      },
    });
  } catch (err) {
    console.error('supplier login error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/supplier/me
const getMe = (req, res) => res.json({ success: true, supplier: req.supplier });

// GET /api/supplier/orders
const getMyOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { supplierId: req.supplier._id };
    if (status && status !== 'all') filter.status = status;

    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .select('-customer.phone -customer.email -supplierId');

    res.json({ success: true, orders });
  } catch (err) {
    console.error('getMyOrders error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/supplier/orders/:orderId
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      orderId: req.params.orderId,
      supplierId: req.supplier._id,
    }).select('-customer.phone -customer.email -supplierId -quote.amount');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    res.json({ success: true, order });
  } catch (err) {
    console.error('supplier getOrderById error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/supplier/orders/:orderId/status
const updateOrderStatus = async (req, res) => {
  try {
    const { status, supplierNote } = req.body;
    const allowed = ['dispatched', 'delivered'];
    if (!allowed.includes(status))
      return res.status(400).json({ success: false, message: 'Supplier can only set dispatched or delivered' });

    const existing = await Order.findOne({ orderId: req.params.orderId, supplierId: req.supplier._id }).select('status');
    if (!existing) return res.status(404).json({ success: false, message: 'Order not found' });

    const flow = ['confirmed', 'dispatched', 'delivered'];
    if (flow.indexOf(status) <= flow.indexOf(existing.status))
      return res.status(400).json({ success: false, message: 'Invalid status transition' });

    const setFields = { status };
    if (supplierNote) setFields.supplierNote = supplierNote;

    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId, supplierId: req.supplier._id },
      {
        $set: setFields,
        $push: { timeline: { status, note: supplierNote || '', by: 'supplier', at: new Date() } },
      },
      { new: true, runValidators: false }
    );

    const io = req.app.get('io');
    if (io) {
      io.to(`order:${order.orderId}`).emit('order:updated', { orderId: order.orderId, status: order.status });
      io.to('admin').emit('order:updated', { orderId: order.orderId, status: order.status });
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error('supplier updateOrderStatus error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/supplier/dashboard
const getDashboard = async (req, res) => {
  try {
    const sid = req.supplier._id;
    const [total, confirmed, dispatched, delivered, ratingResult, earningResult, pendingPayoutResult] = await Promise.all([
      Order.countDocuments({ supplierId: sid }),
      Order.countDocuments({ supplierId: sid, status: 'confirmed' }),
      Order.countDocuments({ supplierId: sid, status: 'dispatched' }),
      Order.countDocuments({ supplierId: sid, status: 'delivered' }),
      Order.aggregate([
        { $match: { supplierId: sid, 'review.rating': { $exists: true, $ne: null } } },
        { $group: { _id: null, avg: { $avg: '$review.rating' }, count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { supplierId: sid, 'supplierPayout.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$supplierPayout.amount' } } },
      ]),
      Order.aggregate([
        { $match: { supplierId: sid, 'payment.status': { $in: ['advance_paid', 'fully_paid'] }, 'supplierPayout.status': 'pending' } },
        { $group: { _id: null, total: { $sum: '$payment.advanceAmount' }, count: { $sum: 1 } } },
      ]),
    ]);

    const avgRating = ratingResult[0]?.avg ? +(ratingResult[0].avg.toFixed(1)) : null;
    const ratingCount = ratingResult[0]?.count || 0;
    const earnings = earningResult[0]?.total || 0;
    const pendingPayout = { total: pendingPayoutResult[0]?.total || 0, count: pendingPayoutResult[0]?.count || 0 };

    const pendingAcceptance = await Order.countDocuments({ supplierId: sid, supplierStatus: 'pending' });

    const recent = await Order.find({ supplierId: sid })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderId status category delivery.city delivery.date createdAt supplierStatus');

    res.json({
      success: true,
      stats: { total, confirmed, dispatched, delivered },
      performance: { avgRating, ratingCount, earnings },
      pendingPayout,
      pendingAcceptance,
      recent,
    });
  } catch (err) {
    console.error('supplier getDashboard error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/supplier/earnings
const getEarnings = async (req, res) => {
  try {
    const sid = req.supplier._id;
    const orders = await Order.find({ supplierId: sid })
      .select('orderId status category delivery.city createdAt payment.status payment.advanceAmount payment.advancePaidAt supplierPayout quote.amount')
      .sort({ createdAt: -1 });

    const totalEarned = orders.filter(o => o.supplierPayout?.status === 'paid')
      .reduce((s, o) => s + (o.supplierPayout?.amount || 0), 0);
    const totalPending = orders.filter(o => o.payment?.status !== 'none' && o.supplierPayout?.status === 'pending')
      .reduce((s, o) => s + (o.payment?.advanceAmount || 0), 0);

    res.json({ success: true, orders, totalEarned, totalPending });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/supplier/upload-proof  — photo upload for delivery proof
const uploadProof = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const url = `${baseUrl}/uploads/proofs/${req.file.filename}`;
    res.json({ success: true, url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/supplier/profile
const updateProfile = async (req, res) => {
  try {
    const { email, businessName, currentPassword, newPassword } = req.body;
    const supplier = await Supplier.findById(req.supplier._id);

    if (email !== undefined) supplier.email = email;
    if (businessName !== undefined) supplier.businessName = businessName;

    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ success: false, message: 'Current password required' });
      const valid = await supplier.comparePassword(currentPassword);
      if (!valid) return res.status(401).json({ success: false, message: 'Current password is incorrect' });
      supplier.password = await bcrypt.hash(newPassword, 10);
    }

    await supplier.save();
    const { password: _, ...safe } = supplier.toObject();
    res.json({ success: true, supplier: safe });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/supplier/availability
const updateAvailability = async (req, res) => {
  try {
    const { availability } = req.body;
    await Supplier.findByIdAndUpdate(req.supplier._id, { availability });
    res.json({ success: true, availability });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/supplier/orders/:orderId/proof
const submitDeliveryProof = async (req, res) => {
  try {
    const { note, photoUrl } = req.body;
    if (!note) return res.status(400).json({ success: false, message: 'Proof note required' });
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId, supplierId: req.supplier._id },
      { $set: { deliveryProof: { note, photoUrl: photoUrl || '', submittedAt: new Date() } } },
      { new: true, runValidators: false }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/supplier/upcoming — upcoming deliveries for calendar
const getUpcomingDeliveries = async (req, res) => {
  try {
    const orders = await Order.find({
      supplierId: req.supplier._id,
      status: { $in: ['confirmed', 'dispatched'] },
      'delivery.date': { $gte: new Date() },
    }).sort({ 'delivery.date': 1 }).limit(30)
      .select('orderId status category delivery.city delivery.date delivery.slot');
    res.json({ success: true, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/supplier/orders/:orderId/accept
const acceptOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId, supplierId: req.supplier._id, supplierStatus: 'pending' },
      {
        $set: { supplierStatus: 'accepted' },
        $push: { timeline: { status: 'confirmed', note: 'Supplier ne order accept kiya', by: 'supplier', at: new Date() } },
      },
      { new: true, runValidators: false }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found or already responded' });

    const io = req.app.get('io');
    if (io) io.to('admin').emit('order:updated', { orderId: order.orderId, status: order.status });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/supplier/orders/:orderId/decline
const declineOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId, supplierId: req.supplier._id, supplierStatus: 'pending' },
      {
        $set: { supplierId: null, supplierStatus: null, status: 'pending' },
        $push: { timeline: { status: 'pending', note: `Supplier ne decline kiya${reason ? `: ${reason}` : ''}`, by: 'supplier', at: new Date() } },
      },
      { new: true, runValidators: false }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found or already responded' });

    const io = req.app.get('io');
    if (io) io.to('admin').emit('order:updated', { orderId: order.orderId, status: 'pending' });

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getMe, getDashboard, getMyOrders, getOrderById, updateOrderStatus, updateAvailability, updateProfile, submitDeliveryProof, getUpcomingDeliveries, acceptOrder, declineOrder, getEarnings, uploadProof, uploadMiddleware };
