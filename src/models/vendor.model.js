const mongoose = require('mongoose');

const vendorSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: false,
    },
    last_name: {
      type: String,
      required: false,
    },
    id_number: {
      type: String,
      required: false,
    },
    gender: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: false,
    },
    phone: {
      type: String,
      required: false,
    },
    address_line1: {
      type: String,
      required: false,
      default: "",
    },
    address_line2: {
      type: String,
      required: false,
      default: "",
    },
    city: {
      type: String,
      required: false,
      default: "",
    },
    dob: {
      type: Date,
      required: false,
    },
    account_balance: {
      type: Number,
      required: false,
      default: 0,
    },
    picture: {
      type: String,
      required: false,
      default: "",
    },
    id_document: {
      type: Boolean,
      required: false,
    },
    proof_of_residence: {
      type: Boolean,
      required: false,
    },
    verification_status: {
      type: String,
      required: false,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    verified_at: {
      type: Date,
      required: false,
    },
    verified_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: false,
    },
    category: {
      type: String,
      required: false,
      enum: [
        "electrical",
        "dryGoods",
        "fruitsAndVeggies",
        "clothing",
        "packagingMaterials",
        "others"
      ],
    },
    onboarded: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Vendor', vendorSchema);