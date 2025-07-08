// Exchange Rate Schema
const mongoose = require("mongoose");
const ExchangeRateSchema = new mongoose.Schema(
  {
    baseCurrency: {
      type: mongoose.Schema.Types.ObjectId,
      requried: true,
      ref: "Currency",
    },
    toCurrency: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      maxlength: 3,
      minlength: 3,
      validate: {
        validator: async function (value) {
          return await Currency.exists({ code: value });
        },
        message: (props) => `${props.value} is not a supported currency.`,
      },
    },
    rate: {
      type: Number,
      required: true,
      min: 0,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Ensure unique exchange rates for each target currency
ExchangeRateSchema.index({ toCurrency: 1 }, { unique: true });

const ExchangeRate = mongoose.model("ExchangeRate", ExchangeRateSchema);

module.exports = ExchangeRate;
