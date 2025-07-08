const mongoose = require("mongoose");

const inventoryTransactionSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  type: { type: String, enum: ["in", "out", "adjust"], required: true },
  quantity: { type: Number, required: true },
  reason: { type: String },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
}, { timestamps: true });

module.exports = mongoose.model("InventoryTransaction", inventoryTransactionSchema); 