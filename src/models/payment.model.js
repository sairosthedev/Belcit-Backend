const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {
  SUPPORTED_PAYMENT_METHODS,
  PAYMENT_METHODS_ENUM,
} = require("../config/payment-methods");
const { PAYMENT_TYPES, PAYMENT_TYPES_ENUM } = require("../config/payment-type");
const {
  PAYMENT_STATUSES,
  PAYMENT_STATUSES_ENUM,
} = require("../config/payment-status");

const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const paymentSchema = new Schema(
  {
    saleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: SUPPORTED_PAYMENT_METHODS,
    },
    paymentType: {
      type: String,
      required: true,
      enum: PAYMENT_TYPES,
      default: PAYMENT_TYPES_ENUM.SALE,
    },
    status: {
      type: String,
      required: true,
      enum: PAYMENT_STATUSES,
      default: PAYMENT_STATUSES_ENUM.PAID,
    },
    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    paymentDate: { type: Date, default: Date.now },
    // Add more fields as needed for supermarket context
  },
  { timestamps: true }
);

paymentSchema.plugin(aggregatePaginate);

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
