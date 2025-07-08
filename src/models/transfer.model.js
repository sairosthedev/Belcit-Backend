const mongoose = require("mongoose");

const TransferSchema = new mongoose.Schema(
  {
    fromAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ControlAccount",
      required: true,
    },
    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ControlAccount",
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: "USD" },
    transferDate: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
    memo: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transfer", TransferSchema);
