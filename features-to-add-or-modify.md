## Modifications and Additions to Features

### 1. Payment Allocation

```
 allocations: [
    {
      reference: { type: mongoose.Schema.Types.ObjectId, required: true },
      referenceModel: { type: String, enum: ['Bill', 'CreditNote'], required: true },
      amountApplied: { type: Number, required: true }
    }
  ],

  // Optional: track unapplied amount
  unappliedAmount: { type: Number, default: 0 }
```

##### Modify Payment Model

This will allow the allocation of a single payment to multiple bills/ invoices

##### On the bill (credit-note) side

If needed, you can maintain a virtual field or reverse ref:

```
paymentSchema.virtual('bills', {
  ref: 'Bill',
  localField: 'allocations.reference',
  foreignField: '_id',
  justOne: false
});
```

##### 1. Modify the Create Payment Method
```
exports.createPayment = async (req, res) => {
  const session = await Payment.startSession();
  session.startTransaction();

  try {
    const {
      customerId,
      paymentMethod, // cash, bank, mpesa
      paymentType, // rent, deposit, etc
      transactionType, // bill payment or refund
      allocations, // array: [{ referenceId, referenceModel, amountApplied }]
      fxAmount,
      fxRate,
      fxCurrencyCode,
    } = req.body;

    const customer = await Customer.findById(customerId);
    if (!customer) throw new Error("Customer account not found");

    const baseAmount = fxAmount && fxRate ? fxAmount * fxRate : req.body.amount;
    const accountId = customer.controlAccountId;

    // Generate paymentNumber/reference - you can use a helper for this
    const paymentNumber = `PMT-${Date.now()}`;

    // Compute unappliedAmount
    const totalApplied = allocations.reduce((sum, a) => sum + a.amountApplied, 0);
    const unappliedAmount = baseAmount - totalApplied;

    const [payment] = await Payment.create([
      {
        paymentNumber,
        customerId,
        accountId,
        amount: baseAmount,
        fxAmount: fxAmount || null,
        fxRate: fxRate || null,
        fxCurrencyCode: fxCurrencyCode || null,
        paymentMethod,
        paymentType,
        transactionType,
        allocations,
        unappliedAmount,
        status: isInstantPayment(paymentMethod)
          ? PAYMENT_STATUSES_ENUM.PAID
          : PAYMENT_STATUSES_ENUM.PENDING,
      },
    ], { session });

    if (isInstantPayment(paymentMethod)) {
      const traderAccount = await ControlAccount.findById(accountId).session(session);
      if (!traderAccount) throw new Error("Trader control account not found");

      const cashAccount = await ControlAccount.findOne({
        accountName: "Cash on Hand",
      }).session(session);
      if (!cashAccount) throw new Error("Cash control account not found");

      const { updateCustomer } = getBalanceUpdateFlags(paymentType);
      await updateLeaseAndCustomerBalances({
        customerId: updateCustomer ? customerId : null,
        amount: baseAmount,
        type: "payment",
      }, session);

      const journalEntries = [
        {
          accountId: cashAccount._id,
          debit: baseAmount,
          credit: 0,
          reference: payment._id,
          referenceModel: "Payment",
          transactionType: "payment",
          description: `${paymentType} payment for ${customerId}`,
        },
        {
          accountId: traderAccount._id,
          debit: 0,
          credit: baseAmount,
          reference: payment._id,
          referenceModel: "Payment",
          transactionType: "payment",
          description: `${paymentType} payment for ${customerId}`,
        },
      ];

      await postJournalEntry(journalEntries, session);

      // Update each referenced bill/creditNote
      for (const { referenceId, referenceModel } of allocations) {
        await updateBillOrCreditNoteStatus({ _id: referenceId }, referenceModel.toLowerCase(), session);
      }
    }

    await session.commitTransaction();
    session.endSession();
    return res.status(201).json({ message: "Payment posted successfully", payment });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    return res.status(500).json({ message: "Payment failed", error: err.message });
  }
};
```
