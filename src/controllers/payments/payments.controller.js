const Payment = require("../../models/payment.model");
const {
  SUPPORTED_PAYMENT_METHODS,
} = require("../../config/payment-methods");
const {
  PAYMENT_TYPES,
  PAYMENT_TYPES_ENUM,
} = require("../../config/payment-type");
const { PAYMENT_STATUSES_ENUM } = require("../../config/payment-status");
const Staff = require("../../models/staff.model");

exports.createPayment = async (req, res) => {
  try {
    const { saleId, amount, paymentMethod, paymentType } = req.body;
    // Validate payment method
    if (!SUPPORTED_PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({ error: "Invalid payment method" });
    }
    // Validate payment type
    if (!PAYMENT_TYPES.includes(paymentType)) {
      return res.status(400).json({ error: "Invalid payment type" });
    }
    // Optionally validate saleId exists (if you have a Sale model)
    // const sale = await Sale.findById(saleId);
    // if (!sale) return res.status(400).json({ error: "Sale not found" });
    const user = await Staff.findById(req.user.userId);
    if (!user) return res.status(400).json({ error: "User not found" });
    const payment = await Payment.create({
      saleId,
      amount,
      paymentMethod,
      paymentType,
      status: PAYMENT_STATUSES_ENUM.PAID,
      cashier: user._id,
    });
    res.status(201).json(payment);
  } catch (err) {
    res.status(500).json({ message: "Payment failed", error: err.message });
  }
};
