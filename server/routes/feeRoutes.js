const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createFee, getFees, getFeeAnalytics, getFeeByOrder,
  getSupplierPendingFees, updateFeeStatus, updateFee, deleteFee,
} = require('../controllers/feeController');

router.post('/', protect, createFee);
router.get('/', protect, getFees);
router.get('/analytics', protect, getFeeAnalytics);
router.get('/order/:orderId', protect, getFeeByOrder);
router.get('/supplier/:supplierId', protect, getSupplierPendingFees);
router.patch('/:feeId/status', protect, updateFeeStatus);
router.patch('/:feeId', protect, updateFee);
router.delete('/:feeId', protect, deleteFee);

module.exports = router;
