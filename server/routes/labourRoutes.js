const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/labourController');
const customerAuth = require('../middleware/customerAuth');
const { protectSupplier } = require('../middleware/supplierAuth');
const { protect } = require('../middleware/adminAuth');

// ─── CUSTOMER ────────────────────────────────────────────────────────────────
router.post('/request', customerAuth, ctrl.createRequest);
router.get('/my-requests', customerAuth, ctrl.getMyRequests);
router.post('/:quoteId/counter', customerAuth, ctrl.counterOffer);
router.post('/:quoteId/accept', customerAuth, ctrl.acceptQuote);
router.put('/requests/:requestId/cancel', customerAuth, ctrl.cancelRequest);

// ─── SUPPLIER ─────────────────────────────────────────────────────────────────
router.get('/available', protectSupplier, ctrl.getAvailableRequests);
router.post('/requests/:requestId/submit', protectSupplier, ctrl.submitQuote);
router.post('/:quoteId/counter-respond', protectSupplier, ctrl.respondToCounter);
router.get('/supplier/my-quotes', protectSupplier, ctrl.getMyQuotes);

// ─── ADMIN ────────────────────────────────────────────────────────────────────
router.get('/admin/all', protect, ctrl.getAllRequests);

module.exports = router;
