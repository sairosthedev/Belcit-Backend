const mongoose = require("mongoose");
const Customer = require("../models/customer.model");

// Only customer-related types now
const CUSTOMER_AFFECTING_TYPES = ["rent", "deposit"];

/**
 * Decides whether customer balances should be updated.
 * @param {string} type - The payment or bill type
 * @returns {Object} update flags
 */
function getBalanceUpdateFlags(type) {
  return {
    updateCustomer: true, // always true
    updateLease: false, // lease logic removed
  };
}

/**
 * Updates customer balances after billing or payment.
 *
 * @param {Object} params
 * @param {mongoose.Types.ObjectId} params.customerId
 * @param {Number} params.amount - Positive number
 * @param {'bill'|'payment'} params.type - Whether it's a bill (increase) or payment (reduce)
 * @param {mongoose.ClientSession} session - Mongoose session for transaction
 */
async function updateLeaseAndCustomerBalances(
  { customerId, amount, type },
  session
) {
  if (!["bill", "payment"].includes(type)) {
    throw new Error(
      `Invalid update type "${type}". Expected 'bill' or 'payment'.`
    );
  }

  const operator = type === "bill" ? 1 : -1;
  const delta = operator * Math.abs(amount);

  const updates = [];

  if (customerId) {
    updates.push(
      Customer.findByIdAndUpdate(
        customerId,
        { $inc: { dcBalance: delta } },
        { session }
      )
    );
  }

  await Promise.all(updates);
}

module.exports = { updateLeaseAndCustomerBalances, getBalanceUpdateFlags };
