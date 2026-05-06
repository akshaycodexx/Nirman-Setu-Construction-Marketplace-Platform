const express = require('express');
const router = express.Router();
const customerAuth = require('../middleware/customerAuth');
const { protectSupplier } = require('../middleware/supplierAuth');
const { protect } = require('../middleware/auth');
const {
  createRequest, getMyRequests, counterOffer, acceptQuote, cancelRequest,
  getAvailableRequests, submitQuote, respondToCounter, getMyQuotes,
  getAllRequests,
} = require('../controllers/quoteController');

// Customer routes
router.post('/request', customerAuth, createRequest);
router.get('/my-requests', customerAuth, getMyRequests);
router.post('/:quoteId/counter', customerAuth, counterOffer);
router.post('/:quoteId/accept', customerAuth, acceptQuote);
router.put('/requests/:requestId/cancel', customerAuth, cancelRequest);

// Supplier routes
router.get('/available', protectSupplier, getAvailableRequests);
router.get('/supplier/my-quotes', protectSupplier, getMyQuotes);
router.post('/requests/:requestId/submit', protectSupplier, submitQuote);
router.post('/:quoteId/counter-respond', protectSupplier, respondToCounter);

// Admin routes
router.get('/admin/all', protect, getAllRequests);

module.exports = router;
