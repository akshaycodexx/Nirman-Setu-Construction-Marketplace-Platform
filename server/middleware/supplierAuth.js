const jwt = require('jsonwebtoken');
const Supplier = require('../models/Supplier');

const protectSupplier = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer '))
    return res.status(401).json({ success: false, message: 'Not authorized' });

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'supplier')
      return res.status(403).json({ success: false, message: 'Supplier access required' });

    const supplier = await Supplier.findById(decoded.id).select('-password');
    if (!supplier || !supplier.isActive)
      return res.status(401).json({ success: false, message: 'Not authorized' });

    req.supplier = supplier;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
};

module.exports = { protectSupplier };
