const mongoose = require("mongoose");

const billingScheduleSchema = new mongoose.Schema(
  {
    invoiceTemplateIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InvoiceTemplate",
      },
    ],
    description: { type: String, required: true },
    billingFrequency: {
      onDate: { type: Number, min: 1, max: 31 },
      frequency: {
        type: String,
        enum: [
          "weekly",
          "fortnightly",
          "monthly",
          "quarterly",
          "biannually",
          "yearly",
        ],
        required: true,
      },
      occurrence: { type: Number, default: 1 },
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, default: null },
    isActive: { type: Boolean, default: true },
    nextBillingDate: { type: Date }, // computed
  },
  { timestamps: true }
);

billingScheduleSchema.index(
  { invoiceTemplateIds: 1, startDate: 1 },
  { unique: true }
);
billingScheduleSchema.index({ nextBillingDate: 1 });

module.exports = mongoose.model("BillingSchedule", billingScheduleSchema);
