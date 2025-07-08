const mongoose = require("mongoose");

const currencySchema = new mongoose.Schema(
  {
    currencyCode: {
      type: String,
      required: true,
      unique: true,
    },
    currencyName: {
      type: String,
      required: true,
    },
    symbol: {
      type: String,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    exchangeRate: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Currency", currencySchema);
