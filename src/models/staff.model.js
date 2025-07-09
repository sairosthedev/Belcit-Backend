const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const staffSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  idNumber: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  picture: {
    type: String,
    required: false,
    default: ""
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['superAdmin', 'cashier', 'manager', 'stockClerk', 'admin'],
    required: true
  },
  phonenumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false,
    unique: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
}, { timestamps: true });

staffSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Method to compare password
staffSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Staff', staffSchema);