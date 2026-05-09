require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const orderRoutes = require('./routes/orderRoutes');
const adminRoutes = require('./routes/adminRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const customerRoutes = require('./routes/customerRoutes');
const feeRoutes = require('./routes/feeRoutes');
const quoteRoutes = require('./routes/quoteRoutes');
const labourRoutes = require('./routes/labourRoutes');
const projectRoutes = require('./routes/projectRoutes');
const rateRoutes = require('./routes/rateRoutes');
const stockRoutes = require('./routes/stockRoutes');

const app = express();
const httpServer = http.createServer(app);

const isProd = process.env.NODE_ENV === 'production';
const allowedOrigins = isProd
  ? [process.env.CLIENT_URL].filter(Boolean)
  : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', process.env.CLIENT_URL].filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(null, false);
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true,
};

const io = new Server(httpServer, { cors: corsOptions });

// Make io available in controllers via req.app.get('io')
app.set('io', io);

connectDB();

app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(cors(corsOptions));
app.use(express.json());

// Rate limiters
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: 'Too many attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

const orderLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { message: 'Order request limit reached, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/admin/login', authLimiter);
app.use('/api/supplier/login', authLimiter);
app.use('/api/customer/login', authLimiter);
app.use('/api/customer/register', authLimiter);
app.use('/api/orders/request', orderLimiter);

app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/supplier', supplierRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/admin/fees', feeRoutes);
app.use('/api/quotes', quoteRoutes);
app.use('/api/labour', labourRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/rates', rateRoutes);
app.use('/api/stock', stockRoutes);
app.use('/uploads', require('express').static(require('path').join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.get('/api/config', (req, res) => res.json({ supportPhone: process.env.SUPPORT_PHONE || '919876543210' }));

// Serve React frontend in production
if (isProd) {
  const path = require('path');
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));
  app.get('*splat', (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

// Socket.IO connection handling
io.on('connection', (socket) => {
  socket.on('join:admin', () => socket.join('admin'));

  socket.on('join:order', (orderId) => {
    if (orderId) socket.join(`order:${orderId}`);
  });

  socket.on('leave:order', (orderId) => {
    if (orderId) socket.leave(`order:${orderId}`);
  });

  // Supplier joins their personal room for assignment notifications
  socket.on('join:supplier', (supplierId) => {
    if (supplierId) socket.join(`supplier:${supplierId}`);
  });

  socket.on('join:customer', (customerId) => {
    if (customerId) socket.join(`customer:${customerId}`);
  });

  socket.on('disconnect', () => {});
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
