const Product = require("../models/Product");

// GET ALL PRODUCTS
exports.getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// GET SINGLE PRODUCT
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false });
    }

    res.json({ success: true, product });

  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// CREATE PRODUCT (ADMIN)
exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();

    res.json({ success: true, product });

  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// UPDATE PRODUCT (ADMIN)
exports.updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json({ success: true, product: updated });

  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// DELETE PRODUCT (ADMIN)
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ success: false });
  }
};