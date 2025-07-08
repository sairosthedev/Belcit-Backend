const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const {
  SUPPORTED_PAYMENT_METHODS,
  PAYMENT_METHODS_ENUM,
} = require("../config/payment-methods");
const currencyModel = require("./currency.model");
const { PAYMENT_TYPES, PAYMENT_TYPES_ENUM } = require("../config/payment-type");
const {
  PAYMENT_STATUSES,
  PAYMENT_STATUSES_ENUM,
} = require("../config/payment-status");
const { BASE_CURRENCY } = require("../config/misc");

const { TRANSACTION_TYPES } = require("../config/transaction-types");

const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const { getDatePart, generateRef } = require("../utils/generate-ref");

const paymentSchema = new Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    paymentNumber: {
      type: String,
      required: false,
      unique: true,
    },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ControlAccount",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    fxRate: {
      type: Number,
      required: function () {
        return this.currency !== BASE_CURRENCY;
      },
    },
    fxAmount: {
      type: Number,
      required: function () {
        return this.currency !== BASE_CURRENCY;
      },
    },
    fxCurrencyCode: {
      type: String,
      required: function () {
        return this.currency !== BASE_CURRENCY;
      },
    },
    currency: {
      type: String,
      required: true,
      default: BASE_CURRENCY,
      validate: {
        validator: async function (value) {
          return await currencyModel.exists({ currencyCode: value });
        },
        message: (props) => `${props.value} is not a supported currency.`,
      },
    },
    paymentMethod: {
      type: String,
      required: true,
      //enum: SUPPORTED_PAYMENT_METHODS,
      //default: PAYMENT_METHODS_ENUM.CASH,
    },
    paymentType: {
      type: String,
      required: true,
      enum: PAYMENT_TYPES,
      default: PAYMENT_TYPES_ENUM.PARKING,
    },
    status: {
      type: String,
      required: true,
      enum: PAYMENT_STATUSES,
      default: PAYMENT_STATUSES_ENUM.PENDING,
    },
    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    reversedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
    },
    reason: {
      type: String,
      required: false,
    },
    transactionType: {
      type: String,
      enum: TRANSACTION_TYPES,
      required: true,
    },
    paymentDate: { type: Date, default: Date.now },
    referenceModel: {
      type: String,
      required: true,
      enum: ["Bill", "CreditNote"],
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "referenceModel",
      required: true,
    },
    sourceRef: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

paymentSchema.plugin(aggregatePaginate);

paymentSchema.pre("save", async function (next) {
  if (this.isNew && !this.paymentNumber) {
    const period = await getDatePart();
    this.paymentNumber = await generateRef({
      type: "payment",
      period: period,
      prefix: ['reversal', 'refund'].includes(this.transactionType) ? "REV":"PMT-",
    });
  }
  next();
});

const Payment = mongoose.model("Payment", paymentSchema);

module.exports = Payment;
