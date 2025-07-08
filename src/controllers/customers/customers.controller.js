const billModel = require("../../models/bill.model");
const Customer = require("../../models/customer.model");
const mongoose = require("mongoose");
const Payment = require("../../models/payment.model");
const transactionsModel = require("../../models/transactions.model");
const { PAYMENT_STATUSES_ENUM } = require("../../config/payment-status");

const getAllCustomers = async (req, res) => {
  const { page = 1, limit = 10, customerTypes, searchTerm } = req.query;
  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
  };
  try {
    const matchStage = {};

    if (customerTypes?.length) {
      matchStage.customerType = { $in: customerTypes };
    }

    if (searchTerm) {
      matchStage.$or = [
        { firstName: { $regex: searchTerm, $options: "i" } },
        { lastName: { $regex: searchTerm, $options: "i" } },
      ];
    }

    // Fetch all customers with pagination
    const aggregate = Customer.aggregate([
      ...(Object.keys(matchStage).length ? [{ $match: matchStage }] : []),
      {
        $lookup: {
          from: "controlaccounts",
          localField: "controlAccountId",
          foreignField: "_id",
          as: "controlAccount",
        },
      },
      {
        $unwind: { path: "$controlAccount", preserveNullAndEmptyArrays: true },
      },
      // if customer is a trader, populate the trader field
      {
        $lookup: {
          from: "vendors",
          localField: "trader",
          foreignField: "_id",
          as: "trader",
        },
      },
      { $unwind: { path: "$trader", preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
    ]);

    const customers = await Customer.aggregatePaginate(aggregate, options);

    res.status(200).json(customers);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching customers",
      error: error.message,
    });
  }
};

const findCustomerById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid customer ID" });
    }

    const customer = await Customer.findById(id)
      .populate("controlAccountId")
      .populate("trader");

    if (!customer) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.status(200).json(customer);
  } catch (error) {
    res.status(500).json({
      message: "Error fetching customer",
      error: error.message,
    });
  }
};

const getCustomerAccountStatement = async (req, res) => {
  const { customerId } = req.params;
  const { startDate, endDate } = req.query;

  try {
    // 2. Get bills and payments by those customers
    const billDateFilter = {};
    const paymentDateFilter = {};

    if (startDate) {
      billDateFilter.$gte = new Date(startDate);
      paymentDateFilter.$gte = new Date(startDate);
    }
    if (endDate) {
      billDateFilter.$lte = new Date(endDate);
      paymentDateFilter.$lte = new Date(endDate);
    }

    const bills = await billModel.find({
      customerId,
      createdAt: Object.keys(billDateFilter).length
        ? billDateFilter
        : undefined,
    });

    const payments = await Payment.find({
      customerId,
      paymentDate: Object.keys(paymentDateFilter).length
        ? paymentDateFilter
        : undefined,
      status: {
        $in: [
          PAYMENT_STATUSES_ENUM.PAID,
          PAYMENT_STATUSES_ENUM.REFUND,
          PAYMENT_STATUSES_ENUM.REFUNDED,
          PAYMENT_STATUSES_ENUM.REVERSAL,
          PAYMENT_STATUSES_ENUM.REVERSED,
        ],
      },
    });

    const allRefIds = [...bills, ...payments].map((d) => d._id);
    const transactions = await transactionsModel.find({
      reference: { $in: allRefIds },
    });

    const postDateMap = new Map();
    transactions.forEach((tx) => {
      const refId = tx.reference.toString();
      if (!postDateMap.has(refId) || tx.postDate < postDateMap.get(refId)) {
        postDateMap.set(refId, tx.postDate);
      }
    });

    const statementEntries = [
      ...bills.map((bill) => ({
        date: postDateMap.get(bill._id.toString()) || bill.createdAt,
        type: "Bill",
        reference: bill._id,
        amount: bill.amount,
        debit: bill.amount,
        credit: 0,
        description: bill.description,
        transactionType: "bill",
        status: bill.status,
      })),
      ...payments.map((payment) => ({
        date: postDateMap.get(payment._id.toString()) || payment.paymentDate,
        type: "bill payment",
        reference: payment._id,
        amount: -payment.amount,
        debit: 0,
        credit: payment.amount,
        description: payment.description,
        transactionType: "Payment",
        status: payment.status,
      })),
    ];

    // 4. Sort and compute running balance
    statementEntries.sort((a, b) => new Date(a.date) - new Date(b.date));

    let runningBalance = 0;
    const finalStatement = statementEntries.map((entry) => {
      runningBalance += entry.debit - entry.credit;
      return { ...entry, runningBalance };
    });

    return res.status(200).json(finalStatement);
  } catch (error) {
    console.error("Error generating account statement:", error);
    return res.status(500).json({
      message: "Internal server error while generating account statement",
      error: error.message,
    });
  }
};

module.exports = {
  getAllCustomers,
  findCustomerById,
  getCustomerAccountStatement,
};
