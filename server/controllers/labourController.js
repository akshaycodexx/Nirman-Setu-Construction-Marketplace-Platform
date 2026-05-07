const LabourRequest = require('../models/LabourRequest');
const LabourQuote = require('../models/LabourQuote');
const Supplier = require('../models/Supplier');
const notify = require('../utils/notify');

// ─── CUSTOMER ────────────────────────────────────────────────────────────────

// POST /api/labour/request
exports.createRequest = async (req, res) => {
  try {
    const { jobType, jobTitle, description, workersNeeded, estimatedDays, city, address, pincode, startDate, budgetType, budget } = req.body;
    if (!jobType || !jobTitle || !city || !address || !startDate) {
      return res.status(400).json({ message: 'jobType, jobTitle, city, address, startDate required hain' });
    }

    const request = await LabourRequest.create({
      customerId: req.customer._id,
      customerName: req.customer.name,
      customerPhone: req.customer.phone,
      jobType, jobTitle, description,
      workersNeeded: workersNeeded || 1,
      estimatedDays,
      city, address, pincode,
      startDate: new Date(startDate),
      budgetType: budgetType || 'per_day',
      budget,
    });

    const io = req.app.get('io');
    if (io) io.emit('labour:new_request', { requestId: request.requestId, jobType, city });

    res.status(201).json({ success: true, request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/labour/my-requests
exports.getMyRequests = async (req, res) => {
  try {
    const requests = await LabourRequest.find({ customerId: req.customer._id })
      .populate({
        path: 'quotes',
        select: 'quoteId supplierName ratePerDay totalWorkers totalDays totalAmount notes status currentRate negotiation supplierId createdAt',
        populate: { path: 'supplierId', select: 'verifiedBadge' },
      })
      .sort({ createdAt: -1 });

    const now = new Date();
    for (const r of requests) {
      if (r.status === 'open' && r.expiresAt < now) {
        r.status = 'expired';
        await r.save();
      }
    }

    const result = requests.map(r => {
      const obj = r.toObject();
      obj.quotes = obj.quotes.map(q => ({
        ...q,
        verifiedBadge: q.supplierId?.verifiedBadge || false,
        supplierId: q.supplierId?._id || q.supplierId,
      }));
      return obj;
    });

    res.json({ success: true, requests: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/labour/:quoteId/counter
exports.counterOffer = async (req, res) => {
  try {
    const { price, note } = req.body;
    if (!price || price <= 0) return res.status(400).json({ message: 'Valid price required' });

    const quote = await LabourQuote.findOne({ quoteId: req.params.quoteId });
    if (!quote) return res.status(404).json({ message: 'Quote nahi mila' });
    if (!['active', 'countered'].includes(quote.status)) {
      return res.status(400).json({ message: 'Is quote pe counter nahi ho sakta' });
    }

    const request = await LabourRequest.findById(quote.requestId);
    if (!request || request.customerId.toString() !== req.customer._id.toString()) {
      return res.status(403).json({ message: 'Aapka request nahi hai' });
    }
    if (request.status !== 'open') return res.status(400).json({ message: 'Request already closed hai' });

    quote.negotiation.push({ by: 'customer', price, note });
    quote.currentRate = price;
    quote.status = 'countered';
    await quote.save();

    const io = req.app.get('io');
    if (io) io.to(`supplier:${quote.supplierId}`).emit('labour:counter', {
      quoteId: quote.quoteId,
      requestId: request.requestId,
      jobTitle: request.jobTitle,
      price, note,
    });

    // Notify supplier of counter
    const supplier = await Supplier.findById(quote.supplierId).select('phone name').lean();
    if (supplier) {
      notify.onLabourCounter({
        recipientPhone: supplier.phone,
        recipientName: supplier.name,
        counterBy: req.customer.name,
        jobTitle: request.jobTitle,
        newPrice: price,
      });
    }

    res.json({ success: true, quote });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/labour/:quoteId/accept
exports.acceptQuote = async (req, res) => {
  try {
    const quote = await LabourQuote.findOne({ quoteId: req.params.quoteId });
    if (!quote) return res.status(404).json({ message: 'Quote nahi mila' });
    if (!['active', 'countered'].includes(quote.status)) {
      return res.status(400).json({ message: 'Ye quote accept nahi ho sakta' });
    }

    const request = await LabourRequest.findById(quote.requestId);
    if (!request || request.customerId.toString() !== req.customer._id.toString()) {
      return res.status(403).json({ message: 'Aapka request nahi hai' });
    }
    if (request.status !== 'open') return res.status(400).json({ message: 'Request already closed hai' });

    quote.status = 'accepted';
    await quote.save();

    await LabourQuote.updateMany(
      { requestId: request._id, _id: { $ne: quote._id } },
      { $set: { status: 'rejected' } }
    );

    request.status = 'accepted';
    request.acceptedQuoteId = quote._id;
    await request.save();

    const io = req.app.get('io');
    if (io) {
      io.to(`supplier:${quote.supplierId}`).emit('labour:accepted', {
        quoteId: quote.quoteId,
        jobTitle: request.jobTitle,
        city: request.city,
      });
    }

    // Notify supplier: their bid was accepted
    const supplier = await Supplier.findById(quote.supplierId).select('phone email name').lean();
    if (supplier) {
      notify.onLabourAccepted({
        supplierPhone: supplier.phone,
        supplierEmail: supplier.email,
        supplierName: supplier.name,
        customerName: req.customer.name,
        jobTitle: request.jobTitle,
        requestObj: request,
        bidObj: quote,
      });
    }

    // Notify customer with address/contact of supplier (counter-bypassing via platform)
    notify.onLabourCounter({
      recipientPhone: request.customerPhone,
      recipientName: request.customerName,
      counterBy: 'System',
      jobTitle: request.jobTitle,
      newPrice: quote.currentRate,
    });

    res.json({ success: true, quote, request });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/labour/requests/:requestId/cancel
exports.cancelRequest = async (req, res) => {
  try {
    const request = await LabourRequest.findOne({ requestId: req.params.requestId, customerId: req.customer._id });
    if (!request) return res.status(404).json({ message: 'Request nahi mila' });
    if (request.status !== 'open') return res.status(400).json({ message: 'Sirf open requests cancel ho sakti hain' });

    request.status = 'cancelled';
    await request.save();

    await LabourQuote.updateMany({ requestId: request._id }, { $set: { status: 'rejected' } });

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── SUPPLIER ─────────────────────────────────────────────────────────────────

// GET /api/labour/available
exports.getAvailableRequests = async (req, res) => {
  try {
    const { city, jobType } = req.query;
    const now = new Date();
    const filter = { status: 'open', expiresAt: { $gt: now } };
    if (city) filter.city = { $regex: city, $options: 'i' };
    if (jobType) filter.jobType = jobType;

    const requests = await LabourRequest.find(filter)
      .select('-customerPhone')
      .sort({ createdAt: -1 })
      .limit(50);

    const myQuotes = await LabourQuote.find({
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

// POST /api/labour/requests/:requestId/submit
exports.submitQuote = async (req, res) => {
  try {
    const { ratePerDay, totalWorkers, totalDays, notes } = req.body;
    if (!ratePerDay) return res.status(400).json({ message: 'ratePerDay required hai' });

    const request = await LabourRequest.findOne({ requestId: req.params.requestId });
    if (!request) return res.status(404).json({ message: 'Request nahi mila' });
    if (request.status !== 'open') return res.status(400).json({ message: 'Request open nahi hai' });
    if (request.expiresAt < new Date()) return res.status(400).json({ message: 'Request expire ho gayi' });

    const existing = await LabourQuote.findOne({ requestId: request._id, supplierId: req.supplier._id });
    if (existing) return res.status(409).json({ message: 'Aapne already is request pe quote diya hai' });

    const workers = totalWorkers || request.workersNeeded || 1;
    const days = totalDays || request.estimatedDays || 1;
    const totalAmount = ratePerDay * workers * days;

    const quote = await LabourQuote.create({
      requestId: request._id,
      supplierId: req.supplier._id,
      supplierName: req.supplier.name,
      ratePerDay,
      totalWorkers: workers,
      totalDays: days,
      totalAmount,
      notes,
      currentRate: totalAmount,
      negotiation: [{ by: 'supplier', price: totalAmount, note: notes || '', at: new Date() }],
    });

    request.quotes.push(quote._id);
    await request.save();

    const io = req.app.get('io');
    if (io) io.to(`customer:${request.customerId}`).emit('labour:quote_submitted', {
      quoteId: quote.quoteId,
      requestId: request.requestId,
      jobTitle: request.jobTitle,
      supplierName: req.supplier.name,
      totalAmount,
    });

    // Notify customer: labour bid arrived
    const Customer = require('../models/Customer');
    const customer = await Customer.findById(request.customerId).select('phone email name').lean();
    if (customer) {
      notify.onLabourBidReceived({
        customerPhone: customer.phone,
        customerEmail: customer.email,
        customerName: customer.name,
        supplierName: req.supplier.name,
        jobTitle: request.jobTitle,
        amount: totalAmount,
        requestId: request.requestId,
      });
    }

    res.status(201).json({ success: true, quote });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/labour/:quoteId/counter-respond
exports.respondToCounter = async (req, res) => {
  try {
    const { action, price, note } = req.body;
    if (!['accept', 'reject', 'counter'].includes(action)) {
      return res.status(400).json({ message: 'Action must be accept, reject, or counter' });
    }

    const quote = await LabourQuote.findOne({ quoteId: req.params.quoteId, supplierId: req.supplier._id });
    if (!quote) return res.status(404).json({ message: 'Quote nahi mila' });
    if (quote.status !== 'countered') return res.status(400).json({ message: 'Koi counter nahi hai respond karne ke liye' });

    const request = await LabourRequest.findById(quote.requestId);

    if (action === 'accept') {
      quote.negotiation.push({ by: 'supplier', price: quote.currentRate, note: note || 'Counter accept kiya' });
      quote.status = 'active';
    } else if (action === 'reject') {
      quote.status = 'rejected';
    } else {
      if (!price || price <= 0) return res.status(400).json({ message: 'Counter ke liye valid price chahiye' });
      quote.negotiation.push({ by: 'supplier', price, note });
      quote.currentRate = price;
      quote.status = 'countered';
    }

    await quote.save();

    const io = req.app.get('io');
    if (io) io.to(`customer:${request.customerId}`).emit('labour:counter_response', {
      quoteId: quote.quoteId,
      action,
      price: quote.currentRate,
      supplierName: req.supplier.name,
    });

    res.json({ success: true, quote });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/labour/supplier/my-quotes
exports.getMyQuotes = async (req, res) => {
  try {
    const quotes = await LabourQuote.find({ supplierId: req.supplier._id })
      .populate('requestId', 'requestId jobType jobTitle workersNeeded estimatedDays city address startDate status customerName')
      .sort({ createdAt: -1 });
    res.json({ success: true, quotes });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── ADMIN ────────────────────────────────────────────────────────────────────

// GET /api/labour/admin/all
exports.getAllRequests = async (req, res) => {
  try {
    const { status, page = 1 } = req.query;
    const limit = 20;
    const filter = {};
    if (status) filter.status = status;

    const total = await LabourRequest.countDocuments(filter);
    const requests = await LabourRequest.find(filter)
      .populate({ path: 'quotes', select: 'quoteId supplierName ratePerDay totalAmount status' })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ success: true, requests, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
