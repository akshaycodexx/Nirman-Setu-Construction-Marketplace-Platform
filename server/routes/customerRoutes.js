const express = require('express');
const router = express.Router();
const customerAuth = require('../middleware/customerAuth');
const {
  register, login, getMe, updateProfile,
  getMyOrders, getOrderById, cancelOrder,
  reviewOrder,
  createPayment, verifyPayment,
} = require('../controllers/customerController');

router.post('/register', register);
router.post('/login', login);
router.get('/me', customerAuth, getMe);
router.patch('/profile', customerAuth, updateProfile);
router.get('/orders', customerAuth, getMyOrders);
router.get('/orders/:orderId', customerAuth, getOrderById);
router.put('/orders/:orderId/cancel', customerAuth, cancelOrder);
router.post('/orders/:orderId/review', customerAuth, reviewOrder);
router.post('/orders/:orderId/payment/create', customerAuth, createPayment);
router.post('/orders/:orderId/payment/verify', customerAuth, verifyPayment);

module.exports = router;
