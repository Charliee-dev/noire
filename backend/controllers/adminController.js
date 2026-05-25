const Product = require("../models/Product");

// ADD
exports.addProduct = async (req, res) => {
  const { name, price, image } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const product = await Product.create({ name, price, image });

  res.json({ message: "Product added", product });
};

// DELETE
exports.deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
};

// UPDATE
exports.updateProduct = async (req, res) => {
  const { name, price, image } = req.body;

  const updated = await Product.findByIdAndUpdate(
    req.params.id,
    { name, price, image },
    { new: true }
  );

  res.json({ message: "Updated", updated });
};