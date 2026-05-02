const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendAdminNotification = async (order) => {
  const itemsList = order.items
    .map(i => `${i.name} — ${i.quantity} ${i.unit}`)
    .join('\n');

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">🏗️ New Order Request — Nirman Setu</h2>
      <table style="width:100%; border-collapse: collapse;">
        <tr><td style="padding:8px; font-weight:bold;">Order ID</td><td>${order.orderId}</td></tr>
        <tr style="background:#f9fafb;"><td style="padding:8px; font-weight:bold;">Customer</td><td>${order.customer.name}</td></tr>
        <tr><td style="padding:8px; font-weight:bold;">Phone</td><td>${order.customer.phone}</td></tr>
        <tr style="background:#f9fafb;"><td style="padding:8px; font-weight:bold;">Category</td><td style="text-transform:capitalize;">${order.category}</td></tr>
        <tr><td style="padding:8px; font-weight:bold; vertical-align:top;">Items</td><td><pre style="margin:0;">${itemsList}</pre></td></tr>
        <tr style="background:#f9fafb;"><td style="padding:8px; font-weight:bold;">Delivery Address</td><td>${order.delivery.address}, ${order.delivery.city}</td></tr>
        <tr><td style="padding:8px; font-weight:bold;">Delivery Date</td><td>${new Date(order.delivery.date).toDateString()} (${order.delivery.slot})</td></tr>
        ${order.notes ? `<tr style="background:#f9fafb;"><td style="padding:8px; font-weight:bold;">Notes</td><td>${order.notes}</td></tr>` : ''}
      </table>
      <p style="margin-top:20px; color:#6b7280; font-size:13px;">Login to admin panel to process this order.</p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Nirman Setu" <${process.env.EMAIL_USER}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `🏗️ New Order: ${order.orderId} — ${order.customer.name}`,
    html,
  });
};

const sendQuoteNotification = async (order) => {
  if (!order.customer.email) return;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #f97316;">✅ Quote Ready — Nirman Setu</h2>
      <p>Namaste <strong>${order.customer.name}</strong>,</p>
      <p>Aapke order <strong>${order.orderId}</strong> ke liye quote ready hai:</p>
      <div style="background:#f9fafb; border-left:4px solid #f97316; padding:16px; margin:16px 0; border-radius:4px;">
        <p style="margin:0; font-size:18px; font-weight:bold; color:#111;">₹${order.quote.amount.toLocaleString('en-IN')}</p>
        <p style="margin:4px 0 0; color:#6b7280; font-size:14px;">${order.quote.breakdown}</p>
      </div>
      <p>Confirm karne ke liye ya kisi bhi sawaal ke liye call/WhatsApp karein.</p>
      <p style="margin-top:20px; color:#6b7280; font-size:13px;">
        Apna order track karein: <a href="${process.env.CLIENT_URL}/track/${order.orderId}" style="color:#f97316;">${process.env.CLIENT_URL}/track/${order.orderId}</a>
      </p>
    </div>
  `;

  await transporter.sendMail({
    from: `"Nirman Setu" <${process.env.EMAIL_USER}>`,
    to: order.customer.email,
    subject: `✅ Quote Ready: ${order.orderId} — ₹${order.quote.amount.toLocaleString('en-IN')}`,
    html,
  });
};

module.exports = { sendAdminNotification, sendQuoteNotification };
