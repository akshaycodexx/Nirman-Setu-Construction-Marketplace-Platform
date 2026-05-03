const Message = require('../models/Message');

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ orderId: req.params.orderId }).sort({ createdAt: 1 });
    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ message: 'Message cannot be empty' });

    const from = req.admin ? 'admin' : 'customer';
    const senderName = req.admin
      ? (req.admin.name || 'Nirman Setu')
      : (req.customer.name || 'Customer');

    const msg = await Message.create({
      orderId: req.params.orderId,
      from,
      senderName,
      content: content.trim().slice(0, 1000),
    });

    const io = req.app.get('io');
    if (io) io.to(`order:${req.params.orderId}`).emit('chat:message', msg);

    res.status(201).json({ success: true, message: msg });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
