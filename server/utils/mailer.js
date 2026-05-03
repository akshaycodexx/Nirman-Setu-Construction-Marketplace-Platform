const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const send = (to, subject, html) =>
  transporter.sendMail({ from: `"Nirman Setu" <${process.env.EMAIL_USER}>`, to, subject, html });

// ── Admin: new order notification ──────────────────────────────────────────────
const sendAdminNotification = async (order) => {
  const itemsList = order.items.map(i => `${i.name} — ${i.quantity} ${i.unit}`).join('\n');
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#f97316;">🏗️ New Order — Nirman Setu</h2>
      <table style="width:100%;border-collapse:collapse;">
        <tr><td style="padding:8px;font-weight:bold;">Order ID</td><td>${order.orderId}</td></tr>
        <tr style="background:#f9fafb;"><td style="padding:8px;font-weight:bold;">Customer</td><td>${order.customer.name}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;">Phone</td><td>${order.customer.phone}</td></tr>
        <tr style="background:#f9fafb;"><td style="padding:8px;font-weight:bold;">Category</td><td style="text-transform:capitalize;">${order.category}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;vertical-align:top;">Items</td><td><pre style="margin:0;">${itemsList}</pre></td></tr>
        <tr style="background:#f9fafb;"><td style="padding:8px;font-weight:bold;">Delivery</td><td>${order.delivery.address}, ${order.delivery.city}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;">Date</td><td>${new Date(order.delivery.date).toDateString()} (${order.delivery.slot})</td></tr>
        ${order.notes ? `<tr style="background:#f9fafb;"><td style="padding:8px;font-weight:bold;">Notes</td><td>${order.notes}</td></tr>` : ''}
      </table>
    </div>`;
  await send(process.env.ADMIN_EMAIL, `🏗️ New Order: ${order.orderId} — ${order.customer.name}`, html);
};

// ── Customer: quote received ───────────────────────────────────────────────────
const sendQuoteNotification = async (order) => {
  if (!order.customer.email) return;
  const trackUrl = `${process.env.CLIENT_URL}/customer/orders/${order.orderId}`;
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#f97316;">✅ Quote Ready — Nirman Setu</h2>
      <p>Namaste <strong>${order.customer.name}</strong>,</p>
      <p>Aapke order <strong>${order.orderId}</strong> ka quote ready hai:</p>
      <div style="background:#f9fafb;border-left:4px solid #f97316;padding:16px;margin:16px 0;border-radius:4px;">
        <p style="margin:0;font-size:22px;font-weight:bold;color:#111;">₹${order.quote.amount.toLocaleString('en-IN')}</p>
        <p style="margin:6px 0 0;color:#6b7280;font-size:14px;">${order.quote.breakdown}</p>
      </div>
      <p>Advance payment (30% = ₹${Math.ceil(order.quote.amount * 0.3).toLocaleString('en-IN')}) karke apna order confirm karein:</p>
      <a href="${trackUrl}" style="display:inline-block;background:#f97316;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:8px 0;">Order Dekhen & Pay Karein</a>
      <p style="margin-top:16px;color:#6b7280;font-size:13px;">Ya call/WhatsApp karein kisi bhi sawaal ke liye.</p>
    </div>`;
  await send(order.customer.email, `✅ Quote Ready: ${order.orderId} — ₹${order.quote.amount.toLocaleString('en-IN')}`, html);
};

// ── Customer: status update ────────────────────────────────────────────────────
const sendStatusNotification = async (order) => {
  if (!order.customer.email) return;
  const STATUS_LABELS = {
    confirmed: { emoji: '✅', text: 'Order Confirmed', msg: 'Aapka order confirm ho gaya hai. Hum jaldi delivery karenge.' },
    dispatched: { emoji: '🚛', text: 'Order Dispatched', msg: 'Aapka order rasta mein hai! Jaldi pahuch jayega.' },
    delivered: { emoji: '🎉', text: 'Order Delivered', msg: 'Aapka order deliver ho gaya. Shukriya Nirman Setu choose karne ke liye!' },
    cancelled: { emoji: '❌', text: 'Order Cancelled', msg: 'Aapka order cancel ho gaya hai. Kisi sawaal ke liye humse sampark karein.' },
  };
  const info = STATUS_LABELS[order.status];
  if (!info) return;
  const trackUrl = `${process.env.CLIENT_URL}/customer/orders/${order.orderId}`;
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#f97316;">${info.emoji} ${info.text}</h2>
      <p>Namaste <strong>${order.customer.name}</strong>,</p>
      <p>${info.msg}</p>
      <div style="background:#f9fafb;padding:12px 16px;border-radius:8px;margin:16px 0;">
        <p style="margin:0;font-size:13px;color:#6b7280;">Order ID: <strong style="color:#111;">${order.orderId}</strong></p>
        ${order.adminNote ? `<p style="margin:6px 0 0;font-size:13px;color:#6b7280;">Note: ${order.adminNote}</p>` : ''}
      </div>
      <a href="${trackUrl}" style="display:inline-block;background:#f97316;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">Track Your Order</a>
    </div>`;
  await send(order.customer.email, `${info.emoji} ${info.text}: ${order.orderId}`, html);
};

// ── Customer: payment confirmation ────────────────────────────────────────────
const sendPaymentConfirmation = async (order) => {
  if (!order.customer.email) return;
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#16a34a;">💳 Payment Confirmed — Nirman Setu</h2>
      <p>Namaste <strong>${order.customer.name}</strong>,</p>
      <p>Aapka advance payment receive ho gaya. Order confirmed!</p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:16px;border-radius:8px;margin:16px 0;">
        <p style="margin:0;font-size:13px;color:#166534;">Order ID: <strong>${order.orderId}</strong></p>
        <p style="margin:6px 0 0;font-size:13px;color:#166534;">Advance Paid: <strong>₹${order.payment.advanceAmount?.toLocaleString('en-IN')}</strong></p>
        <p style="margin:6px 0 0;font-size:13px;color:#166534;">Payment ID: ${order.payment.razorpayPaymentId}</p>
      </div>
      <a href="${process.env.CLIENT_URL}/customer/orders/${order.orderId}" style="display:inline-block;background:#16a34a;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">Order Track Karein</a>
    </div>`;
  await send(order.customer.email, `💳 Payment Confirmed: ${order.orderId}`, html);
};

// ── Supplier: assigned to order ───────────────────────────────────────────────
const sendSupplierAssignment = async (order, supplier) => {
  if (!supplier.email) return;
  const itemsList = order.items.map(i => `• ${i.name} — ${i.quantity} ${i.unit}`).join('\n');
  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#16a34a;">📦 New Order Assigned — Nirman Setu</h2>
      <p>Namaste <strong>${supplier.name}</strong>,</p>
      <p>Aapko ek naya order assign hua hai. Details:</p>
      <div style="background:#f9fafb;padding:16px;border-radius:8px;margin:16px 0;border-left:4px solid #16a34a;">
        <p style="margin:0;font-weight:bold;">Order: ${order.orderId}</p>
        <p style="margin:6px 0 0;font-size:14px;color:#374151;white-space:pre-line;">${itemsList}</p>
        <p style="margin:8px 0 0;font-size:13px;color:#6b7280;">Delivery: ${order.delivery.address}, ${order.delivery.city}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#6b7280;">Date: ${new Date(order.delivery.date).toDateString()} (${order.delivery.slot})</p>
      </div>
      <a href="${process.env.CLIENT_URL}/supplier/orders/${order.orderId}" style="display:inline-block;background:#16a34a;color:white;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">Supplier Portal Kholein</a>
    </div>`;
  await send(supplier.email, `📦 New Order Assigned: ${order.orderId}`, html);
};

module.exports = {
  sendAdminNotification,
  sendQuoteNotification,
  sendStatusNotification,
  sendPaymentConfirmation,
  sendSupplierAssignment,
};
