const express = require('express');
const { protectSupplier } = require('../middleware/supplierAuth');
const {
  login, getMe, getDashboard,
  getMyOrders, getOrderById, updateOrderStatus, updateAvailability, updateProfile,
  submitDeliveryProof, getUpcomingDeliveries, acceptOrder, declineOrder,
} = require('../controllers/supplierController');

const router = express.Router();

router.post('/login', login);
router.get('/me', protectSupplier, getMe);
router.get('/dashboard', protectSupplier, getDashboard);
router.get('/orders', protectSupplier, getMyOrders);
router.get('/orders/:orderId', protectSupplier, getOrderById);
router.put('/orders/:orderId/status', protectSupplier, updateOrderStatus);
router.put('/orders/:orderId/accept', protectSupplier, acceptOrder);
router.put('/orders/:orderId/decline', protectSupplier, declineOrder);
router.post('/orders/:orderId/proof', protectSupplier, submitDeliveryProof);
router.get('/upcoming', protectSupplier, getUpcomingDeliveries);
router.put('/availability', protectSupplier, updateAvailability);
router.patch('/profile', protectSupplier, updateProfile);

module.exports = router;
