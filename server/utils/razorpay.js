const Razorpay = require('razorpay');
const crypto = require('crypto');

const rzp = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function createRazorpayOrder(amountInRupees, receipt) {
  return rzp.orders.create({
    amount: Math.round(amountInRupees * 100),
    currency: 'INR',
    receipt,
  });
}

function verifySignature(razorpayOrderId, razorpayPaymentId, signature) {
  const body = razorpayOrderId + '|' + razorpayPaymentId;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expected === signature;
}

module.exports = { createRazorpayOrder, verifySignature };
