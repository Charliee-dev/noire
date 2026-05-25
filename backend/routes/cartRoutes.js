const express = require("express");
const router = express.Router();

const Cart = require("../models/Cart");
const { authMiddleware } = require("../middleware/authMiddleware");

// GET CART
router.get("/", authMiddleware, async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user.id });
  res.json(cart || { items: [] });
});

// ADD TO CART
router.post("/add", authMiddleware, async (req, res) => {
  const { product } = req.body;
  let cart = await Cart.findOne({ userId: req.user.id });

  if (!cart) cart = new Cart({ userId: req.user.id, items: [] });

  const existing = cart.items.find(
    i => i.productId === product.productId && i.size === product.size
  );

  if (existing) existing.qty += 1;
  else cart.items.push(product);

  await cart.save();
  res.json({ success: true, cart });
});

// UPDATE CART
// UPDATE (FIXED)
router.put("/update", authMiddleware, async (req, res) => {
  const { productId, size, change } = req.body;

  const cart = await Cart.findOne({ userId: req.user.id });
  if (!cart) return res.json({ success: false });

  const item = cart.items.find(
    i =>
      i.productId.toString() === productId &&
      i.size === size
  );

  if (!item) return res.json({ success: false });

  item.qty += change;

  if (item.qty <= 0) {
    cart.items = cart.items.filter(
      i =>
        !(i.productId.toString() === productId && i.size === size)
    );
  }

  await cart.save();
  res.json({ success: true, cart });
});

// REMOVE (FIXED)
router.delete("/remove", authMiddleware, async (req, res) => {
  try {
    const { productId, size } = req.body;

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.json({ success: false });

    cart.items = cart.items.filter(
      item =>
        !(
          item.productId.toString() === productId &&
          item.size === size
        )
    );

    await cart.save();

    res.json({ success: true, cart });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

module.exports = router;