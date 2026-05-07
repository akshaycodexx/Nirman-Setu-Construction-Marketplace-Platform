const axios = require('axios');

const API_URL = 'https://graph.facebook.com/v19.0';

function formatPhone(phone) {
  const digits = String(phone).replace(/\D/g, '');
  return digits.startsWith('91') ? digits : `91${digits}`;
}

function formatItems(items) {
  if (!items || !items.length) return 'N/A';
  return items.map(i => `${i.quantity} ${i.unit} ${i.name}`).join(', ');
}

async function sendTemplate(phone, templateName, params = [], language = 'en') {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (
    !token || !phoneNumberId ||
    token === 'your_permanent_access_token_here' ||
    phoneNumberId === 'your_phone_number_id_here'
  ) {
    console.log(`[WhatsApp] Credentials not set — skipping "${templateName}"`);
    return;
  }

  const to = formatPhone(phone);
  const body = {
    messaging_product: 'whatsapp',
    to,
    type: 'template',
    template: {
      name: templateName,
      language: { code: language },
      ...(params.length > 0 && {
        components: [{
          type: 'body',
          parameters: params.map(p => ({ type: 'text', text: String(p) })),
        }],
      }),
    },
  };

  const { data } = await axios.post(
    `${API_URL}/${phoneNumberId}/messages`,
    body,
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
  return data;
}

// Template: order_received — {{name}}, {{order_id}}, {{items}}
function notifyNewOrder(order) {
  const phone = order.customer?.phone;
  if (!phone) return;
  sendTemplate(phone, 'order_received', [
    order.customer?.name || 'Customer',
    order.orderId,
    formatItems(order.items),
  ]).catch(e => console.error('[WhatsApp] order_received failed:', e.message));
}

// Template: quote_ready — {{name}}, {{price}}, {{items}}, {{link}}
function notifyQuoteReady(order) {
  const phone = order.customer?.phone;
  if (!phone) return;
  const link = `${process.env.CLIENT_URL}/track/${order.orderId}`;
  sendTemplate(phone, 'quote_ready', [
    order.customer?.name || 'Customer',
    `Rs. ${order.quote?.amount?.toLocaleString('en-IN') || ''}`,
    formatItems(order.items),
    link,
  ]).catch(e => console.error('[WhatsApp] quote_ready failed:', e.message));
}

// Template: order_confirmed — {{name}}, {{order_id}}, {{items}}, {{date}}
function notifyOrderConfirmed(order) {
  const phone = order.customer?.phone;
  if (!phone) return;
  const date = order.delivery?.date
    ? new Date(order.delivery.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'TBD';
  sendTemplate(phone, 'order_confirmed', [
    order.customer?.name || 'Customer',
    order.orderId,
    formatItems(order.items),
    date,
  ]).catch(e => console.error('[WhatsApp] order_confirmed failed:', e.message));
}

// Template: order_dispatched — {{name}}, {{order_id}}, {{items}}, {{tracking_link}}
function notifyOrderDispatched(order) {
  const phone = order.customer?.phone;
  if (!phone) return;
  const trackingLink = `${process.env.CLIENT_URL}/track/${order.orderId}`;
  sendTemplate(phone, 'order_dispatched', [
    order.customer?.name || 'Customer',
    order.orderId,
    formatItems(order.items),
    trackingLink,
  ]).catch(e => console.error('[WhatsApp] order_dispatched failed:', e.message));
}

// Template: order_delivered — {{name}}, {{order_id}}, {{review_link}}
function notifyOrderDelivered(order) {
  const phone = order.customer?.phone;
  if (!phone) return;
  const reviewLink = `${process.env.CLIENT_URL}/customer/orders/${order.orderId}`;
  sendTemplate(phone, 'order_delivered', [
    order.customer?.name || 'Customer',
    order.orderId,
    reviewLink,
  ]).catch(e => console.error('[WhatsApp] order_delivered failed:', e.message));
}

// Template: order_cancelled — {{name}}, {{order_id}}
function notifyOrderCancelled(order) {
  const phone = order.customer?.phone;
  if (!phone) return;
  sendTemplate(phone, 'order_cancelled', [
    order.customer?.name || 'Customer',
    order.orderId,
  ]).catch(e => console.error('[WhatsApp] order_cancelled failed:', e.message));
}

// Supplier notification — template: supplier_assigned
// Create this template: {{name}}, {{order_id}}, {{category}}, {{city}}, {{date}}
function notifySupplierAssigned(order, supplier) {
  const phone = supplier?.phone;
  if (!phone) return;
  const date = order.delivery?.date
    ? new Date(order.delivery.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : 'TBD';
  sendTemplate(phone, 'supplier_assigned', [
    supplier.name || 'Supplier',
    order.orderId,
    order.category,
    order.delivery?.city || '',
    date,
  ]).catch(e => console.error('[WhatsApp] supplier_assigned failed:', e.message));
}

// Called by adminController on every status change
function notifyStatusUpdate(order) {
  switch (order.status) {
    case 'quoted':     return notifyQuoteReady(order);
    case 'confirmed':  return notifyOrderConfirmed(order);
    case 'dispatched': return notifyOrderDispatched(order);
    case 'delivered':  return notifyOrderDelivered(order);
    case 'cancelled':  return notifyOrderCancelled(order);
    default: return;
  }
}

// ─── Free-form text message (works in 24h customer-service window / dev) ──────
async function sendText(phone, message) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (
    !token || !phoneNumberId ||
    token === 'your_permanent_access_token_here' ||
    phoneNumberId === 'your_phone_number_id_here'
  ) {
    console.log(`[WhatsApp] Credentials not set — skipping text to ${phone}`);
    return;
  }

  const to = formatPhone(phone);
  const { data } = await axios.post(
    `${API_URL}/${phoneNumberId}/messages`,
    {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: message },
    },
    { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } }
  );
  return data;
}

// ─── RFQ / Material Quote events ──────────────────────────────────────────────

function notifyRfqBidReceived({ customerPhone, customerName, supplierName, material, amount }) {
  const msg = `Namaste ${customerName}! ${supplierName} ne aapke *${material}* request par *₹${Number(amount).toLocaleString('en-IN')}* ka quote diya. Dekhein aur compare karein: nirman-setu app.`;
  sendText(customerPhone, msg).catch(e => console.error('[WhatsApp] rfq_bid failed:', e.message));
}

function notifyRfqAccepted({ supplierPhone, supplierName, material, amount }) {
  const msg = `Badhai ho ${supplierName}! Customer ne aapka *${material}* quote *₹${Number(amount).toLocaleString('en-IN')}* accept kar liya. App kholein deal confirm karne ke liye.`;
  sendText(supplierPhone, msg).catch(e => console.error('[WhatsApp] rfq_accepted failed:', e.message));
}

function notifyRfqCounter({ recipientPhone, recipientName, counterBy, material, newPrice }) {
  const msg = `${recipientName}, *${material}* quote par counter offer aaya — naya price: *₹${Number(newPrice).toLocaleString('en-IN')}* (by ${counterBy}). App mein jawab dein.`;
  sendText(recipientPhone, msg).catch(e => console.error('[WhatsApp] rfq_counter failed:', e.message));
}

// ─── Labour / Karigar events ───────────────────────────────────────────────────

function notifyLabourBidReceived({ customerPhone, customerName, supplierName, jobTitle, amount }) {
  const msg = `Namaste ${customerName}! *${supplierName}* ne aapke "${jobTitle}" job par *₹${Number(amount).toLocaleString('en-IN')}* ki bid di. App mein dekhein aur accept karein.`;
  sendText(customerPhone, msg).catch(e => console.error('[WhatsApp] labour_bid failed:', e.message));
}

function notifyLabourAccepted({ supplierPhone, supplierName, jobTitle, customerName }) {
  const msg = `Badhai ho ${supplierName}! *${customerName}* ne aapki "${jobTitle}" bid accept kar li. Seedha contact hoga — taiyaar rahein!`;
  sendText(supplierPhone, msg).catch(e => console.error('[WhatsApp] labour_accepted failed:', e.message));
}

// ─── Payment event ─────────────────────────────────────────────────────────────

function notifyPaymentReceived({ customerPhone, customerName, orderId, amount }) {
  const msg = `Payment confirm! Namaste ${customerName}, aapka *₹${Number(amount).toLocaleString('en-IN')}* advance payment receive hua. Order ID: *${orderId}*. Delivery jaldi hogi.`;
  sendText(customerPhone, msg).catch(e => console.error('[WhatsApp] payment failed:', e.message));
}

module.exports = {
  notifyNewOrder,
  notifyStatusUpdate,
  notifySupplierAssigned,
  sendText,
  notifyRfqBidReceived,
  notifyRfqAccepted,
  notifyRfqCounter,
  notifyLabourBidReceived,
  notifyLabourAccepted,
  notifyPaymentReceived,
};
