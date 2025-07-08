const Payment = require("../../models/payment.model");
//const Currency = require("../../models/currency.model");
// const ExchangeRate = require("../../models/exchange.model");
const {
  SUPPORTED_PAYMENT_METHODS,
  PAYMENT_METHODS_ENUM,
} = require("../../config/payment-methods");
const {
  PAYMENT_TYPES,
  PAYMENT_TYPES_ENUM,
} = require("../../config/payment-type");
const {
  EcocashPayment,
  PaymentMethod,
} = require("../../models/payment-methods.model");
const { PAYMENT_STATUSES_ENUM } = require("../../config/payment-status");
const Staff = require("../../models/staff.model");
const Ticket = require("../../models/ticket.model");
const Customer = require("../../models/customer.model");
const Bill = require("../../models/bill.model");
const currencyModel = require("../../models/currency.model");
const ControlAccount = require("../../models/control-account.model");
const {
  postJournalEntry,
  isInstantPayment,
  getAccrualsAccountId,
} = require("../../utils/transactions");
const {
  getBalanceUpdateFlags,
  updateLeaseAndCustomerBalances,
} = require("../../utils/update-balances");
const {
  updateBillOrCreditNoteStatus,
} = require("../../utils/update-bill-and-creditnote");
const { updateTicketStatus } = require("../../utils/update-ticket");
const customerPrepaymentModel = require("../../models/customer-prepayment.model");
const mongoose = require("mongoose");
const transactionsModel = require("../../models/transactions.model");

// const saveEcocashPayment = async (paymentId, ecocashTransaction) => {
//   const { phoneNumber } = ecocashTransaction;

//   // create a new request to the ecocash api
//   // save response in the database
//   //

//   const ecocashPayment = new EcocashPayment({
//     payment: paymentId,
//     phoneNumber,
//   });

//   // let get the actual payment here...

//   try {
//     await ecocashPayment.save();
//     // we can short circuit payment status here for now, untill the ecocash api is working
//     //PAYMENT_STATUSES_ENUM.PAID;
//     const actualPayment = await Payment.findByIdAndUpdate(paymentId, {
//       $set: {
//         status: PAYMENT_STATUSES_ENUM.PAID,
//       },
//     });
//     return true;
//   } catch (error) {
//     console.error("Error saving ecocash payment:", error);
//   }
// };

// exports.makePayment = async (req, res) => {
//   const {
//     amount,
//     paymentMethod,
//     paymentType,
//     currency,
//     fxAmount,
//     fxRate,
//     fxCurrency,
//     ticketId,
//     cashierId,
//     referenceId,
//     ...rest
//   } = req.body;

//   // Validate payment method
//   if (!SUPPORTED_PAYMENT_METHODS.includes(paymentMethod)) {
//     return res.status(400).json({ error: "Invalid payment method" });
//   }

//   // Validate payment type
//   if (!PAYMENT_TYPES.includes(paymentType)) {
//     return res.status(400).json({
//       error: `Invalid payment type, only ${PAYMENT_TYPES.join(
//         ", "
//       )} are supported`,
//     });
//   }

//   // to check whether we should only accept payments for active leases
//   const lease = await Lease.findById(referenceId).populate("stall vendor");

//   if (req.body.payerType === "vendor" && !lease) {
//     return res.status(400).json({
//       error: "An active lease is required for vendor related payments",
//     });
//   }

//   try {
//     let foreignAmount, usedRate, usedFxCurrency;

//     // Only fetch exchange rate if fxAmount is not provided
//     const baseCurrency = await currencyModel.findOne({
//       isDefault: true,
//     });

//     if (!baseCurrency) {
//       return res.status(400).json({ error: "Base currency not found" });
//     }

//     const foreignCurrency = await currencyModel.findOne({
//       currencyCode: currency,
//       isActive: true,
//     });
//     if (!foreignCurrency) {
//       return res.status(400).json({ error: "Currency not supported" });
//     }
//     foreignAmount = amount * foreignCurrency.exchangeRate;
//     usedRate = foreignCurrency.exchangeRate;
//     usedFxCurrency = foreignCurrency.currencyCode;

//     const cashier = await Staff.findById(cashierId); // Fetch cashier details
//     if (!cashier) {
//       return res.status(400).json({ error: "Invalid cashier ID" });
//     }

//     const payment = new Payment({
//       amount,
//       fxAmount: fxAmount || foreignAmount,
//       fxRate: fxRate || usedRate,
//       fxCurrency: fxCurrency || usedFxCurrency,
//       currency: baseCurrency.currencyCode,
//       paymentMethod,
//       paymentType,
//       cashier: {
//         id: cashier._id,
//         username: cashier.username,
//       },
//       payerType: req.body.payerType || "walkin",
//       referenceId, // this could be ticket id or lease id.
//     });

//     if (
//       PAYMENT_TYPES_ENUM.RENT !== paymentType &&
//       paymentType !== PAYMENT_TYPES_ENUM.ONBOARDING
//     ) {
//       // Require ticketId for non-rental payments
//       payment.ticketId = ticketId;
//       // overide the reference id with the ticket id
//       payment.referenceId = ticketId;

//       // Fetch the ticket number using the ticketId
//       const ticket = await Ticket.findById(ticketId);
//       if (!ticket) {
//         return res.status(400).json({ error: "Invalid ticketId" });
//       }
//       payment.ticketNumber = ticket.ticketNumber;
//     }

//     // Set payment status for cash payments
//     if (
//       paymentMethod === PAYMENT_METHODS_ENUM.CASH ||
//       paymentMethod === PAYMENT_METHODS_ENUM.SWIPE ||
//       paymentMethod === PAYMENT_METHODS_ENUM.BANK_TRANSFER
//     ) {
//       payment.status = PAYMENT_STATUSES_ENUM.PAID;
//     }

//     await payment.save();

//     // Handle onboarding payment type
//     if (paymentType === PAYMENT_TYPES_ENUM.ONBOARDING) {
//       await updateVendorOnboarding(lease.vendor._id, amount);
//     }

//     // Handle payment method specific logic
//     switch (paymentMethod) {
//       case PAYMENT_METHODS_ENUM.ECOCASH:
//         await saveEcocashPayment(payment._id, {
//           phoneNumber: rest.phoneNumber,
//         });
//         break;
//       case PAYMENT_METHODS_ENUM.INNBUCKS:
//         //await saveInnbucksPayment(payment, {})
//         break;
//       default:
//         break;
//     }

//     res.json({ message: "Payment successful", payment });
//   } catch (error) {
//     console.error("Error making payment:", error);
//     res.status(500).json({ error: "Failed to make payment" });
//   }
// };

exports.createPayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      customerId,
      paymentMethod, // cash, bank, mpesa
      paymentType, // rent, deposit, etc
      transactionType, // bill payment or refund
      referenceId, // billId or creditNoteId
      controlAccountId,
    } = req.body;

    // check if customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) throw new Error("Customer account not found");

    const user = await Staff.findById(req.user.userId);
    if (!user) throw new Error("User not found");

    const bill = await Bill.findById(referenceId);
    if (!bill) throw new Error("Bill not found");

    // since base currency is always usd, base amount should never change.

    const baseAmount = req.body.amount; // fallback if no FX
    const fxAmount =
      req.body.fxAmount && req.body.fxRate
        ? req.body.fxAmount * req.body.fxRate
        : baseAmount; // fallback if no FX
    const accountId = customer.controlAccountId;
    const isInstant = await isInstantPayment(paymentMethod, session);
    const [payment] = await Payment.create(
      [
        {
          customerId,
          accountId, // Trader or Refund Account
          amount: baseAmount,
          fxAmount: fxAmount || null,
          fxRate: req.body.fxRate || null,
          fxCurrencyCode: req.body.fxCurrencyCode || null,
          paymentMethod,
          paymentType,
          paymentNumber: "",
          transactionType,
          referenceModel:
            transactionType === "bill payment" ? "Bill" : "CreditNote",
          referenceId,
          status: isInstant
            ? PAYMENT_STATUSES_ENUM.PAID
            : PAYMENT_STATUSES_ENUM.PENDING,
          cashier: user._id,
          sourceRef: bill.billNumber,
        },
      ],
      { session }
    );

    if (isInstant) {
      await handlePaymentPosting({
        payment,
        customer,
        customerId,
        paymentMethod,
        paymentType,
        transactionType,
        referenceId,
        controlAccountId,
        baseAmount,
        accountId,
        bill,
        session,
      });
    }

    await session.commitTransaction();
    session.endSession();
    return res.status(201).json(payment);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    return res
      .status(500)
      .json({ message: "Payment failed", error: err.message });
  }
};

exports.pollPayment = async (req, res) => {
  const session = await Payment.startSession();
  session.startTransaction();
  try {
    // check if payment is pending or successful.
    const { paymentId } = req.params;

    const payment = await Payment.findById(paymentId).session(session);
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    if (payment.status === PAYMENT_STATUSES_ENUM.PAID) {
      return res.json(payment);
    }

    if (payment.status === PAYMENT_STATUSES_ENUM.PENDING) {
      const customer = await Customer.findById(payment.customerId).session(
        session
      );
      const bill = await Bill.findById(payment.referenceId).session(session);
      const paymentMethod = await PaymentMethod.findOne({
        name: payment.paymentMethod,
      }).session(session);
      let paymentStatus = payment.status;
      if (paymentMethod.match(/ecocash/i)) {
        // should handle ecocash payment and
        // for now we are just setting payment status to paid and post to journals...
        // only do this is polling return success. We'll need to run this by our gateway integration.
        await handlePaymentPosting({
          payment,
          customer,
          transactionType,
          controlAccountId: paymentMethod.controlAccountId,
          baseAmount: payment.amount,
          accountId: customer.controlAccountId,
          bill,
          session,
        });
      } else if (paymentMethod.match(/innbucks/i)) {
        // should handle innbucks payment and
        // for now we are just setting payment status to paid and post to journals...
        await handlePaymentPosting({
          payment,
          customer,
          transactionType,
          controlAccountId: paymentMethod.controlAccountId,
          baseAmount: payment.amount,
          accountId: customer.controlAccountId,
          bill,
          session,
        });
      }
      if (!paymentStatus)
        return res
          .status(404)
          .json({ message: `${payment.paymentMethod} Payment not found` });

      payment.status = paymentStatus;
      await payment.save({ session });
      return res.json(payment);
    }
  } catch (error) {
    console.error("Error polling payment:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

async function applyPrepaymentToBill(customerId, billId, session) {
  const bill = await Bill.findById(billId).session(session);
  if (!bill) throw new Error("Bill not found");

  // Find available prepayments for this customer
  const prepayments = await CustomerPrepayment.find({
    customerId,
    status: "available",
    remainingBalance: { $gt: 0 },
  })
    .sort({ createdAt: 1 })
    .session(session);

  let amountNeeded = bill.outstanding;

  for (const prepayment of prepayments) {
    if (amountNeeded <= 0) break;

    const applyAmount = Math.min(prepayment.remainingBalance, amountNeeded);

    // Create payment record
    const payment = await Payment.create(
      [
        {
          customerId,
          accountId: bill.controlAccountId,
          amount: applyAmount,
          paymentMethod: "prepayment",
          paymentType: bill.type,
          paymentNumber: `PRE-${Date.now()}`,
          transactionType: "bill payment",
          referenceModel: "Bill",
          referenceId: billId,
          status: PAYMENT_STATUSES_ENUM.PAID,
          sourceRef: bill.billNumber,
        },
      ],
      { session }
    );

    // Update prepayment record
    prepayment.remainingBalance -= applyAmount;
    prepayment.appliedPayments.push({
      billId,
      amount: applyAmount,
      appliedAt: new Date(),
    });
    if (prepayment.remainingBalance === 0) {
      prepayment.status = "used";
    }
    await prepayment.save({ session });

    // Update bill
    bill.outstanding -= applyAmount;
    bill.amountPaid += applyAmount;
    bill.status = bill.outstanding === 0 ? "paid" : "partially-paid";
    await bill.save({ session });

    // Create journal entries
    const journalEntries = [
      {
        accountId: await getAccrualsAccountId(session), // Customer Prepayments
        debit: applyAmount,
        credit: 0,
        reference: payment[0]._id,
        referenceModel: "Payment",
        transactionType: "prepayment-application",
        description: `Prepayment applied to bill ${bill.billNumber}`,
      },
      {
        accountId: bill.controlAccountId, // Accounts Receivable
        debit: 0,
        credit: applyAmount,
        reference: payment[0]._id,
        referenceModel: "Payment",
        transactionType: "payment",
        description: `Prepayment applied from ${prepayment._id}`,
      },
    ];

    await postJournalEntry(journalEntries, session);

    amountNeeded -= applyAmount;
  }

  return amountNeeded; // Returns remaining amount needed after applying prepayments
}
// Called by polling job or webhook
async function confirmMobilePayment(payment, isSuccess, session) {
  if (!payment || payment.status !== "pending") return;

  if (isSuccess) {
    payment.status = "success";
    await payment.save({ session });

    // Post journals and update balances
    await postJournalEntryForPayment(payment, session);
    const { updateCustomer, updateLease } = getBalanceUpdateFlags(
      payment.transactionType
    );
    await updateLeaseAndCustomerBalances(
      {
        leaseId: updateLease ? payment.leaseId : null,
        customerId: updateCustomer ? payment.customerId : null,
        amount: payment.amount,
        type: "payment",
      },
      session
    );
  } else {
    payment.status = "failed";
    await payment.save({ session });
    // optionally notify or mark for retry
  }
}

async function postPrepayment(
  { customerId, originalPaymentId, currency, amount },
  session
) {
  // we already have the customerId and billId
  const prepayment = new customerPrepaymentModel({
    customerId,
    originalPaymentId,
    amount,
    currency,
    appliedPayments: [],
    remainingBalance: amount,
    status: "available",
  }).save({ session });
  // Create a payment record for the prepayment
  return prepayment;
}

async function handlePaymentPosting({
  payment,
  customer,
  transactionType,
  controlAccountId,
  baseAmount,
  accountId,
  bill,
  session,
}) {
  // this should be an Accounts Receivable control account
  const traderAccount = await ControlAccount.findById(accountId).session(
    session
  );
  if (!traderAccount) throw new Error("Trader control account not found");

  // Example: cash payments go into "Cash on Hand"
  // we also assume a control account id was not provided and payment method is 'Cash'
  let controlAccount = null;
  if (
    payment.paymentMethod === PAYMENT_METHODS_ENUM.CASH &&
    !controlAccountId
  ) {
    controlAccount = await ControlAccount.findOne({
      accountName: "Cash on Hand",
    }).session(session);
  } else if (controlAccountId) {
    controlAccount = await ControlAccount.findById(controlAccountId).session(
      session
    );
  } else {
    // pave way for other methods like bank transfer, swipe, etc.
    // although normally the control account id should be provided
  }

  if (!controlAccount) throw new Error("Control account not found");

  // find and update ticket if we're updating ticket
  const isUpdatedTicket = await updateTicketStatus(
    {
      billId: payment.referenceId,
      finalAmount: baseAmount,
      exitTime: new Date(),
      paymentType: payment.paymentType,
    },
    session
  );

  const hasPrepayment = baseAmount > bill.outstanding && !isUpdatedTicket;

  const { updateCustomer } = getBalanceUpdateFlags(payment.paymentType);

  // In handlePaymentPosting and paymentReversal, only update customer balances, not lease balances.
  await updateLeaseAndCustomerBalances(
    {
      customerId: updateCustomer ? customer._id : null,
      amount: baseAmount,
      type: "payment",
    },
    session
  );

  // what if the payment amount exceeds the bill amount?
  // we need to add an accruals journal entry,
  // the accounts receivable control account should receive only the amount required for the bill.
  // this is bill.outstanding
  // then accrued amount is baseAmount - bill.outstanding
  if (hasPrepayment) {
    // post prepayment to customer prepayments
    await postPrepayment(
      {
        customerId: customer._id,
        originalPaymentId: payment._id,
        currency: "USD", // let keep it at USD for now since we're tracking everything in USD, but we'll need to track fxCurrency in the future
        amount: baseAmount - bill.outstanding,
      },
      session
    );
  }

  const amountToBill = Math.min(baseAmount, bill.outstanding);

  const journalEntries =
    transactionType === "bill payment"
      ? [
          {
            accountId: controlAccount._id,
            debit: baseAmount,
            credit: 0,
            reference: payment._id,
            referenceModel: "Payment",
            transactionType: "payment",
            description: `${payment.paymentType} payment for ${customer._id}`,
            sourceRef: payment.paymentNumber,
          },
          {
            accountId: traderAccount._id,
            debit: 0,
            credit: amountToBill,
            reference: payment._id,
            referenceModel: "Payment",
            transactionType: "payment",
            description: `${payment.paymentType} payment for ${customer._id}`,
            sourceRef: payment.paymentNumber,
          },
          // Only add accrual entry if there's excess payment
          ...(hasPrepayment
            ? [
                {
                  accountId: await getAccrualsAccountId(session),
                  debit: 0,
                  credit: baseAmount - amountToBill,
                  reference: payment._id,
                  referenceModel: "Payment", // need to
                  transactionType: "accrual",
                  description: `Excess payment for future bills (${customer._id})`,
                  sourceRef: payment.paymentNumber,
                },
              ]
            : []),
        ]
      : [
          {
            accountId: traderAccount._id,
            debit: baseAmount,
            credit: 0,
            reference: payment._id,
            referenceModel: "Payment",
            transactionType: "payment",
            description: `${payment.paymentType} payment for ${customer._id}`,
            sourceRef: payment.paymentNumber,
          },
          {
            accountId: controlAccount._id,
            debit: 0,
            credit: baseAmount,
            reference: payment._id,
            referenceModel: "Payment",
            transactionType: "payment",
            description: `${payment.paymentType} payment for ${customer._id}`,
            sourceRef: payment.paymentNumber,
          },
        ];

  await postJournalEntry(journalEntries, session);

  await updateBillOrCreditNoteStatus(payment, payment.referenceModel, session);
}

exports.paymentReversal = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { paymentId } = req.params;
    const { reason, correctedAmount, type } = req.body;

    if (!reason || !type) {
      return res.status(400).json({ message: "Reversal reason is required." });
    }
    // Find the payment to reverse
    const originalPayment = await Payment.findById(paymentId).session(session);
    if (!originalPayment || originalPayment.status === "reversed") {
      throw new Error("Payment not found or already reversed.");
    }

    if (originalPayment.status !== PAYMENT_STATUSES_ENUM.PAID) {
      throw new Error("Only paid payments can be reversed");
    }

    const userId = req.user.userId;
    if (!userId) {
      throw new Error("User not authenticated");
    }
    // Reverse the payment
    // Mark original payment as reversed
    originalPayment.status =
      type === "reversal"
        ? PAYMENT_STATUSES_ENUM.REVERSED
        : PAYMENT_STATUSES_ENUM.REFUNDED;
    originalPayment.reason = reason;
    originalPayment.reversedBy = userId;
    originalPayment.transactionType = type;
    originalPayment.reversalDate = new Date();
    await originalPayment.save({ session });

    // Create reversing journal entries
    const originalTransactions = await transactionsModel
      .find({
        reference: originalPayment._id,
        referenceModel: "Payment",
      })
      .session(session);

    const reversalEntries = originalTransactions.map((tx) => ({
      accountId: tx.accountId,
      debit: tx.credit,
      credit: tx.debit,
      reference: originalPayment._id,
      referenceModel: "Payment",
      transactionType: type,
      description: `Reversal of payment ${originalPayment.paymentNumber}`,
      sourceRef: originalPayment.paymentNumber,
      postDate: new Date(),
    }));

    // Optional: Record a corrected payment

    const newPayment = new Payment({
      customerId: originalPayment.customerId,
      amount: -correctedAmount, // this should negate the original payment
      currency: originalPayment.currency,
      paymentType: originalPayment.paymentType,
      status:
        type === "refund"
          ? PAYMENT_STATUSES_ENUM.REFUND
          : PAYMENT_STATUSES_ENUM.REVERSAL,
      paymentNumber: "",
      accountId: originalPayment.accountId,
      paymentMethod: originalPayment.paymentMethod,
      paymentDate: new Date(),
      referenceModel: originalPayment.referenceModel,
      referenceId: originalPayment.referenceId,
      cashier: userId,
      sourceRef: originalPayment.sourceRef,
      transactionType: type,
      reason: `Reversal correction: ${reason}`,
    });

    await newPayment.save({ session });
    // Post new correct journal entries (re-using your posting logic)
    await postJournalEntry(reversalEntries, session);

    await updateBillOrCreditNoteStatus(
      newPayment,
      newPayment.referenceModel,
      session
    );

    // Update customer and lease balances
    const { updateCustomer } = getBalanceUpdateFlags(
      originalPayment.paymentType
    );
    await updateLeaseAndCustomerBalances(
      {
        customerId: updateCustomer ? originalPayment.customerId : null,
        amount: newPayment.amount,
        type: "bill",
      },
      session
    );
    await session.commitTransaction();
    session.endSession();
    return res.status(200).json({
      message: "Payment reversed successfully",
      reversedPaymentId: originalPayment._id,
      correctedPaymentId: newPayment?._id,
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error reversing payment:", error);
    return res.status(500).json({ message: "Payment reversal failed", error });
  }
};
