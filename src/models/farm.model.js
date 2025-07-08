const mongoose = require('mongoose');
const Farmer = require('./farmer.model');

const farmSchema = new mongoose.Schema({
  farmName: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Farmer',
    required: true,
  },
  crops: [{
    type: String,
    required: true,
  }],
}, { timestamps: true });

module.exports = mongoose.model('Farm', farmSchema);
