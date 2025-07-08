const mongoose = require("mongoose");
const { Schema } = mongoose;

const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const creditNoteSchema = new Schema(
  {
    creditNoteNumber: { type: String, required: true, unique: true }, // e.g. CRN-20240512-0001
    customerId: {
      type: Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },
    accountId: {
      type: Schema.Types.ObjectId,
      ref: "ControlAccount",
      required: true,
    },

    amount: { type: Number, required: true },
    unappliedAmount: { type: Number, default: 0 },
    referenceId: { type: Schema.Types.ObjectId, required: true }, // Bill or Payment reference
    referenceModel: { type: String, enum: ["Bill", "Payment"], required: true },
    // amountApplied: { type: Number, required: true },

    fxAmount: { type: Number },
    fxRate: { type: Number },
    fxCurrencyCode: { type: String },

    reason: { type: String },
    creditType: {
      type: String,
      enum: ["overpayment", "return", "manual"],
      required: true,
    },

    status: {
      type: String,
      enum: ["draft", "issued", "partially_applied", "fully_applied"],
      default: "issued",
    },

    issueDate: { type: Date, default: Date.now },
    expiryDate: { type: Date },

    createdBy: { type: Schema.Types.ObjectId, ref: "Staff" },
    updatedBy: { type: Schema.Types.ObjectId, ref: "Staff" },
  },
  { timestamps: true }
);

creditNoteSchema.plugin(aggregatePaginate);

const CreditNote = mongoose.model("CreditNote", creditNoteSchema);

module.exports = CreditNote;
