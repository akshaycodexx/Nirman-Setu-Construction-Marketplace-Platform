const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/stockController');
const { protectSupplier } = require('../middleware/supplierAuth');
const { protect } = require('../middleware/auth');

// Supplier
router.get('/my', protectSupplier, ctrl.getMyStock);
router.post('/', protectSupplier, ctrl.addStock);
router.put('/:stockId', protectSupplier, ctrl.updateStock);
router.delete('/:stockId', protectSupplier, ctrl.deleteStock);
router.patch('/:stockId/toggle', protectSupplier, ctrl.toggleAvailability);

// Admin
router.get('/admin/all', protect, ctrl.adminGetAllStock);
router.get('/admin/search', protect, ctrl.searchStock);

module.exports = router;
