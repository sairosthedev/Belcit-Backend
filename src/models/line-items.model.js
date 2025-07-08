const mongoose = require("mongoose");
const { ITEM_GROUPS, ITEM_GROUPS_ENUM } = require("../config/item-groups");

const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const lineItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: { type: String, required: false }, // Description of the line item
    quantity: { type: Number, required: true, min: 1 }, // Quantity of the line item
    amount: { type: Number, default: null }, // Optional amount for the line item
    stall: { type: mongoose.Schema.Types.ObjectId, ref: "Stall" }, // Reference to the associated stall
    lease: { type: mongoose.Schema.Types.ObjectId, ref: "Lease" },
    itemGroup: {
      type: String,
      enum: ITEM_GROUPS,
      default: ITEM_GROUPS_ENUM.TICKET,
    }, // Group to which the line item belongs
    unit: { type: String, required: true }, // Unit of the line item (e.g., kg, pcs, hourly, use, weekly etc.)
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ControlAccount",
      required: true,
    }, // which account this line item is going to be posted to
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

lineItemSchema.plugin(aggregatePaginate);

module.exports = mongoose.model("LineItem", lineItemSchema);
