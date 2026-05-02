const express = require('express');
const { body, validationResult } = require('express-validator');
const { createOrder, trackOrder } = require('../controllers/orderController');

const router = express.Router();

const validateOrder = [
  body('category').isIn(['material', 'transport', 'equipment']).withMessage('Invalid category'),
  body('items').isArray({ min: 1 }).withMessage('At least one item required'),
  body('items.*.name').notEmpty().withMessage('Item name required'),
  body('items.*.quantity').isNumeric({ min: 1 }).withMessage('Valid quantity required'),
  body('items.*.unit').notEmpty().withMessage('Unit required'),
  body('delivery.address').notEmpty().withMessage('Delivery address required'),
  body('delivery.city').notEmpty().withMessage('City required'),
  body('delivery.date').isISO8601().withMessage('Valid delivery date required'),
  body('customer.name').notEmpty().withMessage('Name required'),
  body('customer.phone')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Valid 10-digit Indian phone number required'),
];

const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

router.post('/request', validateOrder, handleValidation, createOrder);
router.get('/track/:orderId', trackOrder);

module.exports = router;
