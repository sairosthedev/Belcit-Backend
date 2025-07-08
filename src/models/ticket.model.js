const mongoose = require("mongoose");
const { getDatePart, generateRef } = require("../utils/generate-ref");

const ticketSchema = new mongoose.Schema(
  {
    lineItemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LineItem",
      required: true,
    },
    billId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bill",
      required: true,
    },
    ticketType: {
      type: String,
      enum: ["parking", "toilet", "fine"],
      required: true,
    },
    status: {
      type: String,
      enum: ["checked-in", "checked-out", "completed"],
      default: "checked-in",
    },

    ticketNumber: { type: String, required: false, unique: true },
    // Shared metadata
    entryTime: { type: Date },
    exitTime: { type: Date },

    // Future extensibility for other metadata
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

ticketSchema.pre("save", async function (next) {
  if (this.isNew && !this.ticketNumber) {
    const period = await getDatePart();
    let prefix = "MKT-";
    switch (this.ticketType) {
      case "toilet":
        prefix = "MKT-";
        break;
      case "fine":
        prefix = "MKF-";
        break;
      case "parking":
        prefix = "MKP-";
        break;
      default:
        throw new Error("Invalid ticket type");
    }
    this.ticketNumber = await generateRef({
      type: "ticket",
      period: period,
      prefix,
    });
  }
  next();
});

module.exports = mongoose.model("Ticket", ticketSchema);
