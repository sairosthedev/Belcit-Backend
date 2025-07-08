const mongoose = require("mongoose");
const { ACCOUNT_TYPES } = require("../config/account-types");

const controlAccountSchema = new mongoose.Schema(
  {
    accountType: {
      type: String,
      enum: ACCOUNT_TYPES,
      required: true,
    },
    code: { type: String, required: true },
    accountName: { type: String, required: true },
    totalDebit: { type: Number, required: true, default: 0 },
    totalCredit: { type: Number, required: true, default: 0 },
    lastUpdatedAt: { type: Date, default: Date.now },
    isSystem: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ControlAccount", controlAccountSchema);
