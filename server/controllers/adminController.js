const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');
const Order = require('../models/Order');
const Supplier = require('../models/Supplier');
const { sendQuoteNotification, sendStatusNotification, sendSupplierAssignment } = require('../utils/mailer');
const { notifyStatusUpdate, notifySupplierAssigned } = require('../utils/whatsapp');
const Customer = require('../models/Customer');

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
    const [total, pending, quoted, confirmed, dispatched, delivered, cancelled, totalCustomers] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'quoted' }),
      Order.countDocuments({ status: 'confirmed' }),
      Order.countDocuments({ status: 'dispatched' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' }),
      Customer.countDocuments(),
    ]);

    // Revenue: sum of advance payments collected
    const revenueResult = await Order.aggregate([
      { $match: { 'payment.status': { $in: ['advance_paid', 'fully_paid'] } } },
      { $group: { _id: null, total: { $sum: '$payment.advanceAmount' } } },
    ]);
    const advanceCollected = revenueResult[0]?.total || 0;

    // Quoted value: sum of all quoted amounts
    const quotedResult = await Order.aggregate([
      { $match: { 'quote.amount': { $exists: true } } },
      { $group: { _id: null, total: { $sum: '$quote.amount' } } },
    ]);
    const totalQuotedValue = quotedResult[0]?.total || 0;

    const recent = await Order.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .select('orderId status category customer.name delivery.city createdAt quote.amount payment.status customerRisk');

    // High-value pending orders (quote >= 25000)
    const highValueOrders = await Order.find({
      'quote.amount': { $gte: 25000 },
      status: { $in: ['pending', 'quoted'] },
    }).sort({ 'quote.amount': -1 }).limit(5)
      .select('orderId status category customer.name delivery.city quote.amount createdAt');

    // Outstanding supplier payouts
    const payableResult = await Order.aggregate([
      { $match: { 'payment.status': { $in: ['advance_paid', 'fully_paid'] }, supplierId: { $ne: null }, 'supplierPayout.status': 'pending' } },
      { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$payment.advanceAmount' } } },
    ]);
    const payableSummary = payableResult[0] || { count: 0, total: 0 };

    // Open complaints
    const openComplaints = await Order.countDocuments({ 'complaint.text': { $exists: true }, 'complaint.status': 'open' });

    // Risk summary: count of yellow + red orders
    const [yellowOrders, redOrders] = await Promise.all([
      Order.countDocuments({ customerRisk: 'yellow', status: { $nin: ['cancelled', 'delivered'] } }),
      Order.countDocuments({ customerRisk: 'red', status: { $nin: ['cancelled', 'delivered'] } }),
    ]);

    // Late deliveries: confirmed/dispatched orders whose delivery date has passed
    const today = new Date(); today.setHours(0,0,0,0);
    const lateOrders = await Order.find({
      status: { $in: ['confirmed', 'dispatched'] },
      'delivery.date': { $lt: today },
    }).select('orderId status category customer.name delivery.city delivery.date').sort({ 'delivery.date': 1 }).limit(10);

    // Supplier-declined orders: pending orders with no supplier where timeline has a decline entry
    const declinedOrders = await Order.find({
      status: 'pending',
      supplierId: null,
      'timeline.note': { $regex: 'decline', $options: 'i' },
    }).select('orderId category customer.name delivery.city').sort({ updatedAt: -1 }).limit(10);

    // Pending supplier self-registrations
    const pendingRegistrations = await Supplier.countDocuments({ selfRegistered: true, kycStatus: 'pending', isActive: false });

    // Platform fee income this month
    const PlatformFee = require('../models/PlatformFee');
    const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
    const [feePending, feeMonthly] = await Promise.all([
      PlatformFee.aggregate([{ $match: { status: 'pending' } }, { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      PlatformFee.aggregate([{ $match: { status: 'paid', paidAt: { $gte: monthStart } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);

    res.json({
      success: true,
      stats: { total, pending, quoted, confirmed, dispatched, delivered, cancelled, totalCustomers },
      revenue: { advanceCollected, totalQuotedValue },
      payable: { count: payableSummary.count, total: payableSummary.total },
      openComplaints,
      recent,
      highValueOrders,
      riskSummary: { yellow: yellowOrders, red: redOrders },
      lateOrders,
      declinedOrders,
      pendingRegistrations,
      platformFees: { pendingTotal: feePending[0]?.total || 0, pendingCount: feePending[0]?.count || 0, monthlyCollected: feeMonthly[0]?.total || 0 },
    });
  } catch (err) {
    console.error('getDashboard error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/orders
const getOrders = async (req, res) => {
  try {
    const { status, category, search, complaints, risk, city, pincode, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (category && category !== 'all') filter.category = category;
    if (risk && risk !== 'all') filter.customerRisk = risk;
    if (city) filter['delivery.city'] = { $regex: city, $options: 'i' };
    if (pincode) filter['delivery.pincode'] = { $regex: pincode, $options: 'i' };
    if (complaints === 'open') {
      filter['complaint.text'] = { $exists: true };
      filter['complaint.status'] = 'open';
    }
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

    // Find suppliers in same city/area for smart matching
    const orderCity = order.delivery?.city;
    let nearbySuppliers = [];
    if (orderCity) {
      nearbySuppliers = await Supplier.find({
        isActive: true,
        kycStatus: 'verified',
        serviceAreas: { $regex: orderCity, $options: 'i' },
      }).select('name phone businessName serviceAreas availability categories').limit(10);
    }

    // Also fetch customer risk info if customerId exists
    let customerInfo = null;
    if (order.customerId) {
      customerInfo = await Customer.findById(order.customerId).select('cancelCount riskLevel totalOrders');
    }

    res.json({ success: true, order, nearbySuppliers, customerInfo });
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

    const setFields = { status };
    if (adminNote !== undefined) setFields.adminNote = adminNote;

    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      {
        $set: setFields,
        $push: { timeline: { status, note: adminNote || '', by: 'admin', at: new Date() } },
      },
      { new: true, runValidators: false }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // When cancelled: increment customer cancel count and update risk level
    if (status === 'cancelled' && order.customerId) {
      const cust = await Customer.findById(order.customerId);
      if (cust) {
        cust.cancelCount = (cust.cancelCount || 0) + 1;
        cust.riskLevel = cust.cancelCount >= 3 ? 'red' : cust.cancelCount === 2 ? 'yellow' : 'green';
        await cust.save();
        // Propagate new risk to all non-cancelled orders from this customer
        await Order.updateMany(
          { customerId: order.customerId, status: { $ne: 'cancelled' } },
          { $set: { customerRisk: cust.riskLevel } }
        );
      }
    }

    sendStatusNotification(order).catch(e => console.error('Status email failed:', e.message));
    notifyStatusUpdate(order);

    const io = req.app.get('io');
    if (io) {
      io.to(`order:${order.orderId}`).emit('order:updated', { orderId: order.orderId, status: order.status, adminNote: order.adminNote });
      io.to('admin').emit('order:updated', { orderId: order.orderId, status: order.status });
    }

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

    // Auto WhatsApp quote to customer
    notifyStatusUpdate(order);

    const io = req.app.get('io');
    if (io) {
      io.to(`order:${order.orderId}`).emit('order:updated', { orderId: order.orderId, status: 'quoted', quoteAmount: order.quote?.amount });
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error('sendQuote error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/admin/orders/:orderId/assign-supplier
const assignSupplier = async (req, res) => {
  try {
    const { supplierId, overrideBlock } = req.body;
    const supplier = await Supplier.findById(supplierId);
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });

    // Check pending platform fees for this supplier
    if (!overrideBlock) {
      const PlatformFee = require('../models/PlatformFee');
      const pendingFees = await PlatformFee.find({ payerId: supplierId, paidBy: 'supplier', status: 'pending' }).lean();
      if (pendingFees.length > 0) {
        const pendingTotal = pendingFees.reduce((s, f) => s + f.amount, 0);
        return res.status(402).json({
          success: false,
          blocked: true,
          pendingCount: pendingFees.length,
          pendingTotal,
          fees: pendingFees,
          message: `Supplier ka ₹${pendingTotal} platform fee pending hai`,
        });
      }
    }

    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      {
        $set: { supplierId, status: 'confirmed', supplierStatus: 'pending' },
        $push: { timeline: { status: 'confirmed', note: 'Supplier assigned — awaiting acceptance', by: 'admin', at: new Date() } },
      },
      { new: true, runValidators: false }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    await order.populate('supplierId', 'name phone businessName');

    sendSupplierAssignment(order, supplier).catch(e => console.error('Supplier email failed:', e.message));
    notifyStatusUpdate(order);
    notifySupplierAssigned(order, supplier);

    const io = req.app.get('io');
    if (io) {
      io.to(`order:${order.orderId}`).emit('order:updated', { orderId: order.orderId, status: 'confirmed' });
      io.to(`supplier:${supplierId}`).emit('supplier:new-order', {
        orderId: order.orderId,
        category: order.category,
        city: order.delivery?.city,
      });
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error('assignSupplier error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/admin/orders/:orderId/payment
const markFullyPaid = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      {
        $set: { 'payment.status': 'fully_paid' },
        $push: { timeline: { status: 'delivered', note: 'Marked as fully paid by admin', by: 'admin', at: new Date() } },
      },
      { new: true, runValidators: false }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    console.error('markFullyPaid error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/orders/export  — CSV download
const exportOrders = async (req, res) => {
  try {
    const { status, category } = req.query;
    const filter = {};
    if (status && status !== 'all') filter.status = status;
    if (category && category !== 'all') filter.category = category;

    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();

    const escape = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const header = ['Order ID', 'Status', 'Category', 'Customer Name', 'Customer Phone', 'City', 'Delivery Date', 'Slot', 'Quote Amount', 'Payment Status', 'Advance Paid', 'Created At'];
    const rows = orders.map(o => [
      o.orderId, o.status, o.category,
      o.customer?.name, o.customer?.phone,
      o.delivery?.city,
      o.delivery?.date ? new Date(o.delivery.date).toLocaleDateString('en-IN') : '',
      o.delivery?.slot,
      o.quote?.amount ?? '',
      o.payment?.status ?? 'none',
      o.payment?.advanceAmount ?? '',
      new Date(o.createdAt).toLocaleDateString('en-IN'),
    ].map(escape).join(','));

    const csv = [header.join(','), ...rows].join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="nirman-setu-orders-${Date.now()}.csv"`);
    res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Supplier Management ──────────────────────────────────────────────────────

// GET /api/admin/suppliers
const getSuppliers = async (req, res) => {
  try {
    const { kycStatus, search, area, availability, selfRegistered, isActive } = req.query;
    const filter = {};
    if (kycStatus && kycStatus !== 'all') filter.kycStatus = kycStatus;
    if (area) filter.serviceAreas = { $regex: area, $options: 'i' };
    if (availability === 'true') filter.availability = true;
    if (availability === 'false') filter.availability = false;
    if (selfRegistered === 'true') filter.selfRegistered = true;
    if (isActive === 'false') filter.isActive = false;
    if (isActive === 'true') filter.isActive = true;
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

// GET /api/admin/suppliers/:id
const getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id).select('-password');
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });

    const [total, confirmed, dispatched, delivered] = await Promise.all([
      Order.countDocuments({ supplierId: supplier._id }),
      Order.countDocuments({ supplierId: supplier._id, status: 'confirmed' }),
      Order.countDocuments({ supplierId: supplier._id, status: 'dispatched' }),
      Order.countDocuments({ supplierId: supplier._id, status: 'delivered' }),
    ]);

    // Rating and earnings aggregation
    const [ratingAgg, earningsAgg] = await Promise.all([
      Order.aggregate([
        { $match: { supplierId: supplier._id, 'review.rating': { $exists: true, $ne: null } } },
        { $group: { _id: null, avg: { $avg: '$review.rating' }, count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $match: { supplierId: supplier._id, 'supplierPayout.status': 'paid' } },
        { $group: { _id: null, total: { $sum: '$supplierPayout.amount' } } },
      ]),
    ]);

    const avgRating = ratingAgg[0]?.avg ? parseFloat(ratingAgg[0].avg.toFixed(1)) : null;
    const ratingCount = ratingAgg[0]?.count || 0;
    const earnings = earningsAgg[0]?.total || 0;

    const recentOrders = await Order.find({ supplierId: supplier._id })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderId status category delivery.city delivery.date createdAt');

    res.json({ success: true, supplier, stats: { total, confirmed, dispatched, delivered, avgRating, ratingCount, earnings }, recentOrders });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/admin/suppliers/:id/reset-password
const resetSupplierPassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier not found' });
    supplier.password = newPassword;
    await supplier.save();
    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/admin/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ success: false, message: 'Both fields required' });
    if (newPassword.length < 6)
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });

    const admin = await Admin.findById(req.admin._id);
    const valid = await admin.comparePassword(currentPassword);
    if (!valid) return res.status(401).json({ success: false, message: 'Current password is incorrect' });

    admin.password = newPassword;
    await admin.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/notifications
const getNotifications = async (req, res) => {
  try {
    const since = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const [newOrders, recentPayments] = await Promise.all([
      Order.find({ status: 'pending', createdAt: { $gte: since } })
        .sort({ createdAt: -1 }).limit(10)
        .select('orderId customer.name category createdAt'),
      Order.find({ 'payment.advancePaidAt': { $gte: since } })
        .sort({ 'payment.advancePaidAt': -1 }).limit(10)
        .select('orderId customer.name payment.status payment.advanceAmount payment.advancePaidAt'),
    ]);
    res.json({ success: true, newOrders, recentPayments, unread: newOrders.length + recentPayments.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /api/admin/orders/:orderId/supplier-payout
const markSupplierPayout = async (req, res) => {
  try {
    const { amount, note } = req.body;
    if (!amount || Number(amount) <= 0) return res.status(400).json({ message: 'Valid amount required' });
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { $set: { supplierPayout: { status: 'paid', amount: Number(amount), paidAt: new Date(), note: note || '' } } },
      { new: true, runValidators: false }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/admin/orders/:orderId/complaint/resolve
const resolveComplaint = async (req, res) => {
  try {
    const { resolution } = req.body;
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { $set: { 'complaint.status': 'resolved', 'complaint.resolution': resolution || '', 'complaint.resolvedAt': new Date() } },
      { new: true, runValidators: false }
    );
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/analytics
const getAnalytics = async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [monthly, categories, cities, topSuppliers] = await Promise.all([
      // Monthly order + revenue breakdown
      Order.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
            orders: { $sum: 1 },
            revenue: {
              $sum: {
                $cond: [
                  { $in: ['$payment.status', ['advance_paid', 'fully_paid']] },
                  { $ifNull: ['$payment.advanceAmount', 0] },
                  0,
                ],
              },
            },
            quoted: { $sum: { $ifNull: ['$quote.amount', 0] } },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),

      // Category breakdown
      Order.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 }, revenue: { $sum: { $ifNull: ['$quote.amount', 0] } } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),

      // City breakdown
      Order.aggregate([
        { $group: { _id: '$delivery.city', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 },
      ]),

      // Top suppliers by delivered orders
      Order.aggregate([
        { $match: { status: 'delivered', supplierId: { $ne: null } } },
        {
          $group: {
            _id: '$supplierId',
            delivered: { $sum: 1 },
            revenue: { $sum: { $ifNull: ['$payment.advanceAmount', 0] } },
          },
        },
        { $sort: { delivered: -1 } },
        { $limit: 5 },
        { $lookup: { from: 'suppliers', localField: '_id', foreignField: '_id', as: 'supplier' } },
        { $unwind: '$supplier' },
        { $project: { delivered: 1, revenue: 1, name: '$supplier.name', businessName: '$supplier.businessName' } },
      ]),
    ]);

    // Profit = quote.amount - supplierPayout.amount for delivered + paid orders
    const profitAgg = await Order.aggregate([
      { $match: { status: 'delivered', 'quote.amount': { $exists: true }, 'supplierPayout.amount': { $exists: true }, 'supplierPayout.status': 'paid' } },
      { $group: { _id: null, totalProfit: { $sum: { $subtract: ['$quote.amount', '$supplierPayout.amount'] } }, count: { $sum: 1 } } },
    ]);
    const PlatformFeeModel = require('../models/PlatformFee');
    const feeIncomeAgg = await PlatformFeeModel.aggregate([
      { $match: { status: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    res.json({
      success: true, monthly, categories, cities, topSuppliers,
      profit: { total: profitAgg[0]?.totalProfit || 0, ordersCount: profitAgg[0]?.count || 0 },
      feeIncome: feeIncomeAgg[0]?.total || 0,
    });
  } catch (err) {
    console.error('getAnalytics error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/complaints
const getComplaints = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { 'complaint.text': { $exists: true, $ne: '' } };
    if (status === 'open') filter['complaint.status'] = 'open';
    if (status === 'resolved') filter['complaint.status'] = 'resolved';

    const orders = await Order.find(filter)
      .select('orderId status category customer delivery complaint supplierId createdAt')
      .populate('supplierId', 'name businessName phone')
      .sort({ 'complaint.raisedAt': -1 })
      .limit(100);

    const [openCount, resolvedCount] = await Promise.all([
      Order.countDocuments({ 'complaint.text': { $exists: true, $ne: '' }, 'complaint.status': 'open' }),
      Order.countDocuments({ 'complaint.text': { $exists: true, $ne: '' }, 'complaint.status': 'resolved' }),
    ]);

    res.json({ success: true, orders, summary: { open: openCount, resolved: resolvedCount } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/payouts
const getPayouts = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {
      supplierId: { $ne: null },
      'payment.status': { $in: ['advance_paid', 'fully_paid'] },
    };
    if (status === 'pending') filter['supplierPayout.status'] = 'pending';
    if (status === 'paid') filter['supplierPayout.status'] = 'paid';

    const orders = await Order.find(filter)
      .populate('supplierId', 'name phone businessName')
      .select('orderId category delivery.city payment.status payment.advanceAmount supplierPayout supplierId createdAt status')
      .sort({ createdAt: -1 });

    // Summary aggregation
    const [pendingAgg, paidAgg] = await Promise.all([
      Order.aggregate([
        { $match: { supplierId: { $ne: null }, 'payment.status': { $in: ['advance_paid', 'fully_paid'] }, 'supplierPayout.status': 'pending' } },
        { $group: { _id: null, count: { $sum: 1 }, total: { $sum: { $ifNull: ['$payment.advanceAmount', 0] } } } },
      ]),
      Order.aggregate([
        { $match: { supplierId: { $ne: null }, 'supplierPayout.status': 'paid' } },
        { $group: { _id: null, count: { $sum: 1 }, total: { $sum: { $ifNull: ['$supplierPayout.amount', 0] } } } },
      ]),
    ]);

    res.json({
      success: true,
      orders,
      summary: {
        pending: { count: pendingAgg[0]?.count || 0, total: pendingAgg[0]?.total || 0 },
        paid: { count: paidAgg[0]?.count || 0, total: paidAgg[0]?.total || 0 },
      },
    });
  } catch (err) {
    console.error('getPayouts error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/customers
const getCustomers = async (req, res) => {
  try {
    const { risk, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (risk && risk !== 'all') filter.riskLevel = risk;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    const total = await Customer.countDocuments(filter);
    const customers = await Customer.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const withStats = await Promise.all(customers.map(async (c) => {
      const [totalOrders, delivered, cancelled] = await Promise.all([
        Order.countDocuments({ customerId: c._id }),
        Order.countDocuments({ customerId: c._id, status: 'delivered' }),
        Order.countDocuments({ customerId: c._id, status: 'cancelled' }),
      ]);
      return { ...c.toObject(), orderStats: { total: totalOrders, delivered, cancelled } };
    }));

    res.json({ success: true, customers: withStats, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error('getCustomers error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/admin/customers/:id/block
const blockCustomer = async (req, res) => {
  try {
    const { isActive } = req.body;
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, customer });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  login, getMe, getDashboard, getOrders, getOrderById, exportOrders, updateStatus, sendQuote,
  assignSupplier, markFullyPaid,
  getSuppliers, createSupplier, getSupplierById, updateSupplierKyc, toggleSupplier,
  resetSupplierPassword, changePassword,
  getNotifications, markSupplierPayout, resolveComplaint,
  getAnalytics, getPayouts, getComplaints,
  getCustomers, blockCustomer,
};
