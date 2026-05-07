const Project = require('../models/Project');
const Order = require('../models/Order');
const LabourRequest = require('../models/LabourRequest');

// POST /api/projects
exports.createProject = async (req, res) => {
  try {
    const { name, description, city, address, estimatedBudget, notes } = req.body;
    if (!name) return res.status(400).json({ message: 'Project name required hai' });

    const project = await Project.create({
      customerId: req.customer._id,
      name, description, city, address,
      estimatedBudget: estimatedBudget || null,
      notes,
    });

    res.status(201).json({ success: true, project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/projects
exports.getMyProjects = async (req, res) => {
  try {
    const projects = await Project.find({ customerId: req.customer._id }).sort({ createdAt: -1 });

    // Enrich each project with spent + status counts
    const result = await Promise.all(projects.map(async (p) => {
      const obj = p.toObject();

      const orderIds = p.linkedOrders.map(lo => lo.orderId);
      const labourIds = p.linkedLabour.map(ll => ll.requestId);

      const orders = orderIds.length
        ? await Order.find({ orderId: { $in: orderIds } }).select('orderId status payment quote category').lean()
        : [];

      const labourRequests = labourIds.length
        ? await LabourRequest.find({ requestId: { $in: labourIds } }).select('requestId status jobTitle jobType acceptedQuoteId').lean()
        : [];

      const totalSpent = orders.reduce((s, o) => s + (o.payment?.advanceAmount || 0), 0);
      const totalQuoted = orders.reduce((s, o) => s + (o.quote?.amount || 0), 0);
      const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;

      obj._ordersCount = orders.length;
      obj._labourCount = labourRequests.length;
      obj._totalSpent = totalSpent;
      obj._totalQuoted = totalQuoted;
      obj._activeOrders = activeOrders;

      return obj;
    }));

    res.json({ success: true, projects: result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/projects/:projectId
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findOne({ projectId: req.params.projectId, customerId: req.customer._id });
    if (!project) return res.status(404).json({ message: 'Project nahi mila' });

    const orderIds = project.linkedOrders.map(lo => lo.orderId);
    const labourIds = project.linkedLabour.map(ll => ll.requestId);

    const [orders, labourRequests] = await Promise.all([
      orderIds.length
        ? Order.find({ orderId: { $in: orderIds } })
            .select('orderId status payment quote category items delivery timeline createdAt')
            .lean()
        : [],
      labourIds.length
        ? LabourRequest.find({ requestId: { $in: labourIds } })
            .populate({ path: 'quotes', select: 'currentRate status supplierName', match: { status: 'accepted' } })
            .select('requestId status jobType jobTitle city startDate workersNeeded estimatedDays acceptedQuoteId quotes createdAt')
            .lean()
        : [],
    ]);

    const totalSpent = orders.reduce((s, o) => s + (o.payment?.advanceAmount || 0), 0);
    const totalQuoted = orders.reduce((s, o) => s + (o.quote?.amount || 0), 0);
    const labourBooked = labourRequests.filter(l => l.status === 'accepted');
    const labourTotal = labourBooked.reduce((s, l) => {
      const accepted = l.quotes?.find(q => q.status === 'accepted');
      return s + (accepted?.currentRate || 0);
    }, 0);

    res.json({
      success: true,
      project: project.toObject(),
      orders,
      labourRequests,
      summary: {
        totalSpent,
        totalQuoted,
        labourTotal,
        grandTotal: totalQuoted + labourTotal,
        ordersCount: orders.length,
        labourCount: labourRequests.length,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/projects/:projectId
exports.updateProject = async (req, res) => {
  try {
    const { name, description, city, address, estimatedBudget, notes, status } = req.body;
    const project = await Project.findOne({ projectId: req.params.projectId, customerId: req.customer._id });
    if (!project) return res.status(404).json({ message: 'Project nahi mila' });

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (city !== undefined) project.city = city;
    if (address !== undefined) project.address = address;
    if (estimatedBudget !== undefined) project.estimatedBudget = estimatedBudget;
    if (notes !== undefined) project.notes = notes;
    if (status) project.status = status;

    await project.save();
    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/projects/:projectId/link-order
exports.linkOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    if (!orderId) return res.status(400).json({ message: 'orderId required' });

    const order = await Order.findOne({ orderId, customerId: req.customer._id }).select('orderId');
    if (!order) return res.status(404).json({ message: 'Order nahi mila ya aapka nahi hai' });

    const project = await Project.findOne({ projectId: req.params.projectId, customerId: req.customer._id });
    if (!project) return res.status(404).json({ message: 'Project nahi mila' });

    const alreadyLinked = project.linkedOrders.some(lo => lo.orderId === orderId);
    if (alreadyLinked) return res.status(409).json({ message: 'Order already linked hai' });

    project.linkedOrders.push({ orderId });
    await project.save();

    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/projects/:projectId/unlink-order
exports.unlinkOrder = async (req, res) => {
  try {
    const { orderId } = req.body;
    const project = await Project.findOne({ projectId: req.params.projectId, customerId: req.customer._id });
    if (!project) return res.status(404).json({ message: 'Project nahi mila' });

    project.linkedOrders = project.linkedOrders.filter(lo => lo.orderId !== orderId);
    await project.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/projects/:projectId/link-labour
exports.linkLabour = async (req, res) => {
  try {
    const { requestId } = req.body;
    if (!requestId) return res.status(400).json({ message: 'requestId required' });

    const labour = await LabourRequest.findOne({ requestId, customerId: req.customer._id }).select('requestId');
    if (!labour) return res.status(404).json({ message: 'Labour request nahi mila' });

    const project = await Project.findOne({ projectId: req.params.projectId, customerId: req.customer._id });
    if (!project) return res.status(404).json({ message: 'Project nahi mila' });

    const alreadyLinked = project.linkedLabour.some(ll => ll.requestId === requestId);
    if (alreadyLinked) return res.status(409).json({ message: 'Labour request already linked hai' });

    project.linkedLabour.push({ requestId });
    await project.save();

    res.json({ success: true, project });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/projects/:projectId/unlink-labour
exports.unlinkLabour = async (req, res) => {
  try {
    const { requestId } = req.body;
    const project = await Project.findOne({ projectId: req.params.projectId, customerId: req.customer._id });
    if (!project) return res.status(404).json({ message: 'Project nahi mila' });

    project.linkedLabour = project.linkedLabour.filter(ll => ll.requestId !== requestId);
    await project.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/projects/:projectId
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findOneAndDelete({ projectId: req.params.projectId, customerId: req.customer._id });
    if (!project) return res.status(404).json({ message: 'Project nahi mila' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
