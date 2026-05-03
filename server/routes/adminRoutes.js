const express = require('express');
const { protect } = require('../middleware/auth');
const {
  login, getMe, getDashboard,
  getOrders, getOrderById, exportOrders, updateStatus, sendQuote, assignSupplier, markFullyPaid,
  getSuppliers, createSupplier, updateSupplierKyc, toggleSupplier,
} = require('../controllers/adminController');

const router = express.Router();

// Auth
router.post('/login', login);
router.get('/me', protect, getMe);

// Dashboard
router.get('/dashboard', protect, getDashboard);

// Orders
router.get('/orders', protect, getOrders);
router.get('/orders/export', protect, exportOrders);
router.get('/orders/:orderId', protect, getOrderById);
router.put('/orders/:orderId/status', protect, updateStatus);
router.put('/orders/:orderId/quote', protect, sendQuote);
router.put('/orders/:orderId/assign-supplier', protect, assignSupplier);
router.put('/orders/:orderId/payment', protect, markFullyPaid);

// Suppliers
router.get('/suppliers', protect, getSuppliers);
router.post('/suppliers', protect, createSupplier);
router.put('/suppliers/:id/kyc', protect, updateSupplierKyc);
router.put('/suppliers/:id/toggle', protect, toggleSupplier);

module.exports = router;
