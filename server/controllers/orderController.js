const jwt = require('jsonwebtoken');
const Order = require('../models/Order');
const { sendAdminNotification } = require('../utils/mailer');
const { notifyNewOrder } = require('../utils/whatsapp');

const createOrder = async (req, res) => {
  try {
    const { category, items, delivery, customer, notes } = req.body;

    const count = await Order.countDocuments();
    const year = new Date().getFullYear();
    const orderId = `NS-${year}-${String(count + 1).padStart(4, '0')}`;

    // Optionally link to customer account if JWT present
    let customerId = null;
    const auth = req.headers.authorization;
    if (auth && auth.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
        if (decoded.role === 'customer') customerId = decoded.id;
      } catch {}
    }

    const order = new Order({ orderId, category, items, delivery, customer, notes, customerId });
    await order.save();

    // notify admin — fire and forget
    sendAdminNotification(order).catch(err =>
      console.error('Email notification failed:', err.message)
    );

    // WhatsApp confirmation to customer
    notifyNewOrder(order);

    // Real-time alert to admin panel
    const io = req.app.get('io');
    if (io) {
      io.to('admin').emit('order:new', {
        orderId: order.orderId,
        customerName: order.customer?.name,
        category: order.category,
        city: order.delivery?.city,
        createdAt: order.createdAt,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Order request submitted successfully',
      orderId: order.orderId,
    });
  } catch (err) {
    console.error('createOrder error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const trackOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ orderId }).select(
      'orderId status category items delivery.date delivery.slot customer.name createdAt quote adminNote'
    );

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error('trackOrder error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createOrder, trackOrder };
