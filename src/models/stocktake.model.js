const mongoose = require("mongoose");

const stocktakeSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  counted: { type: Number, required: true },
  system: { type: Number, required: true },
  discrepancy: { type: Number, required: true },
  countedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
  date: { type: Date, default: Date.now },
  confirmed: { type: Boolean, default: false },
  reason: { type: String, default: "" },
}, { timestamps: true });

module.exports = mongoose.model("Stocktake", stocktakeSchema); 