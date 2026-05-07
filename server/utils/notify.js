const wa = require('./whatsapp');
const mailer = require('./mailer');
const { sendSms } = require('./sms');
const NotificationLog = require('../models/NotificationLog');

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function _log(channel, event, recipient, status, meta = {}) {
  try {
    await NotificationLog.create({ channel, event, recipient, status, meta });
  } catch {} // never let logging crash the app
}

function _fire(promiseFn, channel, event, recipient, meta = {}) {
  return promiseFn()
    .then(() => _log(channel, event, recipient, 'sent', meta))
    .catch(e => _log(channel, event, recipient, 'failed', { ...meta, error: e.message }));
}

function _sms(phone, message, event, meta = {}) {
  if (!phone) return;
  _fire(() => sendSms(phone, message), 'sms', event, phone, meta);
}

function _wa(phone, fn, event, meta = {}) {
  if (!phone) return;
  _fire(() => Promise.resolve(fn()), 'whatsapp', event, phone, meta);
}

function _email(emailFn, event, recipient, meta = {}) {
  if (!recipient) return;
  _fire(emailFn, 'email', event, recipient, meta);
}

// ─── ORDER EVENTS (already partially wired — adding payment WhatsApp gap) ─────

exports.onPaymentReceived = (order) => {
  const meta = { orderId: order.orderId };
  const phone = order.customer?.phone;
  const msg = `Payment confirm! Namaste ${order.customer?.name}, aapka ₹${order.payment?.advanceAmount?.toLocaleString('en-IN')} advance payment receive hua. Order ID: ${order.orderId}. Delivery jaldi hogi.`;

  _wa(phone, () => wa.notifyPaymentReceived({
    customerPhone: phone,
    customerName: order.customer?.name,
    orderId: order.orderId,
    amount: order.payment?.advanceAmount,
  }), 'payment_received', meta);

  _sms(phone, msg, 'payment_received', meta);
};

// ─── RFQ / MATERIAL QUOTE EVENTS ─────────────────────────────────────────────

exports.onRfqBidReceived = ({ customerPhone, customerEmail, customerName, supplierName, material, amount, requestId }) => {
  const meta = { requestId, supplierName };
  const smsMsg = `Nirman Setu: ${supplierName} ne aapke ${material} request par Rs.${Number(amount).toLocaleString('en-IN')} ka quote diya. App mein dekhein.`;

  _wa(customerPhone, () => wa.notifyRfqBidReceived({ customerPhone, customerName, supplierName, material, amount }),
    'rfq_bid_received', meta);

  _sms(customerPhone, smsMsg, 'rfq_bid_received', meta);

  _email(
    () => mailer.sendRfqBidEmail(
      { name: customerName, email: customerEmail },
      { material, unit: '', quantity: 0 },
      { supplierName, totalPrice: amount, pricePerUnit: 0, deliveryDays: 0, notes: '' }
    ),
    'rfq_bid_received', customerEmail, meta
  );
};

exports.onRfqAccepted = ({ supplierPhone, supplierEmail, supplierName, customerName, material, amount, requestObj, quoteObj }) => {
  const meta = { supplierName, material };
  const smsMsg = `Nirman Setu: Badhai ho! ${customerName} ne aapka ${material} quote Rs.${Number(amount).toLocaleString('en-IN')} accept kar liya.`;

  _wa(supplierPhone, () => wa.notifyRfqAccepted({ supplierPhone, supplierName, material, amount }),
    'rfq_accepted', meta);

  _sms(supplierPhone, smsMsg, 'rfq_accepted', meta);

  _email(
    () => mailer.sendRfqAcceptedEmail({ name: supplierName, email: supplierEmail }, requestObj, quoteObj),
    'rfq_accepted', supplierEmail, meta
  );
};

exports.onRfqCounter = ({ recipientPhone, recipientName, counterBy, material, newPrice }) => {
  const meta = { material, counterBy };
  const smsMsg = `Nirman Setu: ${material} quote par counter offer - naya price Rs.${Number(newPrice).toLocaleString('en-IN')} (by ${counterBy}). App mein jawab dein.`;

  _wa(recipientPhone, () => wa.notifyRfqCounter({ recipientPhone, recipientName, counterBy, material, newPrice }),
    'rfq_counter', meta);

  _sms(recipientPhone, smsMsg, 'rfq_counter', meta);
};

// ─── LABOUR / KARIGAR EVENTS ─────────────────────────────────────────────────

exports.onLabourBidReceived = ({ customerPhone, customerEmail, customerName, supplierName, jobTitle, amount, requestId }) => {
  const meta = { requestId, supplierName };
  const smsMsg = `Nirman Setu: ${supplierName} ne aapke "${jobTitle}" ke liye Rs.${Number(amount).toLocaleString('en-IN')} ki bid di. App mein dekhein.`;

  _wa(customerPhone, () => wa.notifyLabourBidReceived({ customerPhone, customerName, supplierName, jobTitle, amount }),
    'labour_bid_received', meta);

  _sms(customerPhone, smsMsg, 'labour_bid_received', meta);

  _email(
    () => mailer.sendLabourBidEmail(
      { name: customerName, email: customerEmail },
      { jobTitle },
      { supplierName, totalAmount: amount, ratePerDay: 0, totalWorkers: 1, totalDays: 0, notes: '' }
    ),
    'labour_bid_received', customerEmail, meta
  );
};

exports.onLabourAccepted = ({ supplierPhone, supplierEmail, supplierName, customerName, jobTitle, requestObj, bidObj }) => {
  const meta = { supplierName, jobTitle };
  const smsMsg = `Nirman Setu: Badhai ho ${supplierName}! ${customerName} ne aapki "${jobTitle}" bid accept kar li. Taiyaar rahein!`;

  _wa(supplierPhone, () => wa.notifyLabourAccepted({ supplierPhone, supplierName, jobTitle, customerName }),
    'labour_accepted', meta);

  _sms(supplierPhone, smsMsg, 'labour_accepted', meta);

  _email(
    () => mailer.sendLabourAcceptedEmail({ name: supplierName, email: supplierEmail }, requestObj, bidObj),
    'labour_accepted', supplierEmail, meta
  );
};

exports.onLabourCounter = ({ recipientPhone, recipientName, counterBy, jobTitle, newPrice }) => {
  const meta = { jobTitle, counterBy };
  const smsMsg = `Nirman Setu: "${jobTitle}" bid par counter offer - naya price Rs.${Number(newPrice).toLocaleString('en-IN')} (by ${counterBy}). App mein jawab dein.`;

  _wa(recipientPhone, () => wa.notifyRfqCounter({ recipientPhone, recipientName, counterBy, material: jobTitle, newPrice }),
    'labour_counter', meta);

  _sms(recipientPhone, smsMsg, 'labour_counter', meta);
};
