# Nirman Setu — Construction Marketplace Platform

> **Aggregator + Broker + Manager platform for the Indian construction industry.**
> Customer demand lo → Supplier se negotiate karo → Margin rakho → Deliver karwao.

---

## Table of Contents

- [Overview](#overview)
- [Business Model](#business-model)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Features](#features)
- [Project Structure](#project-structure)
- [API Reference](#api-reference)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Schema](#database-schema)
- [Real-time Events (Socket.IO)](#real-time-events-socketio)
- [Security](#security)
- [Development Log](#development-log)

---

## Overview

Nirman Setu is a **full-stack construction aggregator platform** built on the MERN stack. It connects construction material buyers (customers) with verified suppliers through an admin-managed broker model. The platform handles the entire order lifecycle — from requirement submission to delivery, payment, and dispute resolution — while keeping both parties on-platform to prevent bypass.

**Three portals, one backend:**

| Portal | URL | Auth | Color |
|--------|-----|------|-------|
| Customer | `/customer/*` | JWT (Bearer) | Blue |
| Supplier | `/supplier/*` | JWT (Bearer) | Green |
| Admin | `/admin/*` | JWT (Bearer) | Orange |

---

## Business Model

```
Customer → Places requirement
Admin    → Reviews, quotes price (with margin), sends quote
Customer → Pays 30% advance via Razorpay
Admin    → Assigns verified supplier (supplier sees net price, not customer price)
Supplier → Dispatches → Delivers
Admin    → Marks supplier paid (separate from customer payment)
Customer → Reviews, raises complaints if any
```

**Revenue Streams:**
1. **Margin** — Customer pays market price; supplier gets lower; admin keeps the spread
2. **Service Fee** — Platform fee per order (configurable)
3. **Supplier Subscription** — Premium listing for suppliers (future)
4. **Urgent Surcharge** — Rush delivery pricing

**Anti-Bypass Design:** Customer and supplier never see each other's contact. All communication flows through the platform's in-app chat. WhatsApp notifications use admin-controlled templates.

---

## Tech Stack

### Backend
| Package | Version | Purpose |
|---------|---------|---------|
| Node.js + Express 5 | `^5.2.1` | REST API server |
| MongoDB + Mongoose 9 | `^9.6.1` | Database + ODM |
| Socket.IO | `^4.8.3` | Real-time events |
| JSON Web Token | `^9.0.3` | Auth (3 separate secrets/roles) |
| bcryptjs | `^3.0.3` | Password hashing |
| Razorpay | `^2.9.6` | Payment gateway (advance collection) |
| Nodemailer | `^8.0.7` | Email notifications (Gmail SMTP) |
| Helmet | `^8.1.0` | HTTP security headers |
| express-rate-limit | `^8.4.1` | Rate limiting (auth + order endpoints) |
| express-validator | `^7.3.2` | Input validation |
| dotenv | `^17.4.2` | Environment config |

### Frontend
| Package | Version | Purpose |
|---------|---------|---------|
| React 19 + Vite 8 | `^19.2.5` | UI framework + build tool |
| React Router v7 | `^7.14.2` | Client-side routing |
| Axios | `^1.15.2` | HTTP client |
| Tailwind CSS v4 | `^4.2.4` | Utility-first styling |
| Socket.IO Client | `^4.8.3` | Real-time subscriptions |
| Lucide React | `^1.14.0` | Icon library |
| React Hot Toast | `^2.6.0` | Toast notifications |

---

## Architecture

```
nirman-setu/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── context/         # AdminContext, CustomerContext, SupplierContext, SocketContext
│       ├── components/      # AdminLayout, CustomerLayout, SupplierLayout, ChatPanel, WhatsAppButton
│       └── pages/
│           ├── admin/       # Dashboard, Orders, OrderDetail, Suppliers, Settings
│           ├── customer/    # Dashboard, Orders, OrderDetail, Profile, Register, Login
│           ├── supplier/    # Dashboard, Orders, OrderDetail, Profile, Login
│           ├── RequestOrder.jsx   # 21-category order form (public)
│           ├── TrackOrder.jsx     # Guest order tracking (public)
│           └── Receipt.jsx        # Printable receipt (dual-auth: customer + admin)
│
└── server/                  # Node + Express backend
    ├── config/              # MongoDB connection
    ├── controllers/         # Business logic (admin, customer, supplier, order, chat)
    ├── middleware/          # auth.js, customerAuth.js, supplierAuth.js
    ├── models/              # Admin, Customer, Supplier, Order, Message
    ├── routes/              # adminRoutes, customerRoutes, supplierRoutes, orderRoutes
    └── utils/               # mailer.js, whatsapp.js, razorpay.js
```

**Request flow:**
```
Browser → Vite Dev Server (proxy) → Express API → Mongoose → MongoDB
                                              ↕
                                         Socket.IO (ws://)
```

---

## Features

### Customer Portal
- **Registration & Login** — JWT auth with profile management
- **Order Request** — 21 construction categories with 150+ items; per-item measurement units (Bag, Ton, CFT, Brass, Piece, Day, etc.)
- **Real-time Order Tracking** — Status progress bar; live updates via Socket.IO (no page refresh)
- **Razorpay Payment** — 30% advance payment; signature verification
- **Printable Receipt** — Professional PDF-ready receipt with company branding
- **In-App Chat** — Direct messaging with Nirman Setu support per order
- **Reviews** — 5-star rating + comment after delivery (1 review per order)
- **Complaints** — Raise dispute on any active/delivered order; see admin resolution
- **Order History** — Status filter tabs (All / Pending / Quoted / Confirmed / Dispatched / Delivered / Cancelled)
- **Order Cancellation** — Self-cancel while in pending status

### Admin Portal
- **Dashboard** — Revenue cards (Advance Collected, Quoted Value, Total Orders, Customers, Supplier Payable), status grid with click-to-filter, open complaints alert banner, real-time new order toast
- **Order Management** — Full order list with search, status filter, category filter, complaints filter; CSV export (auth-aware fetch)
- **Order Detail** — Send quote (amount + breakdown), update status, assign verified supplier, mark payment, in-app chat, customer review display, complaint resolution, supplier payout tracker
- **Supplier Management** — Add suppliers, KYC verification, activate/deactivate, view supplier profile with stats, reset password
- **Notification Bell** — Polls every 60s for new orders + recent payments; unread count badge
- **Settings** — Change admin password; account info

### Supplier Portal
- **Dashboard** — Order stats (Total / To Dispatch / In Transit / Delivered), Performance stats (Avg Rating / Total Earnings), recent orders list, availability toggle
- **Order Detail** — View assigned orders, update dispatch/delivery status with notes, real-time socket updates
- **Real-time Assignment Notification** — Instant toast when admin assigns a new order (Socket.IO)
- **Profile** — Update email/business name, change password, KYC status display

### Platform Features
- **WhatsApp Business API** — Automated notifications for order received, quote ready, confirmed, dispatched, delivered, cancelled (Meta Cloud API templates)
- **Email Notifications** — Order confirmation, quote notification, payment confirmation, status updates (Nodemailer / Gmail SMTP)
- **In-App Masked Chat** — Customer ↔ Admin per-order messaging; supplier never sees customer contact
- **Receipt / Invoice** — Printable page accessible to both customer and admin; company branding, payment summary
- **Guest Order Tracking** — Track order by ID (no login required)
- **21 Construction Categories** — basic_materials, structural, wood_carpentry, chemicals, paint_finishing, flooring_tiling, doors_windows, interior_furniture, electrical, plumbing_sanitary, machinery, transport, labour, contractors, design_planning, shuttering, water_utilities, smart_features, complete_services, commercial, support_services

---

## Project Structure

```
server/
├── models/
│   ├── Admin.js          # Admin auth model
│   ├── Customer.js       # Customer auth + profile
│   ├── Supplier.js       # Supplier profile + KYC + availability
│   ├── Order.js          # Full order lifecycle (items, quote, payment, review, complaint, payout)
│   └── Message.js        # In-app chat messages (per orderId)
│
├── controllers/
│   ├── adminController.js    # All admin operations
│   ├── customerController.js # Customer operations
│   ├── supplierController.js # Supplier operations
│   ├── orderController.js    # Public order submission
│   └── chatController.js     # In-app chat (get + send)
│
└── utils/
    ├── mailer.js      # Nodemailer email templates
    ├── whatsapp.js    # Meta WhatsApp Cloud API templates
    └── razorpay.js    # Razorpay order creation + signature verify
```

---

## API Reference

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/orders/request` | Submit new order (rate limited: 10/hr) |
| `GET` | `/api/orders/track/:orderId` | Guest order tracking |
| `GET` | `/api/health` | Server health check |

### Customer (`/api/customer`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/register` | — | Register customer |
| `POST` | `/login` | — | Login (rate limited) |
| `GET` | `/me` | ✓ | Get profile |
| `PATCH` | `/profile` | ✓ | Update profile |
| `GET` | `/orders` | ✓ | List my orders |
| `GET` | `/orders/:orderId` | ✓ | Order detail |
| `PUT` | `/orders/:orderId/cancel` | ✓ | Cancel pending order |
| `POST` | `/orders/:orderId/review` | ✓ | Submit review (delivered only) |
| `POST` | `/orders/:orderId/complaint` | ✓ | Raise complaint |
| `GET` | `/orders/:orderId/messages` | ✓ | Get chat messages |
| `POST` | `/orders/:orderId/messages` | ✓ | Send chat message |
| `POST` | `/orders/:orderId/payment/create` | ✓ | Create Razorpay order |
| `POST` | `/orders/:orderId/payment/verify` | ✓ | Verify payment signature |

### Admin (`/api/admin`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/login` | — | Admin login (rate limited) |
| `GET` | `/me` | ✓ | Get admin profile |
| `PUT` | `/change-password` | ✓ | Change password |
| `GET` | `/dashboard` | ✓ | Dashboard stats |
| `GET` | `/notifications` | ✓ | Bell notifications (last 48h) |
| `GET` | `/orders` | ✓ | List orders (filter: status, category, complaints, search) |
| `GET` | `/orders/export` | ✓ | CSV export |
| `GET` | `/orders/:orderId` | ✓ | Order detail |
| `GET` | `/orders/:orderId/messages` | ✓ | Get chat messages |
| `POST` | `/orders/:orderId/messages` | ✓ | Reply to customer |
| `PUT` | `/orders/:orderId/status` | ✓ | Update status |
| `PUT` | `/orders/:orderId/quote` | ✓ | Send quote |
| `PUT` | `/orders/:orderId/assign-supplier` | ✓ | Assign supplier |
| `PUT` | `/orders/:orderId/payment` | ✓ | Mark fully paid |
| `PUT` | `/orders/:orderId/complaint/resolve` | ✓ | Resolve complaint |
| `PATCH` | `/orders/:orderId/supplier-payout` | ✓ | Mark supplier paid |
| `GET` | `/suppliers` | ✓ | List suppliers |
| `POST` | `/suppliers` | ✓ | Add supplier |
| `GET` | `/suppliers/:id` | ✓ | Supplier detail + stats |
| `PUT` | `/suppliers/:id/kyc` | ✓ | Update KYC status |
| `PUT` | `/suppliers/:id/toggle` | ✓ | Activate/deactivate |
| `PUT` | `/suppliers/:id/reset-password` | ✓ | Reset supplier password |

### Supplier (`/api/supplier`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/login` | — | Supplier login (rate limited) |
| `GET` | `/me` | ✓ | Get profile |
| `GET` | `/dashboard` | ✓ | Stats + performance + recent orders |
| `GET` | `/orders` | ✓ | My assigned orders |
| `GET` | `/orders/:orderId` | ✓ | Order detail |
| `PUT` | `/orders/:orderId/status` | ✓ | Update dispatch/delivery status |
| `PUT` | `/availability` | ✓ | Toggle availability |
| `PATCH` | `/profile` | ✓ | Update email/business name/password |

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Razorpay account (test keys for dev)
- Gmail account with App Password (for email notifications)
- Meta Developer account (optional — for WhatsApp notifications)

### Installation

```bash
# Clone the repo
git clone https://github.com/akshaycodex/nirman-setu.git
cd nirman-setu

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### Environment Setup

```bash
# Copy example env
cp server/.env.example server/.env
# Edit server/.env with your credentials (see Environment Variables section)
```

### Create Admin Account

```bash
cd server
node scripts/createAdmin.js
# Follow the prompts to set admin email + password
```

### Run in Development

```bash
# Terminal 1 — backend (port 5000)
cd server
npm run dev

# Terminal 2 — frontend (port 5173)
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

| Route | Description |
|-------|-------------|
| `/` | Home / landing page |
| `/request` | Place a new order |
| `/track` | Track an order |
| `/customer/login` | Customer login |
| `/admin/login` | Admin login |
| `/supplier/login` | Supplier login |

### Build for Production

```bash
cd client
npm run build
# Outputs to client/dist — serve via nginx or express static
```

---

## Environment Variables

Create `server/.env`:

```env
# Server
PORT=5000
MONGO_URI=mongodb://localhost:27017/nirman-setu
CLIENT_URL=http://localhost:5173

# JWT
JWT_SECRET=your_super_secret_key_here
CUSTOMER_JWT_SECRET=customer_secret_key_here
SUPPLIER_JWT_SECRET=supplier_secret_key_here

# Razorpay (get from dashboard.razorpay.com)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Gmail SMTP
# Enable 2FA on Gmail → My Account → Security → App Passwords → Generate
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=xxxx_xxxx_xxxx_xxxx    # 16-char App Password
ADMIN_EMAIL=admin@yourdomain.com

# Meta WhatsApp Cloud API (optional)
# developers.facebook.com → WhatsApp → Getting Started
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_TOKEN=your_permanent_access_token

# App
SUPPORT_PHONE=919876543210
```

> **Note:** WhatsApp credentials are optional. If not set, the platform skips WhatsApp notifications gracefully and logs a console message.

---

## Database Schema

### Order (central model)
```js
{
  orderId: String,          // NS-YYYY-NNNN (auto-generated)
  category: String,         // one of 21 categories
  items: [{ name, quantity, unit }],
  delivery: { address, city, pincode, date, slot },
  customer: { name, phone, email },
  customerId: ObjectId,     // ref: Customer (null for guests)
  status: enum[pending, quoted, confirmed, dispatched, delivered, cancelled],
  quote: { amount, breakdown, sentAt },
  payment: { status, advanceAmount, advancePaidAt, razorpayOrderId, ... },
  supplierId: ObjectId,     // ref: Supplier
  adminNote: String,
  supplierNote: String,
  review: { rating(1-5), comment, reviewedAt },
  complaint: { text, raisedAt, status(open/resolved), resolution, resolvedAt },
  supplierPayout: { status(pending/paid), amount, paidAt, note },
  timeline: [{ status, note, by(admin/supplier/customer), at }],
}
```

### Message (in-app chat)
```js
{
  orderId: String,          // indexed
  from: enum[customer, admin],
  senderName: String,
  content: String,          // max 1000 chars
  createdAt: Date,
}
```

### Supplier
```js
{
  name, phone, password(hashed),
  email, businessName,
  categories: [String],     // one of 21 categories
  serviceAreas: [String],
  kycStatus: enum[pending, verified, rejected],
  verifiedBadge: Boolean,
  isActive: Boolean,
  availability: Boolean,
}
```

---

## Real-time Events (Socket.IO)

### Client → Server (emit)
| Event | Payload | Description |
|-------|---------|-------------|
| `join:admin` | — | Join admin room (all new order alerts) |
| `join:order` | `orderId` | Subscribe to a specific order's updates |
| `leave:order` | `orderId` | Unsubscribe from order |
| `join:supplier` | `supplierId` | Subscribe to supplier-specific events |

### Server → Client (emit)
| Event | Room | Payload | Trigger |
|-------|------|---------|---------|
| `order:new` | `admin` | `{ orderId, customerName, category, city }` | New order submitted |
| `order:updated` | `order:<id>` | `{ orderId, status, ... }` | Admin/supplier status change |
| `chat:message` | `order:<id>` | `Message document` | New chat message sent |
| `supplier:new-order` | `supplier:<id>` | `{ orderId, category, city }` | Supplier assigned to order |

---

## Security

| Measure | Implementation |
|---------|---------------|
| Password hashing | bcryptjs (salt rounds: 10) |
| Auth tokens | JWT with role-specific secrets (7d expiry) |
| HTTP headers | Helmet.js (XSS, HSTS, CSP, etc.) |
| Rate limiting | express-rate-limit — auth: 20 req/15min, orders: 10 req/hr |
| Input validation | express-validator on all write endpoints |
| Payment verification | Razorpay HMAC-SHA256 signature check |
| Anti-bypass | Supplier never sees customer phone/address; all contact through chat |
| CORS | Restricted to `CLIENT_URL` env variable |

---

## Development Log

| Day | Features |
|-----|---------|
| **Day 1–4** | Core MERN setup, order request form, customer/admin/supplier portals, JWT auth for 3 roles, basic order flow |
| **Day 5** | Email notifications (Nodemailer), order ID linking for guests, revenue stats, customer profile page |
| **Day 6** | UX polish across all portals, CSV export, customer order cancellation, supplier profile, 404 page |
| **Day 7** | Security hardening (Helmet, rate limiting, input validation), WhatsApp Business API integration, admin settings page, supplier detail modal |
| **Day 7+** | Expanded from 3 to **21 construction categories** with 150+ items and per-item measurement units (Bag/Ton/CFT/Brass/Piece/Day/etc.) |
| **Day 8** | Customer reviews (5-star), admin notification bell (60s polling), supplier payout tracker, dashboard payables card |
| **Day 9** | Real-time order tracking (Socket.IO), in-app masked chat (Customer ↔ Admin), supplier assignment notifications |
| **Day 10** | Complaint/dispute system (raise → resolve → customer sees resolution), supplier performance stats (avg rating + earnings), customer orders status filter tabs |

---

## Author

**Akshay Kumar Mandal**

| Platform | Handle |
|----------|--------|
| GitHub | [@akshaycodex](https://github.com/akshaycodexx) |
| Instagram | [@akshaycodex](https://instagram.com/mr.akki.kr) |
| Twitter / X | [@akshaycodex](https://twitter.com/alonerishi14) |
| YouTube | [@akshaycodex](https://youtube.com/@akshaycodex) |
| LinkedIn | [@akshaycodex](https://linkedin.com/in/akshaycodex) |
| Email | [akshaycodex@gmail.com](mailto:akshaycodex@gmail.com) |

---

## License

Private — All rights reserved. © 2026 Nirman Setu. Built by Akshay Kumar Mandal.

---

<div align="center">
  <strong>Built with ❤️ for the Indian construction industry</strong><br/>
  <sub>by <a href="mailto:akshaycodex@gmail.com">Akshay Kumar Mandal</a> · @akshaycodex</sub><br/><br/>
  <sub>Reliable · Fast · Transparent</sub>
</div>
