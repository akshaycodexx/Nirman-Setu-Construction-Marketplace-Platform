const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/rateController');
const { protect } = require('../middleware/auth');

// Public
router.get('/', ctrl.getRates);

// Admin
router.get('/admin', protect, ctrl.adminGetRates);
router.post('/admin', protect, ctrl.createRate);
router.post('/admin/seed', protect, ctrl.seedRates);
router.put('/admin/:rateId', protect, ctrl.updateRate);
router.delete('/admin/:rateId', protect, ctrl.deleteRate);

module.exports = router;
