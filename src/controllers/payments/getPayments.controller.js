const Payment = require("../../models/payment.model");
const mongoose = require("mongoose");
const normalizeDateRange = require("../../utils/normalize-date-range");

exports.getAllPayments = async (req, res) => {
  const { startDate, endDate, status, paymentMethod, paymentTypes, cashierId } =
    req.query;
  const matchStage = {};
  if (startDate || endDate) {
    matchStage.paymentDate = {};
    // i want to exclude time. or ensure it's start of day and end of day
    const { start, end } = normalizeDateRange(startDate, endDate);
    if (startDate) matchStage.paymentDate.$gte = start;
    if (endDate) matchStage.paymentDate.$lte = end;
  }
  if (status && status !== "all") {
    matchStage.status = status;
  }
  if (paymentMethod && paymentMethod !== "all") {
    matchStage.paymentMethod = paymentMethod;
  }
  if (paymentTypes && paymentTypes.length) {
    matchStage.paymentType = { $in: paymentTypes };
  }

  if (cashierId) {
    if (!mongoose.Types.ObjectId.isValid(cashierId)) {
      return res.status(400).json({ message: "Invalid cashier ID" });
    }
    matchStage.cashier = new mongoose.Types.ObjectId(cashierId);
  }

  try {
    // Fetch all payments with pagination
    const aggregate = Payment.aggregate([
      ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
      {
        $lookup: {
          from: "customers",
          localField: "customerId",
          foreignField: "_id",
          as: "customer",
        },
      },
      { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "staffs",
          localField: "cashier",
          foreignField: "_id",
          as: "cashier",
        },
      },
      { $unwind: { path: "$cashier" } },
      {
        $project: {
          "cashier.password": 0, // omit the password field
        },
      },
      { $sort: { paymentDate: -1 } },
    ]);

    // page: parseInt(req.query.page) || 1,
    // limit: parseInt(req.query.limit) || 10,
    const options = {
      limit: Number.MAX_SAFE_INTEGER, // effectively disables pagination
      page: 1,
    };

    const payments = await Payment.aggregatePaginate(aggregate, options);
    return res.status(200).json(payments);
  } catch (error) {
    console.error("Error fetching payments:", error);
    return res.status(500).json({ error: "Failed to get payments" });
  }
};

exports.getPaymentById = async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid payment ID" });
  }

  try {
    const payment = await Payment.findById(id).populate(
      "customerId referenceId cashier reversedBy"
    );
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    return res.status(200).json(payment);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to retrieve payment" });
  }
};
