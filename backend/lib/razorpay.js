const Razorpay = require('razorpay');
const crypto = require('crypto');
require('dotenv').config();

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create a Razorpay order
 * @param {number} amountInPaise - Amount in paise (INR * 100)
 * @param {string} receipt - Unique receipt identifier
 * @returns {Promise<object>} Razorpay order object
 */
async function createOrder(amountInPaise, receipt) {
  const options = {
    amount: amountInPaise,
    currency: 'INR',
    receipt: receipt,
  };
  return await razorpayInstance.orders.create(options);
}

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Razorpay order ID
 * @param {string} paymentId - Razorpay payment ID
 * @param {string} signature - Razorpay signature from checkout
 * @returns {boolean} Whether the signature is valid
 */
function verifyPayment(orderId, paymentId, signature) {
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
}

module.exports = { razorpayInstance, createOrder, verifyPayment };
