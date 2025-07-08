const mongoose = require("mongoose");
const aggregatePaginate = require("mongoose-aggregate-paginate-v2");

const customerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  contactInfo: { type: String },
  dcBalance: { type: Number, default: 0 },
  email: { type: String },
  phone: { type: String },
  address: {
    line1: { type: String },
    line2: { type: String },
    city: { type: String },
  },
  phoneNumber: { type: String },
  idNumber: { type: String },
  customerType: {
    type: String,
    enum: ["walk-in", "trader", "buyer"],
    required: true,
  },
  trader: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
  controlAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ControlAccount",
  },
});

customerSchema.plugin(aggregatePaginate);

module.exports = mongoose.model("Customer", customerSchema);
