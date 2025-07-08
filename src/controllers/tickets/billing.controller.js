const mongoose = require("mongoose");
const LineItem = require("../../models/line-items.model");
const Bill = require("../../models/bill.model");
const Customer = require("../../models/customer.model");
const { postJournalEntry } = require("../../utils/transactions");
const Transaction = require("../../models/transactions.model");
const Payment = require("../../models/payment.model");
const {
  getBalanceUpdateFlags,
  updateLeaseAndCustomerBalances,
} = require("../../utils/update-balances");
const ControlAccount = require("../../models/control-account.model");

const generateBill = async (req, res, postedSession = null) => {
  // line item has to be modified to include {quantity, amount and unit }
  const { lineItems, customerId, type, description, dueDate } = req.body;
  const user = req.user;
  const session = postedSession || (await mongoose.startSession());
  let ownsSession = !postedSession;

  if (ownsSession) session.startTransaction();

  try {
    // now let's begin our validations..
    // first we look up the line items
    const lineItemDetails = await LineItem.find({
      _id: { $in: lineItems },
    }).session(session);

    if (!lineItemDetails || lineItemDetails.length === 0) {
      throw new Error("Line items not found");
    }
    // find control account associated with each lineItem.
    const enrichedLineItems = await Promise.all(
      lineItemDetails.map(async (lineItem) => {
        const controlAccount = await ControlAccount.findById(
          lineItem.accountId
        ).session(session);
        if (!controlAccount) {
          throw new Error(
            `Control account not found for line item ${lineItem._id}`
          );
        }
        const amount = lineItem.quantity * lineItem.amount;

        return {
          ...lineItem,
          amount,
          controlAccountId: controlAccount._id,
        };
      })
    );
    // now let's check if the customer exists
    const customer = await Customer.findById(customerId).session(session);
    if (!customer) {
      throw new Error("Customer not found");
    }

    if (!type) {
      throw new Error("Type is required");
    }

    // calculate bill total amount
    const totalAmount = enrichedLineItems.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    let billDueDate = dueDate;
    if (!billDueDate) {
      const today = new Date();
      if (type === "rent") {
        // add 1 week to today
        billDueDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 7
        );
      } else if (type === "fine" || type === "toilet" || type === "parking") {
        // should be paid immediately
        billDueDate = today;
      } else {
        billDueDate = new Date(
          today.getFullYear(),
          today.getMonth(),
          today.getDate() + 30
        );
      }
    }

    const bill = await new Bill({
      billNumber: "",
      lineItems: enrichedLineItems,
      customerId: customer._id,
      amount: totalAmount,
      outstanding: totalAmount,
      type,
      status: "unpaid",
      createdBy: user.userId,
      dueDate: billDueDate,
    }).save({ session });

    // const lastUpdated = new Date();
    // journal entries
    const transactions = [
      {
        accountId: customer.controlAccountId,
        reference: bill._id,
        description: description ?? `Bill for ${customer._id}`,
        sourceRef: bill.billNumber,
        transactionType: "bill",
        referenceModel: "Bill",
        tnxDate: new Date(),
        debit: totalAmount,
        credit: 0,
      },
      ...enrichedLineItems.map((item) => ({
        accountId: item.controlAccountId,
        description: description ?? `Bill for ${customer._id}`,
        sourceRef: bill.billNumber,
        transactionType: "bill",
        referenceModel: "Bill",
        tnxDate: new Date(),
        credit: item.amount,
        debit: 0,
        reference: bill._id,
      })),
    ];

    const { updateCustomer } = getBalanceUpdateFlags(type);

    await updateLeaseAndCustomerBalances(
      {
        customerId: updateCustomer ? customerId : null,
        amount: totalAmount,
        type: "bill",
      },
      session
    );

    // now let's create the bill link to ledgerControlAccount;
    await postJournalEntry(transactions, session);

    // if customer has credit overpayments
    // After creating a bill
    // const remainingBalance = await applyPrepaymentToBill(customerId, bill._id, session);
    // if (remainingBalance > 0) {
    //   // Notify customer about remaining balance
    // }

    if (ownsSession) {
      await session.commitTransaction();
      session.endSession();
      res.status(201).json({ message: "Bill created successfully", bill });
    }

    return { success: true, bill };
  } catch (error) {
    console.log(error);
    await session.abortTransaction();
    session.endSession();
    console.error("Transaction failed:", error);
    res
      .status(500)
      .json({ message: "Failed to create bill", error: error.message });
  }
};

const getBills = async (req, res) => {
  const { status, startDate, endDate, searchTerm } = req.query;
  const query = {};
  if (status && status !== "all") {
    query.status = status;
  }
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }
  if (searchTerm) {
    query.$or = [{ billNumber: { $regex: searchTerm, $options: "i" } }];
    if (mongoose.Types.ObjectId.isValid(searchTerm)) {
      query.$or.push({ customerId: new mongoose.Types.ObjectId(searchTerm) });
    }
  }

  try {
    const bills = await Bill.find(query)
      .sort({ createdAt: -1 })
      .populate("lineItems")
      .populate("customerId");
    res.status(200).json(bills);
  } catch (error) {
    console.error("Error fetching bills:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const findBillByNumber = async (req, res) => {
  const { billNumber } = req.params;
  try {
    const bill = await Bill.findOne({ billNumber })
      .populate("lineItems")
      .populate("customerId")
      .populate("payments");
    if (!bill) {
      return res.status(404).json({ message: "Bill not found" });
    }
    // const payments = await Payment.find({ referenceId: bill._id });
    //bill["payments"] = payments;
    res.status(200).json(bill);
  } catch (error) {
    console.error("Error fetching bill:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const findAllTransactions = async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 10 } = req.query;

    const matchStage = {};

    if (startDate || endDate) {
      matchStage.tnxDate = {};
      if (startDate) matchStage.tnxDate.$gte = new Date(startDate);
      if (endDate) matchStage.tnxDate.$lte = new Date(endDate);
    }

    const aggregate = Transaction.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "controlaccounts",
          localField: "accountId",
          foreignField: "_id",
          as: "account",
        },
      },
      { $unwind: "$account" },
      { $sort: { tnxDate: -1 } },
    ]);

    const options = {};
    // {
    //   page: parseInt(page),
    //   limit: parseInt(limit),
    // };

    const result = await Transaction.aggregatePaginate(aggregate, options);

    res.status(200).json(result);
  } catch (err) {
    console.error("Pagination error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const findAccountStatement = async (req, res) => {};

module.exports = {
  generateBill,
  getBills,
  findBillByNumber,
  findAllTransactions,
};
