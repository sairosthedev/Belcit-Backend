const mongoose = require("mongoose");

const invoiceTemplateSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g. "Monthly Lease Charge", "Environmental Levy"
    description: { type: String },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    linkedLease: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lease",
      required: false, // optional, if not lease-based
    },
    chargeTarget: {
      type: String,
      enum: ["rent", "levy", "other"], // expandable
      required: true,
    },
    lineItems: [
      {
        name: { type: String, required: true },
        quantity: { type: Number, required: true },
        unit: { type: String, required: true },
        amount: { type: Number, required: true },
      },
    ],
    isTaxable: { type: Boolean, default: false },
    meta: { type: mongoose.Schema.Types.Mixed }, // optional for extra info
  },
  { timestamps: true }
);

module.exports = mongoose.model("InvoiceTemplate", invoiceTemplateSchema);
