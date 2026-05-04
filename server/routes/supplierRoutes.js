const express = require('express');
const { protectSupplier } = require('../middleware/supplierAuth');
const {
  register, login, getMe, getDashboard,
  getMyOrders, getOrderById, updateOrderStatus, updateAvailability, updateProfile,
  submitDeliveryProof, getUpcomingDeliveries, acceptOrder, declineOrder,
  getEarnings, uploadProof, uploadMiddleware,
} = require('../controllers/supplierController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protectSupplier, getMe);
router.get('/dashboard', protectSupplier, getDashboard);
router.get('/orders', protectSupplier, getMyOrders);
router.get('/orders/:orderId', protectSupplier, getOrderById);
router.put('/orders/:orderId/status', protectSupplier, updateOrderStatus);
router.put('/orders/:orderId/accept', protectSupplier, acceptOrder);
router.put('/orders/:orderId/decline', protectSupplier, declineOrder);
router.get('/earnings', protectSupplier, getEarnings);
router.post('/upload-proof', protectSupplier, uploadMiddleware, uploadProof);
router.post('/orders/:orderId/proof', protectSupplier, submitDeliveryProof);
router.get('/upcoming', protectSupplier, getUpcomingDeliveries);
router.put('/availability', protectSupplier, updateAvailability);
router.patch('/profile', protectSupplier, updateProfile);

module.exports = router;
