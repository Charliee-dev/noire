const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: String,

  items: [
    {
      productId: String,
      name: String,
      price: Number,
      qty: Number,
      size: String,
      color: String,
      image: String,
    }
  ],

  total: Number,

  status: {
    type: String,
    enum: ["Placed", "Paid", "Shipped", "Delivered"],
    default: "Placed"
  },

  paymentId: String,
  razorpayOrderId: String,

  paid: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);