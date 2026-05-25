const Product = require("./models/Product");
const products = require("./products.data");

async function seedProducts() {
  const count = await Product.countDocuments();

  if (count === 0) {
    await Product.insertMany(products);
    console.log("🔥 Products seeded automatically");
  } else {
    console.log("✅ Products already exist");
  }
}

module.exports = seedProducts;