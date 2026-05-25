const Product = require("../models/Product");
const Order = require("../models/Order");
const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");
const crypto = require("crypto");

const { authMiddleware } = require("../middleware/authMiddleware");
const Cart = require("../models/Cart");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ===============================
// 🔥 CREATE ORDER
// ===============================
router.post("/create-order", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Cart empty" });
    }

    let total = 0;

cart.items.forEach(i => {
  total += i.price * i.qty;
});

const deliveryFee =
  total >= 10000 ? 0 : 149;

total += deliveryFee;

console.log("🔥 CREATE ORDER HIT");
console.log("Subtotal:", total - deliveryFee);
console.log("Delivery:", deliveryFee);
console.log("Final:", total);

    const options = {
      amount: total * 100, // ₹ → paise
      currency: "INR",
      receipt: "receipt_" + Date.now()
    };

    const order = await razorpay.orders.create(options);

    res.json({
      id: order.id,
      amount: order.amount
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment failed" });
  }
});

// ===============================
// 🔐 VERIFY PAYMENT
// ===============================
router.post("/verify", authMiddleware, async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    // ❌ INVALID SIGNATURE → STOP HERE
if (expectedSignature !== razorpay_signature) {
  console.log("❌ Signature mismatch");
  return res.status(400).json({ success: false });
}

    // ✅ ONLY IF VALID → SAVE PAYMENT
    

  const cart = await Cart.findOne({ userId: req.user.id });

if (!cart || cart.items.length === 0) {
  return res.status(400).json({ success: false });
}

let total = 0;

cart.items.forEach(i => {
  total += i.price * i.qty;
});

const deliveryFee =
  total >= 10000 ? 0 : 149;

total += deliveryFee;

for (const item of cart.items) {

  const product =
    await Product.findById(item.productId);

  if (!product) {
    return res.status(404).json({
      success: false,
      message: "Product not found"
    });
  }

  if (product.stock < item.qty) {
    return res.status(400).json({
      success: false,
      message: `${product.name} is out of stock`
    });
  }

}
const newOrder = new Order({
  userId: req.user.id,
  items: cart.items,
  total,
  paymentId: razorpay_payment_id,
  razorpayOrderId: razorpay_order_id, // ✅ ADD THIS LINE
  paid: true,
  status: "Paid"
});

await newOrder.save();
// 🔥 REDUCE STOCK
for (const item of cart.items) {

  const product =
    await Product.findById(item.productId);

  if (!product) continue;

  product.stock =
    Math.max(0, product.stock - item.qty);

  await product.save();
}
// clear cart after order
cart.items = [];
await cart.save();

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});
module.exports = router;