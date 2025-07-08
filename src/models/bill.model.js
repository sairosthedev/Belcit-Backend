const mongoose = require("mongoose");
const { PAYMENT_TYPES } = require("../config/payment-type");

const aggregatePaginate = require("mongoose-aggregate-paginate-v2");
const { getDatePart, generateRef } = require("../utils/generate-ref");

const billSchema = new mongoose.Schema(
  {
    billNumber: { type: String, required: false, unique: true }, // this becomes the ref to all payments, ledger, etc
    type: { type: String, enum: PAYMENT_TYPES, required: true },
    amount: { type: Number, required: true },
    dateIssued: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      required: true,
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Staff" },
    status: {
      type: String,
      enum: ["paid", "unpaid", "partially-paid", "refunded"],
      default: "unpaid",
    },
    outstanding: { type: Number, default: 0 },
    lineItems: [
      {
        _id: { type: mongoose.Schema.Types.ObjectId, ref: "LineItem" },
        name: { type: String, required: true }, // Name of the line item
        quantity: { type: Number, required: true, min: 1 }, // Quantity of the line item
        unit: { type: String, required: true }, // Unit of the line item
        amount: { type: Number, default: null }, // Optional amount for the line item
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

billSchema.virtual("payments", {
  ref: "Payment",
  localField: "_id",
  foreignField: "referenceId", // field in Payment referencing Bill._id
});

billSchema.pre("save", async function (next) {
  // create new lease number
  // MBL-DATE-0001
  if (this.isNew && !this.billNumber) {
    const period = await getDatePart();
    this.billNumber = await generateRef({
      type: "bill",
      period: period,
      prefix: "MKB-",
    });
    console.log('Bill number generated:', this.billNumber);
  }
  next();
});

billSchema.plugin(aggregatePaginate);

module.exports = mongoose.model("Bill", billSchema);
