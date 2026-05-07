const SupplierStock = require('../models/SupplierStock');
const Supplier = require('../models/Supplier');

// ─── Supplier endpoints ───────────────────────────────────────────────────────

// GET /api/stock/my
exports.getMyStock = async (req, res) => {
  try {
    const items = await SupplierStock.find({ supplierId: req.supplier._id }).sort({ category: 1, material: 1 });
    res.json({ success: true, stock: items });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/stock
exports.addStock = async (req, res) => {
  try {
    const { material, category, grade, unit, quantity, pricePerUnit, minOrderQty, city, note } = req.body;
    if (!material || !unit || quantity == null || !pricePerUnit || !city) {
      return res.status(400).json({ message: 'material, unit, quantity, pricePerUnit, city required' });
    }
    const item = await SupplierStock.create({
      supplierId: req.supplier._id,
      material, category, grade, unit,
      quantity: Number(quantity),
      pricePerUnit: Number(pricePerUnit),
      minOrderQty: minOrderQty ? Number(minOrderQty) : 1,
      city, note,
    });
    res.status(201).json({ success: true, item });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/stock/:stockId
exports.updateStock = async (req, res) => {
  try {
    const item = await SupplierStock.findOne({ stockId: req.params.stockId, supplierId: req.supplier._id });
    if (!item) return res.status(404).json({ message: 'Stock item nahi mila' });

    const fields = ['material', 'category', 'grade', 'unit', 'quantity', 'pricePerUnit', 'minOrderQty', 'city', 'note', 'isAvailable'];
    fields.forEach(f => { if (req.body[f] !== undefined) item[f] = req.body[f]; });
    await item.save();
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/stock/:stockId
exports.deleteStock = async (req, res) => {
  try {
    const item = await SupplierStock.findOneAndDelete({ stockId: req.params.stockId, supplierId: req.supplier._id });
    if (!item) return res.status(404).json({ message: 'Stock item nahi mila' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/stock/:stockId/toggle
exports.toggleAvailability = async (req, res) => {
  try {
    const item = await SupplierStock.findOne({ stockId: req.params.stockId, supplierId: req.supplier._id });
    if (!item) return res.status(404).json({ message: 'Stock item nahi mila' });
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json({ success: true, item });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Admin endpoints ──────────────────────────────────────────────────────────

// GET /api/admin/stock?category=&city=&supplierId=&available=
exports.adminGetAllStock = async (req, res) => {
  try {
    const { category, city, supplierId, available, q } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (city) filter.city = new RegExp(city, 'i');
    if (supplierId) filter.supplierId = supplierId;
    if (available === 'true') filter.isAvailable = true;
    if (available === 'false') filter.isAvailable = false;
    if (q) filter.material = new RegExp(q, 'i');

    const stock = await SupplierStock.find(filter)
      .populate('supplierId', 'name phone businessName rating verifiedBadge')
      .sort({ isAvailable: -1, material: 1 });

    res.json({ success: true, stock });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/stock/search?material=cement&city=Patna
// Used by AdminOrderDetail to find suppliers who have the ordered material
exports.searchStock = async (req, res) => {
  try {
    const { material, city, category } = req.query;
    const filter = { isAvailable: true };

    if (material) filter.material = new RegExp(material, 'i');
    if (category) filter.category = category;
    if (city) filter.city = new RegExp(city, 'i');

    const stock = await SupplierStock.find(filter)
      .populate('supplierId', 'name phone businessName rating verifiedBadge availability')
      .sort({ pricePerUnit: 1 });

    // Group by supplier
    const bySupplier = {};
    stock.forEach(item => {
      const sid = item.supplierId._id.toString();
      if (!bySupplier[sid]) {
        bySupplier[sid] = { supplier: item.supplierId, items: [] };
      }
      bySupplier[sid].items.push(item);
    });

    res.json({ success: true, results: Object.values(bySupplier) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
