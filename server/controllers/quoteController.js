const QuoteRequest = require('../models/QuoteRequest');
const Quote = require('../models/Quote');
const Order = require('../models/Order');

// ─── CUSTOMER ────────────────────────────────────────────────────────────────

// POST /api/quotes/request
exports.createRequest = async (req, res) => {
  try {
    const { material, quantity, unit, description, city, pincode, address, requiredBy, budget } = req.body;
    if (!material || !quantity || !unit || !city || !address || !requiredBy) {
      return res.status(400).json({ message: 'Material, quantity, unit, city, address aur requiredBy required hain' });
    }

    const request = await QuoteRequest.create({
      customerId: req.customer._id,
      customerName: req.customer.name,
      customerPhone: req.customer.phone,
      material, quantity, unit, description, city, pincode, address,
      requiredBy: new Date(requiredBy),
      budget,
    });

    const io = req.app.get('io');
    if (io) io.emit('quote:new_request', { requestId: request.requestId, material, city });

    res.status(201).json({ success: true, request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/quotes/my-requests
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await QuoteRequest.find({ customerId: req.customer._id })
      .populate({
        path: 'quotes',
        select: 'quoteId supplierName pricePerUnit totalPrice deliveryDays notes status currentPrice negotiation createdAt',
      })
      .sort({ createdAt: -1 });

    // Auto-mark expired
    const now = new Date();
    for (const r of requests) {
      if (r.status === 'open' && r.expiresAt < now) {
        r.status = 'expired';
        await r.save();
      }
    }

    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/quotes/:quoteId/counter
exports.counterOffer = async (req, res) => {
  try {
    const { price, note } = req.body;
    if (!price || price <= 0) return res.status(400).json({ message: 'Valid price required' });

    const quote = await Quote.findOne({ quoteId: req.params.quoteId });
    if (!quote) return res.status(404).json({ message: 'Quote nahi mila' });

    if (!['active', 'countered'].includes(quote.status)) {
      return res.status(400).json({ message: 'Is quote pe counter nahi ho sakta' });
    }

    const request = await QuoteRequest.findById(quote.requestId);
    if (!request || request.customerId.toString() !== req.customer._id.toString()) {
      return res.status(403).json({ message: 'Aapka request nahi hai' });
    }
    if (request.status !== 'open') {
      return res.status(400).json({ message: 'Request already closed hai' });
    }

    quote.negotiation.push({ by: 'customer', price, note });
    quote.currentPrice = price;
    quote.status = 'countered';
    await quote.save();

    const io = req.app.get('io');
    if (io) io.to(`supplier:${quote.supplierId}`).emit('quote:counter', {
      quoteId: quote.quoteId,
      requestId: request.requestId,
      material: request.material,
      price,
      note,
    });

    res.json({ success: true, quote });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/quotes/:quoteId/accept
exports.acceptQuote = async (req, res) => {
  try {
    const quote = await Quote.findOne({ quoteId: req.params.quoteId });
    if (!quote) return res.status(404).json({ message: 'Quote nahi mila' });

    if (!['active', 'countered'].includes(quote.status)) {
      return res.status(400).json({ message: 'Ye quote accept nahi ho sakta' });
    }

    const request = await QuoteRequest.findById(quote.requestId);
    if (!request || request.customerId.toString() !== req.customer._id.toString()) {
      return res.status(403).json({ message: 'Aapka request nahi hai' });
    }
    if (request.status !== 'open') {
      return res.status(400).json({ message: 'Request already closed hai' });
    }

    // Accept this quote, reject all others
    quote.status = 'accepted';
    await quote.save();

    await Quote.updateMany(
      { requestId: request._id, _id: { $ne: quote._id } },
      { $set: { status: 'rejected' } }
    );

    // Auto-generate orderId
    const orderId = 'NS-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 4).toUpperCase();

    const order = await Order.create({
      orderId,
      category: request.material,
      items: [{ name: request.material, quantity: request.quantity, unit: request.unit }],
      delivery: {
        address: request.address,
        city: request.city,
        pincode: request.pincode || '',
        date: request.requiredBy,
        slot: 'anytime',
      },
      customer: { name: req.customer.name, phone: req.customer.phone, email: req.customer.email || '' },
      customerId: req.customer._id,
      notes: request.description || '',
      status: 'confirmed',
      supplierId: quote.supplierId,
      supplierStatus: 'accepted',
      quote: { amount: quote.currentPrice, breakdown: `₹${quote.pricePerUnit}/${request.unit} × ${request.quantity} ${request.unit}`, sentAt: new Date() },
      payment: { status: 'none' },
      timeline: [{ status: 'confirmed', note: `Quote accept karke order create kiya. Deal price: ₹${quote.currentPrice}`, by: 'customer', at: new Date() }],
    });

    request.status = 'accepted';
    request.acceptedQuoteId = quote._id;
    request.convertedOrderId = orderId;
    await request.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`supplier:${quote.supplierId}`).emit('quote:accepted', {
        quoteId: quote.quoteId,
        orderId,
        material: request.material,
      });
      io.to('admin').emit('order:new', { orderId, category: request.material, status: 'confirmed' });
    }

    res.json({ success: true, orderId, order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/quotes/requests/:requestId/cancel
exports.cancelRequest = async (req, res) => {
  try {
    const request = await QuoteRequest.findOne({ requestId: req.params.requestId, customerId: req.customer._id });
    if (!request) return res.status(404).json({ message: 'Request nahi mila' });
    if (!['open'].includes(request.status)) return res.status(400).json({ message: 'Sirf open requests cancel ho sakti hain' });

    request.status = 'cancelled';
    await request.save();

    await Quote.updateMany({ requestId: request._id }, { $set: { status: 'rejected' } });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── SUPPLIER ─────────────────────────────────────────────────────────────────

// GET /api/quotes/available
exports.getAvailableRequests = async (req, res) => {
  try {
    const { city } = req.query;
    const now = new Date();
    const filter = { status: 'open', expiresAt: { $gt: now } };
    if (city) filter.city = { $regex: city, $options: 'i' };

    const requests = await QuoteRequest.find(filter)
      .select('-customerPhone')
      .sort({ createdAt: -1 })
      .limit(50);

    // Tag which ones this supplier already quoted on
    const myQuotes = await Quote.find({
      supplierId: req.supplier._id,
      requestId: { $in: requests.map(r => r._id) },
    }).select('requestId');

    const myQuotedIds = new Set(myQuotes.map(q => q.requestId.toString()));

    const result = requests.map(r => ({
      ...r.toObject(),
      alreadyQuoted: myQuotedIds.has(r._id.toString()),
    }));

    res.json({ success: true, requests: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/quotes/requests/:requestId/submit
exports.submitQuote = async (req, res) => {
  try {
    const { pricePerUnit, deliveryDays, notes } = req.body;
    if (!pricePerUnit || !deliveryDays) return res.status(400).json({ message: 'PricePerUnit aur deliveryDays required hain' });

    const request = await QuoteRequest.findOne({ requestId: req.params.requestId });
    if (!request) return res.status(404).json({ message: 'Request nahi mila' });
    if (request.status !== 'open') return res.status(400).json({ message: 'Request open nahi hai' });
    if (request.expiresAt < new Date()) return res.status(400).json({ message: 'Request expire ho gayi' });

    const existing = await Quote.findOne({ requestId: request._id, supplierId: req.supplier._id });
    if (existing) return res.status(409).json({ message: 'Aapne already is request pe quote diya hai' });

    const totalPrice = pricePerUnit * request.quantity;

    const quote = await Quote.create({
      requestId: request._id,
      supplierId: req.supplier._id,
      supplierName: req.supplier.name,
      pricePerUnit,
      totalPrice,
      deliveryDays,
      notes,
      currentPrice: totalPrice,
      negotiation: [{ by: 'supplier', price: totalPrice, note: notes || '', at: new Date() }],
    });

    request.quotes.push(quote._id);
    await request.save();

    const io = req.app.get('io');
    if (io) io.to(`customer:${request.customerId}`).emit('quote:submitted', {
      quoteId: quote.quoteId,
      requestId: request.requestId,
      material: request.material,
      supplierName: req.supplier.name,
      totalPrice,
    });

    res.status(201).json({ success: true, quote });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/quotes/:quoteId/counter-respond
exports.respondToCounter = async (req, res) => {
  try {
    const { action, price, note } = req.body;
    if (!['accept', 'reject', 'counter'].includes(action)) {
      return res.status(400).json({ message: 'Action must be accept, reject, or counter' });
    }

    const quote = await Quote.findOne({ quoteId: req.params.quoteId, supplierId: req.supplier._id });
    if (!quote) return res.status(404).json({ message: 'Quote nahi mila' });
    if (quote.status !== 'countered') return res.status(400).json({ message: 'Koi counter nahi hai respond karne ke liye' });

    const request = await QuoteRequest.findById(quote.requestId);

    if (action === 'accept') {
      quote.negotiation.push({ by: 'supplier', price: quote.currentPrice, note: note || 'Counter accept kiya' });
      quote.status = 'active';
    } else if (action === 'reject') {
      quote.status = 'rejected';
    } else {
      if (!price || price <= 0) return res.status(400).json({ message: 'Counter ke liye valid price chahiye' });
      quote.negotiation.push({ by: 'supplier', price, note });
      quote.currentPrice = price;
      quote.status = 'countered';
    }

    await quote.save();

    const io = req.app.get('io');
    if (io) io.to(`customer:${request.customerId}`).emit('quote:counter_response', {
      quoteId: quote.quoteId,
      action,
      price: quote.currentPrice,
      supplierName: req.supplier.name,
    });

    res.json({ success: true, quote });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/quotes/supplier/my-quotes
exports.getMyQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find({ supplierId: req.supplier._id })
      .populate('requestId', 'requestId material quantity unit city address requiredBy status customerName')
      .sort({ createdAt: -1 });
    res.json({ success: true, quotes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────

// GET /api/quotes/admin/all
exports.getAllRequests = async (req, res) => {
  try {
    const { status, page = 1 } = req.query;
    const limit = 20;
    const filter = {};
    if (status) filter.status = status;

    const total = await QuoteRequest.countDocuments(filter);
    const requests = await QuoteRequest.find(filter)
      .populate({ path: 'quotes', select: 'quoteId supplierName totalPrice currentPrice status' })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ success: true, requests, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
