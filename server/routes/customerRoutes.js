const express = require('express');
const router = express.Router();
const customerAuth = require('../middleware/customerAuth');
const {
  register, login, getMe,
  getMyOrders, getOrderById,
  createPayment, verifyPayment,
} = require('../controllers/customerController');

router.post('/register', register);
router.post('/login', login);
router.get('/me', customerAuth, getMe);
router.get('/orders', customerAuth, getMyOrders);
router.get('/orders/:orderId', customerAuth, getOrderById);
router.post('/orders/:orderId/payment/create', customerAuth, createPayment);
router.post('/orders/:orderId/payment/verify', customerAuth, verifyPayment);

module.exports = router;
