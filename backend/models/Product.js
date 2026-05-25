const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: String,

  price: Number,

  image: String,

  variants: [],

  description: {
    type: String,
    default: ""
  },

  details: {
    type: [String],
    default: []
  },

  stock: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("Product", productSchema);