const { PaymentMethod } = require("../../models/payment-methods.model");
const ControlAccount = require("../../models/control-account.model");

// Helper to validate control account existence
const validateControlAccount = async (controlAccountId) => {
  if (!controlAccountId) return false;
  const account = await ControlAccount.findById(controlAccountId);
  return !!account;
};

// Create a new payment method
exports.createPaymentMethod = async (req, res) => {
  try {
    const { name, label, isDeferred, category, controlAccountId } = req.body;

    // Validate required fields
    if (!name || !controlAccountId || !label || !category)
      return res.status(400).json({
        message:
          "Name, Label, isDeferred, Category and controlAccountId are required",
      });

    // Validate controlAccountId exists
    const exists = await validateControlAccount(controlAccountId);
    if (!exists)
      return res
        .status(400)
        .json({ message: "Invalid controlAccountId — not found in system" });

    const method = await PaymentMethod.create(req.body);
    return res.status(201).json(method);
  } catch (err) {
    console.error("Create PaymentMethod error:", err);
    return res.status(400).json({ message: err.message });
  }
};

// Get all payment methods
exports.getAllPaymentMethods = async (req, res) => {
  const { isDeferred, isActive } = req.query;
  const query = {};
  if (isDeferred) query.isDeferred = isDeferred === "true";

  if (isActive) query.isActive = isActive === "true";
  try {
    const methods = await PaymentMethod.find(query).populate(
      "controlAccountId"
    );
    return res.status(200).json(methods);
  } catch (err) {
    console.error("Fetch PaymentMethods error:", err);
    return res.status(500).json({ message: "Failed to fetch payment methods" });
  }

  try {
    const methods = await PaymentMethod.find().populate("controlAccountId");
    return res.status(200).json(methods);
  } catch (err) {
    console.error("Fetch PaymentMethods error:", err);
    return res.status(500).json({ message: "Failed to fetch payment methods" });
  }
};

// Get one payment method by ID
exports.getPaymentMethodById = async (req, res) => {
  try {
    const method = await PaymentMethod.findById(req.params.id).populate(
      "controlAccountId"
    );
    if (!method)
      return res.status(404).json({ message: "Payment method not found" });
    return res.status(200).json(method);
  } catch (err) {
    console.error("Get PaymentMethod error:", err);
    return res.status(500).json({ message: "Failed to get payment method" });
  }
};

// Update a payment method
exports.updatePaymentMethod = async (req, res) => {
  try {
    const { controlAccountId } = req.body;

    // If controlAccountId is provided, validate it
    if (controlAccountId) {
      const exists = await validateControlAccount(controlAccountId);
      if (!exists)
        return res
          .status(400)
          .json({ message: "Invalid controlAccountId — not found in system" });
    }

    const method = await PaymentMethod.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!method)
      return res.status(404).json({ message: "Payment method not found" });
    return res.status(200).json(method);
  } catch (err) {
    console.error("Update PaymentMethod error:", err);
    return res.status(400).json({ message: err.message });
  }
};

// Delete a payment method
exports.deletePaymentMethod = async (req, res) => {
  try {
    const method = await PaymentMethod.findByIdAndDelete(req.params.id);
    if (!method)
      return res.status(404).json({ message: "Payment method not found" });
    return res.status(200).json({ message: "Payment method deleted" });
  } catch (err) {
    console.error("Delete PaymentMethod error:", err);
    return res.status(500).json({ message: "Failed to delete payment method" });
  }
};
