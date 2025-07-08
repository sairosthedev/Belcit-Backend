const ControlAccount = require("../../models/control-account.model");
const Transaction = require("../../models/transactions.model");
const Transfer = require("../../models/transfer.model");
const { seed } = require("../../services/control-accounts-seed");
const { ACCOUNT_TYPES } = require("../../config/account-types");

const mongoose = require("mongoose");
const { postJournalEntry } = require("../../utils/transactions");

const seedControlAccounts = async (req, res) => {
  try {
    // Seed control accounts
    const seededAccounts = await seed();

    res.status(201).json({
      message: "Control accounts seeded successfully",
      data: seededAccounts,
    });
  } catch (error) {
    console.error("Error seeding control accounts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getControlAccounts = async (req, res) => {
  const { accountTypes } = req.query;
  const match = {};
  if (accountTypes) {
    match.accountType = { $in: accountTypes };
  }
  try {
    const controlAccounts = await ControlAccount.find(match).sort({
      createdAt: -1,
    });
    res.status(200).json(controlAccounts);
  } catch (error) {
    console.error("Error fetching control accounts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getControlAccountById = async (req, res) => {
  const { id } = req.params;
  try {
    const controlAccount = await ControlAccount.findById(id);
    if (!controlAccount) {
      return res.status(404).json({ message: "Control account not found" });
    }
    res.status(200).json(controlAccount);
  } catch (error) {
    console.error("Error fetching control accounts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createControlAccount = async (req, res) => {
  try {
    const { accountName, accountType, code } = req.body;

    // Validate input
    if (!accountName || !accountType || !code) {
      return res
        .status(400)
        .json({ message: "accountName, code and accountType  are required" });
    }

    // Check if the account accountType is valid
    if (!ACCOUNT_TYPES.includes(accountType)) {
      return res.status(400).json({ message: "Invalid account accountType" });
    }

    // Create the control account
    const newControlAccount = new ControlAccount({
      accountName,
      accountType,
      code,
    });

    await newControlAccount.save();
    res.status(201).json({
      message: "Control account created successfully",
      controlAccount: newControlAccount,
    });
  } catch (error) {
    console.error("Error creating control account:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateControlAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const { accountName, accountType, code } = req.body;

    // Validate input
    if (!accountName || !accountType || !code) {
      return res
        .status(400)
        .json({ message: "accountName, code and accountType  are required" });
    }

    // Check if the account accountType is valid
    if (!ACCOUNT_TYPES.includes(accountType)) {
      return res.status(400).json({ message: "Invalid account accountType" });
    }

    // Update the control account
    const updatedControlAccount = await ControlAccount.findByIdAndUpdate(
      id,
      { accountName, accountType, code },
      { new: true }
    );

    if (!updatedControlAccount) {
      return res.status(404).json({ message: "Control account not found" });
    }

    res.status(200).json({
      message: "Control account updated successfully",
      controlAccount: updatedControlAccount,
    });
  } catch (error) {
    console.error("Error updating control account:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getTrialBalance = async (req, res) => {
  try {
    const accounts = await ControlAccount.find().lean();

    const trialBalance = accounts.map((account) => {
      const net = account.totalDebit - account.totalCredit;
      return {
        code: account.code,
        accountName: account.accountName,
        accountType: account.accountType,
        debit: net > 0 ? net : 0,
        credit: net < 0 ? Math.abs(net) : 0,
      };
    });

    // Optional total check
    const totalDebit = trialBalance.reduce((sum, a) => sum + a.debit, 0);
    const totalCredit = trialBalance.reduce((sum, a) => sum + a.credit, 0);

    res.status(200).json({
      trialBalance,
      totalDebit,
      totalCredit,
      balanced: totalDebit === totalCredit,
    });
  } catch (err) {
    console.error("Failed to generate trial balance", err);
    res.status(500).json({ message: "Failed to generate trial balance" });
  }
};

const getLedgerSummary = async (req, res) => {
  const { accountId, startDate, endDate, transactionType } = req.query;
  const matchStage = {};

  if (accountId && accountId !== "all") {
    matchStage.accountId = new mongoose.Types.ObjectId(accountId);
  }
  if (startDate || endDate) {
    matchStage.tnxDate = {};
    if (startDate) matchStage.tnxDate.$gte = new Date(startDate);
    if (endDate) matchStage.tnxDate.$lte = new Date(endDate);
  }
  if (transactionType && transactionType !== "all") {
    matchStage.transactionType = transactionType;
  }
  try {
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

    const options = {
      page: parseInt(req.query.page) || 1,
      limit: Number.MAX_SAFE_INTEGER, //parseInt(req.query.limit) || 10,
    };

    const transactions = await Transaction.aggregatePaginate(
      aggregate,
      options
    );
    let runningBalance = 0;
    const { docs, ...rest } = transactions;
    const statement = docs.map((tx) => {
      const debit = tx.debit || 0;
      const credit = tx.credit || 0;
      runningBalance += debit - credit;

      return {
        _id: tx._id,
        date: tx.postDate,
        account: tx.account.accountName,
        accountId: tx.account._id,
        description: tx.description || "Transaction",
        transactionType: tx.transactionType || "Bill",
        referenceId: tx.reference?._id,
        sourceRef: tx?.sourceRef,
        debit,
        credit,
        runningBalance,
      };
    });
    return res.status(200).json({ docs: statement, ...rest });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({ error: "Failed to get transactions" });
  }
};

const transferToAccount = async (re, res) => {
  const { fromAccountId, toAccountId, amount, memo } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();
  const userId = req.user.userId; // Assuming user ID is available in req.user

  if (!fromAccountId || !toAccountId || !amount || !userId) {
    return res.status(400).json({
      message: "fromAccountId, toAccountId, userId and amount are required",
    });
  }

  try {
    // Create debit transaction for fromAccount
    const fromControlAccount = await ControlAccount.findById(
      fromAccountId
    ).session(session);
    if (!fromControlAccount) {
      throw new Error("From account not found");
    }
    const toControlAccount = await ControlAccount.findById(toAccountId).session(
      session
    );
    if (!toControlAccount) {
      throw new Error("To account not found");
    }
    const transfer = await new Transfer({
      fromAccount: fromControlAccount._id, // Cash
      toAccount: toControlAccount._id, // Bank
      amount: 100,
      currency: "USD",
      transferDate: new Date(),
      createdBy: userId,
      memo,
    }).save({ session });

    const journalEntries = [
      {
        accountId: toControlAccount._id,
        debit: transfer.amount,
        credit: 0,
        transactionType: "transfer",
        referenceModel: "Transfer",
        reference: transfer._id,
        description: `Transfer from ${fromControlAccount.name} to ${toControlAccount.name}`,
      },
      {
        accountId: fromControlAccount._id,
        debit: 0,
        credit: transfer.amount,
        transactionType: "transfer",
        referenceModel: "Transfer",
        reference: transfer._id,
        description: `Transfer from ${fromControlAccount.name} to ${toControlAccount.name}`,
      },
    ];

    await postJournalEntry(journalEntries, session);

    session.commitTransaction();
    session.endSession();
    res.status(201).json({
      message: "Transfer completed successfully",
      transfer,
    });
  } catch (error) {
    session.abortTransaction();
    session.endSession();
    console.error("Error transferring between accounts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  getLedgerSummary,
  seedControlAccounts,
  getControlAccounts,
  createControlAccount,
  updateControlAccount,
  getTrialBalance,
  getControlAccountById,
  transferToAccount,
};
