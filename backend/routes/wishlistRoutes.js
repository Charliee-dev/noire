const express = require("express");
const router = express.Router();

const Wishlist = require("../models/Wishlist");
const { authMiddleware } = require("../middleware/authMiddleware");

// =====================
// GET WISHLIST
// =====================
router.get("/", authMiddleware, async (req, res) => {

  try {

    let wishlist = await Wishlist.findOne({
      userId: req.user.id
    });

    if (!wishlist) {
      return res.json({ items: [] });
    }

    res.json(wishlist);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false
    });
  }

});

// =====================
// ADD TO WISHLIST
// =====================
router.post("/add", authMiddleware, async (req, res) => {

  try {

    const {
      productId,
      name,
      price,
      image
    } = req.body;

    let wishlist = await Wishlist.findOne({
      userId: req.user.id
    });

    if (!wishlist) {
      wishlist = new Wishlist({
        userId: req.user.id,
        items: []
      });
    }

    const exists = wishlist.items.find(
      item => item.productId === productId
    );

    if (!exists) {

      wishlist.items.push({
        productId,
        name,
        price,
        image
      });

      await wishlist.save();
    }

    res.json({
      success: true
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      success: false
    });
  }

});

// =====================
// REMOVE FROM WISHLIST
// =====================
router.delete("/remove", authMiddleware, async (req, res) => {

  try {

    const { productId } = req.body;

    const wishlist =
      await Wishlist.findOne({
        userId: req.user.id
      });

    if (!wishlist) {
      return res.json({
        success: true
      });
    }

    wishlist.items =
      wishlist.items.filter(
        item => item.productId !== productId
      );

    await wishlist.save();

    res.json({
      success: true
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false
    });

  }

});

module.exports = router;