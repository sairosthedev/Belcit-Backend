const mongoose = require("mongoose");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const transactionSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ControlAccount",
      required: true,
    }, // this is the account name
    description: { type: String, required: true }, // Description of the transaction
    debit: { type: Number, required: true },
    credit: { type: Number, required: true },
    sourceRef: { type: String }, // e.g. CRN-20240512-0001
    reference: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "referenceModel",
      required: true,
    },
    referenceModel: {
      type: String,
      required: true,
      enum: ["Bill", "Payment", "CreditNote", "CustomerPrepayment", "Transfer"],
    },
    transactionType: {
      type: String,
      required: true,
      enum: [
        "bill",
        "payment",
        "credit-note",
        "adjustment",
        "accrual",
        "transfer",
        "reversal",
        "refund",
      ],
    },
    postDate: { type: Date, default: Date.now },
    tnxDate: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

transactionSchema.pre("validate", function (next) {
  if (this.debit > 0 && this.credit > 0) {
    return next(
      new Error("Transaction cannot have both debit and credit values.")
    );
  }
  if (this.debit === 0 && this.credit === 0) {
    return next(new Error("Transaction must have a debit or a credit value."));
  }
  next();
});

transactionSchema.plugin(aggregatePaginate);

module.exports = mongoose.model("Transaction", transactionSchema);
