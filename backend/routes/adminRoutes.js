const express = require("express");

const {
  addProduct,
  deleteProduct,
  updateProduct
} = require("../controllers/adminController");

const {
  authMiddleware,
  adminMiddleware
} = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/add-product", authMiddleware, adminMiddleware, addProduct);
router.delete("/delete-product/:id", authMiddleware, adminMiddleware, deleteProduct);
router.put("/update-product/:id", authMiddleware, adminMiddleware, updateProduct);

module.exports = router;