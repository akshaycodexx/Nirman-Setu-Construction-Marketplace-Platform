const PlatformFee = require('../models/PlatformFee');
const Order = require('../models/Order');

// POST /api/admin/fees — set platform fee for an order
const createFee = async (req, res) => {
  try {
    const { orderId, paidBy, amount, note } = req.body;
    if (!orderId || !paidBy || amount == null) {
      return res.status(400).json({ success: false, message: 'orderId, paidBy, amount required' });
    }

    const order = await Order.findById(orderId).populate('supplierId', 'name').populate('customerId', 'name');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const existing = await PlatformFee.findOne({ orderId });
    if (existing) return res.status(409).json({ success: false, message: 'Fee already set for this order', fee: existing });

    let payerId, payerName;
    if (paidBy === 'supplier') {
      if (!order.supplierId) return res.status(400).json({ success: false, message: 'Supplier not assigned to this order yet' });
      payerId = order.supplierId._id;
      payerName = order.supplierId.name;
    } else {
      if (!order.customerId) return res.status(400).json({ success: false, message: 'No registered customer on this order' });
      payerId = order.customerId._id;
      payerName = order.customerId.name || order.customer?.name;
    }

    const fee = await PlatformFee.create({
      orderId: order._id,
      orderRef: order.orderId,
      paidBy,
      payerId,
      payerName,
      amount: Number(amount),
      note: note || '',
      createdBy: req.admin._id,
    });

    res.status(201).json({ success: true, fee });
  } catch (err) {
    console.error('createFee error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/fees — list all fees with optional filters
const getFees = async (req, res) => {
  try {
    const { status, paidBy, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (paidBy) filter.paidBy = paidBy;

    const [fees, total, summary] = await Promise.all([
      PlatformFee.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean(),
      PlatformFee.countDocuments(filter),
      PlatformFee.aggregate([
        { $group: {
          _id: '$status',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        }},
      ]),
    ]);

    const summaryMap = { pending: { total: 0, count: 0 }, paid: { total: 0, count: 0 }, waived: { total: 0, count: 0 } };
    summary.forEach(s => { summaryMap[s._id] = { total: s.total, count: s.count }; });

    res.json({ success: true, fees, total, pages: Math.ceil(total / limit), summary: summaryMap });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/fees/analytics — monthly fee income
const getFeeAnalytics = async (req, res) => {
  try {
    const [monthly, totalCollected, totalPending] = await Promise.all([
      PlatformFee.aggregate([
        { $match: { status: 'paid' } },
        { $group: {
          _id: { year: { $year: '$paidAt' }, month: { $month: '$paidAt' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        }},
        { $sort: { '_id.year': 1, '_id.month': 1 } },
        { $limit: 12 },
      ]),
      PlatformFee.aggregate([{ $match: { status: 'paid' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
      PlatformFee.aggregate([{ $match: { status: 'pending' } }, { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
    ]);

    res.json({
      success: true,
      monthly,
      totalCollected: totalCollected[0]?.total || 0,
      totalPending: totalPending[0]?.total || 0,
      pendingCount: totalPending[0]?.count || 0,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/fees/order/:orderId — fee for a specific order
const getFeeByOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    const fee = await PlatformFee.findOne({ orderId: order._id });
    res.json({ success: true, fee: fee || null });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/admin/fees/supplier/:supplierId — all pending fees for a supplier
const getSupplierPendingFees = async (req, res) => {
  try {
    const fees = await PlatformFee.find({ payerId: req.params.supplierId, paidBy: 'supplier', status: 'pending' })
      .sort({ createdAt: -1 }).lean();
    const pendingTotal = fees.reduce((s, f) => s + f.amount, 0);
    res.json({ success: true, fees, pendingTotal, pendingCount: fees.length });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /api/admin/fees/:feeId/status — mark paid or waive
const updateFeeStatus = async (req, res) => {
  try {
    const { status, waivedReason } = req.body;
    if (!['paid', 'waived'].includes(status)) {
      return res.status(400).json({ success: false, message: 'status must be paid or waived' });
    }
    const fee = await PlatformFee.findById(req.params.feeId);
    if (!fee) return res.status(404).json({ success: false, message: 'Fee not found' });
    if (fee.status !== 'pending') return res.status(400).json({ success: false, message: 'Only pending fees can be updated' });

    fee.status = status;
    if (status === 'paid') fee.paidAt = new Date();
    if (status === 'waived') { fee.waivedAt = new Date(); fee.waivedReason = waivedReason || ''; }
    await fee.save();

    res.json({ success: true, fee });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PATCH /api/admin/fees/:feeId — edit amount or note (only if pending)
const updateFee = async (req, res) => {
  try {
    const { amount, note } = req.body;
    const fee = await PlatformFee.findById(req.params.feeId);
    if (!fee) return res.status(404).json({ success: false, message: 'Fee not found' });
    if (fee.status !== 'pending') return res.status(400).json({ success: false, message: 'Cannot edit paid/waived fee' });

    if (amount != null) fee.amount = Number(amount);
    if (note != null) fee.note = note;
    await fee.save();
    res.json({ success: true, fee });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/admin/fees/:feeId — delete pending fee
const deleteFee = async (req, res) => {
  try {
    const fee = await PlatformFee.findById(req.params.feeId);
    if (!fee) return res.status(404).json({ success: false, message: 'Fee not found' });
    if (fee.status !== 'pending') return res.status(400).json({ success: false, message: 'Only pending fees can be deleted' });
    await fee.deleteOne();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createFee, getFees, getFeeAnalytics, getFeeByOrder, getSupplierPendingFees, updateFeeStatus, updateFee, deleteFee };
