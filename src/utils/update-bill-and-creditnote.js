const Bill = require("../models/bill.model");
const CreditNote = require("../models/credit-note.model");
const CustomerPrepayment = require("../models/customer-prepayment.model"); // You'll need to create this model

/**
 * Updates outstanding amount and paid status for a bill or credit note after a payment.
 * @param {Object} payment - The payment document
 * @param {'Bill'|'CreditNote'} referenceType - 'Bill' or 'CreditNote'
 * @param {mongoose.ClientSession} session - MongoDB session
 * @returns {Promise<{appliedAmount: number, excessAmount: number}>} - Returns the amount applied to bill and any excess
 */
async function updateBillOrCreditNoteStatus(payment, referenceType, session) {
  let model;
  if (referenceType === "Bill") {
    model = Bill;
  } else if (referenceType === "CreditNote") {
    model = CreditNote;
  } else {
    throw new Error("Invalid reference type");
  }

  const referenceId = payment.referenceId;
  const doc = await model.findById(referenceId).session(session);
  if (!doc) throw new Error(`${referenceType} not found`);

  const isReversalOrRefund = ["reversed", "refunded"].includes(payment.status);

  // Calculate how much to apply or reverse (limited to original amount paid)
  // convert the payment amount to a positive value for reversals/refunds
  const paymentAmount = payment.amount;
  let amountPaid = doc.amount - doc.outstanding;
  const appliedAmount = Math.min(
    paymentAmount,
    isReversalOrRefund ? amountPaid : doc.outstanding
  );
  const excessAmount = paymentAmount - appliedAmount;

  if (isReversalOrRefund) {
    // Handle reversal/refund logic
    doc.outstanding +=  Math.abs(appliedAmount);
    amountPaid = Math.max(0, amountPaid - appliedAmount);

    // Update status accordingly
    doc.status = amountPaid === 0 ? "unpaid" : "partially-paid";
  } else {
    // Handle normal payment logic
    if (appliedAmount > 0) {
      doc.outstanding = Math.max(0, doc.outstanding - appliedAmount);
      doc.type = payment.paymentType;

      doc.status = doc.outstanding === 0 ? "paid" : "partially-paid";
    }

    // If there's excess payment, create a prepayment record
    if (excessAmount > 0 && referenceType === "Bill") {
      await CustomerPrepayment.create(
        [
          {
            customerId: payment.customerId,
            amount: excessAmount,
            currency: payment.fxCurrencyCode || "USD",
            originalPaymentId: payment._id,
            remainingBalance: excessAmount,
            status: "available",
            createdAt: new Date(),
          },
        ],
        { session }
      );
    }
  }

  await doc.save({ session });

  return { appliedAmount, excessAmount };
}

module.exports = { updateBillOrCreditNoteStatus };
