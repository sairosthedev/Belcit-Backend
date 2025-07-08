const mongoose = require('mongoose');

const FinesSchema = new mongoose.Schema({
  offense: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: false,
  },
  amount: {
    type: Number,
    required: true,
  },
},{ timestamps: true });

const Fines = mongoose.model('Fines', FinesSchema);

module.exports = Fines;
