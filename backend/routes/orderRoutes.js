const express = require("express");
const router = express.Router();

const Order = require("../models/Order");
const Cart = require("../models/Cart");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");

// PLACE ORDER
router.post("/place", authMiddleware, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart empty" });
    }

    let total = 0;
    cart.items.forEach(i => total += i.price * i.qty);

    const order = new Order({
      userId: req.user.id,
      items: cart.items,
      total,
      status: "Placed" // 🔥 important
    });

    await order.save();

    // clear cart AFTER success
   if (order) {
  cart.items = [];
  await cart.save();
}

    res.json({ success: true, order });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});
// USER ORDERS
router.get("/", authMiddleware, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});

// ADMIN ORDERS
router.get("/admin", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch {
    res.status(500).json({ message: "Failed to fetch orders" });
  }
});



// UPDATE STATUS
router.put("/admin/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const validStatuses = ["Placed", "Paid", "Shipped", "Delivered"];

    if (!validStatuses.includes(req.body.status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({ success: true, order: updated });

  } catch {
    res.status(500).json({ message: "Failed to update order" });
  }
  
  
});
module.exports = router;
