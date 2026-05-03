const express = require('express');
const router = express.Router();
const customerAuth = require('../middleware/customerAuth');
const {
  register, login, getMe, updateProfile,
  getMyOrders, getOrderById, cancelOrder,
  reviewOrder, raiseComplaint,
  createPayment, verifyPayment,
} = require('../controllers/customerController');
const { getMessages, sendMessage } = require('../controllers/chatController');

router.post('/register', register);
router.post('/login', login);
router.get('/me', customerAuth, getMe);
router.patch('/profile', customerAuth, updateProfile);
router.get('/orders', customerAuth, getMyOrders);
router.get('/orders/:orderId', customerAuth, getOrderById);
router.put('/orders/:orderId/cancel', customerAuth, cancelOrder);
router.post('/orders/:orderId/review', customerAuth, reviewOrder);
router.post('/orders/:orderId/complaint', customerAuth, raiseComplaint);
router.get('/orders/:orderId/messages', customerAuth, getMessages);
router.post('/orders/:orderId/messages', customerAuth, sendMessage);
router.post('/orders/:orderId/payment/create', customerAuth, createPayment);
router.post('/orders/:orderId/payment/verify', customerAuth, verifyPayment);

module.exports = router;
