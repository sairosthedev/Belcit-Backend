const Transaction = require("../models/transactions.model");
const ControlAccount = require("../models/control-account.model");
const Setting = require("../models/settings.model");
const { PaymentMethod } = require("../models/payment-methods.model");

async function isInstantPayment(method, session) {
  try {
    const paymentMethod = await PaymentMethod.findOne({ name: method }).session(
      session
    );
    if (!paymentMethod) {
      throw new Error(`Payment method ${paymentMethod} not found`);
    }

    return !paymentMethod.isDeferred;
  } catch (error) {
    console.error("Error checking payment method:", error);
    throw new Error("Error checking payment method");
  }
}

function isTransactionBatchBalanced(transactions) {
  const totalDebit = transactions.reduce((sum, t) => sum + (t.debit || 0), 0);
  const totalCredit = transactions.reduce((sum, t) => sum + (t.credit || 0), 0);
  console.log(totalDebit, totalCredit);

  return totalDebit === totalCredit;
}

async function postJournalEntry(entries, session) {
  const isBalanced = isTransactionBatchBalanced(entries);

  if (!isBalanced) {
    throw new Error("Journal entries are not balanced: DR ≠ CR");
  }

  // Insert all entries
  await Transaction.insertMany(entries, { session });

  // Update ControlAccount balances
  for (const e of entries) {
    const update = {};
    if (e.debit > 0) update.$inc = { totalDebit: e.debit };
    if (e.credit > 0) update.$inc = { totalCredit: e.credit };

    await ControlAccount.findByIdAndUpdate(e.accountId, update, { session });
  }
}

async function getAccrualsAccountId(session) {
  // get accruals account id from settings...
  const setting = await Setting.findOne({
    key: "customerOverpayAccount",
  }).session(session);
  let accrualsAccount = null;
  if (setting) {
    accrualsAccount = await ControlAccount.findOne({
      _id: setting.value,
    }).session(session);
    if (!accrualsAccount) {
      accrualsAccount = await ControlAccount.findOne({
        accountName: "Accruals", // or whatever your accruals account is called
      }).session(session);
    }
  }
  if (!accrualsAccount) {
    throw new Error("Accruals account not found");
  }
  return accrualsAccount._id;
}

module.exports = {
  postJournalEntry,
  isTransactionBatchBalanced,
  isInstantPayment,
  getAccrualsAccountId,
};
