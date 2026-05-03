const express = require('express');
const { protect } = require('../middleware/auth');
const {
  login, getMe, getDashboard,
  getOrders, getOrderById, exportOrders, updateStatus, sendQuote, assignSupplier, markFullyPaid,
  getNotifications, markSupplierPayout,
  getSuppliers, createSupplier, getSupplierById, updateSupplierKyc, toggleSupplier,
  resetSupplierPassword, changePassword,
} = require('../controllers/adminController');
const { getMessages, sendMessage } = require('../controllers/chatController');

const router = express.Router();

// Auth
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/change-password', protect, changePassword);

// Dashboard
router.get('/dashboard', protect, getDashboard);
router.get('/notifications', protect, getNotifications);

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

// Suppliers
router.get('/suppliers', protect, getSuppliers);
router.post('/suppliers', protect, createSupplier);
router.get('/suppliers/:id', protect, getSupplierById);
router.put('/suppliers/:id/kyc', protect, updateSupplierKyc);
router.put('/suppliers/:id/toggle', protect, toggleSupplier);
router.put('/suppliers/:id/reset-password', protect, resetSupplierPassword);

module.exports = router;
