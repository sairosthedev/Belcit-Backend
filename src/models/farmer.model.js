const mongoose = require('mongoose');

const farmerSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  idNumber: {
    type: String,
    required: true,
    unique: true,
  },
  gender: {
    type: String,
    enum: ['male', 'female'],
    required: true,
  },
  email: {
    type: String,
    required: false,
    unique: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: false,
  },
  dob: {
    type: Date,
    required: false,
  },
  farms: [{
    id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Farm'
    },
    farmName: {
        type: String,
        required: true
    },
  }],
}, { timestamps: true });

module.exports = mongoose.model('Farmer', farmerSchema);
