const MaterialRate = require('../models/MaterialRate');

// GET /api/rates  — public
exports.getRates = async (req, res) => {
  try {
    const { category, city } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (city && city !== 'All Cities') filter.city = { $in: [city, 'All Cities'] };

    const rates = await MaterialRate.find(filter).sort({ category: 1, material: 1 });
    res.json({ success: true, rates });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/rates  — admin (includes inactive)
exports.adminGetRates = async (req, res) => {
  try {
    const rates = await MaterialRate.find().sort({ category: 1, material: 1 });
    res.json({ success: true, rates });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/admin/rates
exports.createRate = async (req, res) => {
  try {
    const { material, grade, unit, minRate, maxRate, category, city, note } = req.body;
    if (!material || !unit || !minRate || !maxRate) {
      return res.status(400).json({ message: 'material, unit, minRate, maxRate required' });
    }
    if (Number(minRate) > Number(maxRate)) {
      return res.status(400).json({ message: 'minRate must be <= maxRate' });
    }
    const rate = await MaterialRate.create({ material, grade, unit, minRate, maxRate, category, city, note });
    res.status(201).json({ success: true, rate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/rates/:rateId
exports.updateRate = async (req, res) => {
  try {
    const { material, grade, unit, minRate, maxRate, category, city, note, isActive } = req.body;
    const rate = await MaterialRate.findOne({ rateId: req.params.rateId });
    if (!rate) return res.status(404).json({ message: 'Rate nahi mila' });

    if (material !== undefined) rate.material = material;
    if (grade !== undefined) rate.grade = grade;
    if (unit !== undefined) rate.unit = unit;
    if (minRate !== undefined) rate.minRate = Number(minRate);
    if (maxRate !== undefined) rate.maxRate = Number(maxRate);
    if (category !== undefined) rate.category = category;
    if (city !== undefined) rate.city = city;
    if (note !== undefined) rate.note = note;
    if (isActive !== undefined) rate.isActive = isActive;

    await rate.save();
    res.json({ success: true, rate });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/admin/rates/:rateId
exports.deleteRate = async (req, res) => {
  try {
    const rate = await MaterialRate.findOneAndDelete({ rateId: req.params.rateId });
    if (!rate) return res.status(404).json({ message: 'Rate nahi mila' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/admin/rates/seed  — seed default rates if none exist
exports.seedRates = async (req, res) => {
  try {
    const count = await MaterialRate.countDocuments();
    if (count > 0) return res.json({ message: `Already ${count} rates exist, skipped seed` });

    const defaults = [
      { material: 'Cement (OPC 53)', grade: 'OPC 53', unit: 'bag (50kg)', minRate: 350, maxRate: 420, category: 'cement' },
      { material: 'Cement (PPC)', grade: 'PPC', unit: 'bag (50kg)', minRate: 320, maxRate: 390, category: 'cement' },
      { material: 'River Sand', grade: '', unit: 'CFT', minRate: 45, maxRate: 65, category: 'sand' },
      { material: 'M-Sand', grade: 'Manufactured', unit: 'CFT', minRate: 35, maxRate: 50, category: 'sand' },
      { material: 'Gitti 20mm', grade: '20mm', unit: 'CFT', minRate: 40, maxRate: 55, category: 'aggregate' },
      { material: 'Gitti 10mm', grade: '10mm', unit: 'CFT', minRate: 42, maxRate: 58, category: 'aggregate' },
      { material: 'TMT Steel Fe500', grade: 'Fe500', unit: 'kg', minRate: 58, maxRate: 72, category: 'steel' },
      { material: 'TMT Steel Fe550', grade: 'Fe550', unit: 'kg', minRate: 62, maxRate: 78, category: 'steel' },
      { material: 'Red Brick', grade: 'Standard', unit: 'piece', minRate: 7, maxRate: 10, category: 'brick' },
      { material: 'Fly Ash Brick', grade: 'Class A', unit: 'piece', minRate: 5, maxRate: 8, category: 'brick' },
      { material: 'JCB / Excavator', grade: '', unit: 'hour', minRate: 900, maxRate: 1400, category: 'equipment' },
      { material: 'Tipper Truck', grade: '10 wheel', unit: 'trip', minRate: 2500, maxRate: 4000, category: 'equipment' },
    ];

    await MaterialRate.insertMany(defaults);
    res.json({ success: true, message: `${defaults.length} default rates seeded` });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
