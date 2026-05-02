const express = require('express');
const { protectSupplier } = require('../middleware/supplierAuth');
const {
  login, getMe, getDashboard,
  getMyOrders, getOrderById, updateOrderStatus, updateAvailability,
} = require('../controllers/supplierController');

const router = express.Router();

router.post('/login', login);
router.get('/me', protectSupplier, getMe);
router.get('/dashboard', protectSupplier, getDashboard);
router.get('/orders', protectSupplier, getMyOrders);
router.get('/orders/:orderId', protectSupplier, getOrderById);
router.put('/orders/:orderId/status', protectSupplier, updateOrderStatus);
router.put('/availability', protectSupplier, updateAvailability);

module.exports = router;
