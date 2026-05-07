const express = require('express');
const { protect } = require('../middleware/auth');
const {
  login, getMe, getDashboard,
  getOrders, getOrderById, exportOrders, updateStatus, sendQuote, assignSupplier, markFullyPaid,
  getNotifications, markSupplierPayout, resolveComplaint,
  getSuppliers, createSupplier, getSupplierById, updateSupplierKyc, toggleSupplier,
  resetSupplierPassword, changePassword,
  getAnalytics, getPayouts, getComplaints,
  getCustomers, blockCustomer,
} = require('../controllers/adminController');
const { getMessages, sendMessage } = require('../controllers/chatController');
const NotificationLog = require('../models/NotificationLog');

const router = express.Router();

// Auth
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

// Dashboard
router.get('/dashboard', protect, getDashboard);
router.get('/notifications', protect, getNotifications);
router.get('/analytics', protect, getAnalytics);
router.get('/payouts', protect, getPayouts);
router.get('/complaints', protect, getComplaints);

// Orders
router.get('/orders', protect, getOrders);
router.get('/orders/export', protect, exportOrders);
router.get('/orders/:orderId', protect, getOrderById);
router.get('/orders/:orderId/messages', protect, getMessages);
router.post('/orders/:orderId/messages', protect, sendMessage);
router.put('/orders/:orderId/status', protect, updateStatus);
router.put('/orders/:orderId/quote', protect, sendQuote);
router.put('/orders/:orderId/assign-supplier', protect, assignSupplier);
router.put('/orders/:orderId/payment', protect, markFullyPaid);
router.patch('/orders/:orderId/supplier-payout', protect, markSupplierPayout);
router.put('/orders/:orderId/complaint/resolve', protect, resolveComplaint);

// Notification Log
router.get('/notification-log', protect, async (req, res) => {
  try {
    const { channel, status, page = 1 } = req.query;
    const limit = 50;
    const filter = {};
    if (channel) filter.channel = channel;
    if (status) filter.status = status;
    const total = await NotificationLog.countDocuments(filter);
    const logs = await NotificationLog.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    res.json({ success: true, logs, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Customers
router.get('/customers', protect, getCustomers);
router.put('/customers/:id/block', protect, blockCustomer);

// Suppliers
router.get('/suppliers', protect, getSuppliers);
router.post('/suppliers', protect, createSupplier);
router.get('/suppliers/:id', protect, getSupplierById);
router.put('/suppliers/:id/kyc', protect, updateSupplierKyc);
router.put('/suppliers/:id/toggle', protect, toggleSupplier);
router.put('/suppliers/:id/reset-password', protect, resetSupplierPassword);

module.exports = router;
