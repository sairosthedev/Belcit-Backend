// models/customer-prepayment.model.js
const mongoose = require('mongoose');

const CustomerPrepaymentSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  originalPaymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', required: true },
  remainingBalance: { type: Number, required: true },
  status: { type: String, enum: ['available', 'used', 'refunded'], default: 'available' },
  createdAt: { type: Date, default: Date.now },
  appliedPayments: [{
    billId: { type: mongoose.Schema.Types.ObjectId, ref: 'Bill' },
    amount: Number,
    appliedAt: Date
  }]
});

module.exports = mongoose.model('CustomerPrepayment', CustomerPrepaymentSchema);