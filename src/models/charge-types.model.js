// models/ChargeType.js
const mongoose = require("mongoose");

const chargeTypeSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g. 'rent', 'parking'
  displayName: { type: String, required: true },       // e.g. 'Stall Rent'
  description: { type: String },
  isDynamicAging: { type: Boolean, default: false },
  defaultPeriod: { type: Number, default: 0 },          // aging period in days
  appliesTo: [{ type: String }], // e.g. ['lease', 'ticket', 'invoice', 'fine']
  active: { type: Boolean, default: true },

  metadata: { type: mongoose.Schema.Types.Mixed } // optional custom config
}, { timestamps: true });

module.exports = mongoose.model("ChargeType", chargeTypeSchema);
