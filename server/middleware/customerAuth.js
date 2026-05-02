const jwt = require('jsonwebtoken');
const Customer = require('../models/Customer');

module.exports = async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'No token' });
  try {
    const decoded = jwt.verify(auth.split(' ')[1], process.env.JWT_SECRET);
    if (decoded.role !== 'customer') return res.status(403).json({ message: 'Forbidden' });
    const customer = await Customer.findById(decoded.id).select('-password');
    if (!customer || !customer.isActive) return res.status(401).json({ message: 'Account not found' });
    req.customer = customer;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
