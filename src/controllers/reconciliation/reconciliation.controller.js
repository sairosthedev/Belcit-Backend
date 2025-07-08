const Payment = require("../../models/payment.model");
const Reconciliation = require("../../models/reconciliation.model");
const Shift = require("../../models/shift.model");
const moment = require("moment");

exports.createReconciliation = async (req, res) => {
  const { cashierId, date, actualCountedTotal } = req.body;

  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  const existing = await Reconciliation.findOne({
    cashier: cashierId,
    date: startOfDay,
  });
  if (existing) {
    return res
      .status(400)
      .json({ message: "Reconciliation already exists for this day" });
  }

  // Get all payments made by the cashier for the day
  const payments = await Payment.find({
    cashier: cashierId,
    paymentDate: { $gte: startOfDay, $lte: endOfDay },
  });

  const expectedTotal = payments.reduce((sum, p) => sum + p.amount, 0);

  const cashTotal = payments
    .filter((p) => p.paymentMethod === "cash")
    .reduce((sum, p) => sum + p.amount, 0);

  const bankTotal = payments
    .filter((p) => p.paymentMethod === "bank-transfer")
    .reduce((sum, p) => sum + p.amount, 0);

  const mobileMoneyTotal = payments
    .filter((p) => p.paymentMethod === "mobile-money")
    .reduce((sum, p) => sum + p.amount, 0);

  const discrepancy = actualCountedTotal - expectedTotal;

  const reconciliation = await Reconciliation.create({
    cashier: cashierId,
    date: startOfDay,
    payments: payments.map((p) => p._id),
    expectedTotal,
    actualCountedTotal,
    discrepancy,
    summary: { cashTotal, bankTotal, mobileMoneyTotal },
    closedAt: new Date(),
  });

  return res.status(201).json(reconciliation);
};
exports.getAllReconciliations = async (req, res) => {
  try {
    const reconciliations = await Reconciliation.find();
    res.status(200).json(reconciliations);
  } catch (error) {
    console.error("Error fetching reconciliations:", error);
    res.status(500).json({
      error: "Failed to fetch reconciliations",
      details: error.message,
    });
  }
};

// New function to get reconciliations by date and cashier ID
exports.getReconciliationsByDateAndCashier = async (req, res) => {
  const { cashierId } = req.params;
  const { date } = req.query; // Expecting date in query string

  const startOfDay = moment(date).startOf("day").toDate();
  const endOfDay = moment(date).endOf("day").toDate();

  try {
    const reconciliations = await Reconciliation.find({
      "cashier.id": cashierId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    if (!reconciliations.length) {
      return res.status(404).json({
        error:
          "No reconciliations found for this cashier on the specified date.",
      });
    }

    res.status(200).json(reconciliations);
  } catch (error) {
    console.error("Error fetching reconciliations:", error);
    res.status(500).json({
      error: "Failed to fetch reconciliations",
      details: error.message,
    });
  }
};

// New function to get all reconciliations by date period
exports.getReconciliationsByDatePeriod = async (req, res) => {
  const { startDate, endDate } = req.query; // Expecting startDate and endDate in query string

  const start = moment(startDate).startOf("day").toDate();
  const end = moment(endDate).endOf("day").toDate();

  try {
    const reconciliations = await Reconciliation.find({
      createdAt: { $gte: start, $lte: end },
    });

    if (!reconciliations.length) {
      return res.status(404).json({
        error: "No reconciliations found in the specified date period.",
      });
    }

    res.status(200).json(reconciliations);
  } catch (error) {
    console.error("Error fetching reconciliations:", error);
    res.status(500).json({
      error: "Failed to fetch reconciliations",
      details: error.message,
    });
  }
};
