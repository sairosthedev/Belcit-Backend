const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null }, // for subcategories
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model("Category", categorySchema); 