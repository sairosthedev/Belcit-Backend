const mongoose = require('mongoose');

const reconciliationSchema = new mongoose.Schema({
  cashier: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  payments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Payment' }],

  // Summarized values by type
  summary: {
    cashTotal: { type: Number, default: 0 },
    bankTotal: { type: Number, default: 0 },
    mobileMoneyTotal: { type: Number, default: 0 },
  },

  // Expected vs actual
  expectedTotal: { type: Number, required: true },
  actualCountedTotal: { type: Number, required: true },
  discrepancy: { type: Number, default: 0 },

  remarks: String,
  closedAt: Date,
  createdAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model('Reconciliation', reconciliationSchema);
