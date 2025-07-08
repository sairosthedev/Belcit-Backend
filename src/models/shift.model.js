const mongoose = require('mongoose');
const Staff = require('./staff.model'); 

const shiftSchema = new mongoose.Schema({
  cashier: {
    id: {
      type: mongoose.Schema.Types.ObjectId, 
      required: true,
      ref: 'Staff'
    },
    username: {
      type: String,
      required: true
    }
  },
  startTime: {
    type: Date,
    default: Date.now,
    required: true
  },
  endTime: {
    type: Date,
    required: false
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  expectedAmount: {
    type: Number,
    required: true,
    default: 0
  },
  amountReceived: {
    type: Number,
    required: true,
    default: 0
  },
  surplus: {
    type: Number,
    required: true,
    default: 0
  },
  deficit: {
    type: Number,
    required: true,
    default: 0
  }
}, { timestamps: true });

shiftSchema.methods.endShift = function() {
  this.endTime = Date.now();
  this.status = 'inactive';
  return this.save();
};

module.exports = mongoose.model('Shift', shiftSchema);
