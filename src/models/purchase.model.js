const mongoose = require("mongoose");

const purchaseItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
  cost: { type: Number, required: true },
  total: { type: Number, required: true }
}, { _id: false });

const purchaseSchema = new mongoose.Schema({
  items: [purchaseItemSchema],
  total: { type: Number, required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
  date: { type: Date, default: Date.now },
  status: { type: String, enum: ["ordered", "received", "cancelled"], default: "ordered" },
}, { timestamps: true });

module.exports = mongoose.model("Purchase", purchaseSchema); 