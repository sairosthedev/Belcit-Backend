const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EcocashPaymentSchema = new Schema({
  payment: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
  },
  phoneNumber: {
    type: Number,
    required: true,
  },
  paymentRef: {
    type: String,
    required: false,
  },
  notifyUrl: {
    type: String,
    required: false,
  },
});

const EcocashPayment = mongoose.model("EcocashPayment", EcocashPaymentSchema);

const PaymentMethodSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // e.g., 'cash', 'bank_transfer', 'mpesa'
  label: { type: String }, // Human-friendly label
  controlAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ControlAccount",
    required: true,
  },
  isDeferred: { type: Boolean, default: false }, // true for mobile money, POS etc
  category: {
    type: String,
    enum: ["cash", "bank-transfer", "mobile-money", "other"],
    default: "other",
  }, // e.g., 'cash', 'bank_transfer', 'mobile_money'
  isActive: { type: Boolean, default: true },
});

const PaymentMethod = mongoose.model("PaymentMethod", PaymentMethodSchema);

module.exports = {
  EcocashPayment,
  PaymentMethod
}
