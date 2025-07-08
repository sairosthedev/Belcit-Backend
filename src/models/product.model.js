const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  barcode: { type: String, unique: true, sparse: true },
  category: { type: String, required: true },
  unit: { type: String, required: true },
  price: { type: Number, required: true },
  cost: { type: Number, required: false },
  stock: { type: Number, required: true, default: 0 },
  minStock: { type: Number, required: false, default: 0 },
  description: { type: String },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema); 