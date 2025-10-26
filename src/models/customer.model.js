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
  
  // Loyalty Program Fields
  loyaltyPoints: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  visitCount: { type: Number, default: 0 },
  lastVisit: { type: Date },
  
  // Customer Preferences
  marketingOptIn: { type: Boolean, default: true },
  smsOptIn: { type: Boolean, default: false },
  emailOptIn: { type: Boolean, default: true },
  
  // Feedback tracking
  rating: { type: Number, min: 1, max: 5 },
  feedback: { type: String },
  feedbackDate: { type: Date },
});

customerSchema.plugin(aggregatePaginate);

module.exports = mongoose.model("Customer", customerSchema);
