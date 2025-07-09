const mongoose = require("mongoose");

const saleItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  total: { type: Number, required: true }
}, { _id: false });

const saleSchema = new mongoose.Schema({
  items: [saleItemSchema],
  total: { type: Number, required: true },
  paymentType: { type: String, enum: ["cash", "swipe", "ecocash", "innbucks", "bank-transfer"], required: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
  cashier: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
  date: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model("Sale", saleSchema); 