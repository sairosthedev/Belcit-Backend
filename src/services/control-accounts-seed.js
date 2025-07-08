const ControlAccount = require("../models/control-account.model");

const controlAccounts = [
  {
    code: "1000",
    accountName: "Cash on Hand",
    accountType: "asset",
    totalDebit: 0,
    totalCredit: 0,
    isSystem: true,
  },
  {
    code: "1001",
    accountName: "Petty Cash",
    accountType: "asset",
    totalDebit: 0,
    totalCredit: 0,
    isSystem: true,
  },
  {
    code: "1010",
    accountName: "Bank Account",
    accountType: "asset",
    totalDebit: 0,
    totalCredit: 0,
    isSystem: true,
  },
  {
    code: "1100",
    accountName: "Accounts Receivable",
    accountType: "asset",
    totalDebit: 0,
    totalCredit: 0,
    isSystem: true,
  },
  {
    code: "1200",
    accountName: "Deposits Receivable",
    accountType: "asset",
    totalDebit: 0,
    totalCredit: 0,
    isSystem: true,
  },
  {
    code: "2000",
    accountName: "Accounts Payable",
    accountType: "liability",
    totalDebit: 0,
    totalCredit: 0,
    isSystem: true,
  },
  {
    code: "2100",
    accountName: "Deposits Payable",
    accountType: "liability",
    totalDebit: 0,
    totalCredit: 0,
    isSystem: true,
  },
  {
    code: "3000",
    accountName: "Parking Revenue",
    accountType: "income",
    totalDebit: 0,
    totalCredit: 0,
    isSystem: true,
  },
  {
    code: "3001",
    accountName: "Toilet Revenue",
    accountType: "income",
    totalDebit: 0,
    totalCredit: 0,
    isSystem: true,
  },
  {
    code: "3002",
    accountName: "Rent Revenue",
    accountType: "income",
    totalDebit: 0,
    totalCredit: 0,
    isSystem: true,
  },
  {
    code: "3003",
    accountName: "Fine Revenue",
    accountType: "income",
    totalDebit: 0,
    totalCredit: 0,
    isSystem: true,
  },
  {
    code: "3100",
    accountName: "Other Income",
    accountType: "income",
    totalDebit: 0,
    totalCredit: 0,
    isSystem: true,
  },
  {
    code: "4000",
    accountName: "Bad Debts Expense",
    accountType: "expense",
    totalDebit: 0,
    totalCredit: 0,
    isSystem: true,
  },
  {
    code: "4001",
    accountName: "Repairs & Maintenance",
    accountType: "expense",
    totalDebit: 0,
    totalCredit: 0,
    isSystem: true,
  },
  {
    code: "5000",
    accountName: "Lease Control Account",
    accountType: "liability",
    totalDebit: 0,
    totalCredit: 0,
    isSystem: true,
  },
  {
    code: "6000",
    accountName: "Credit Notes Issued",
    accountType: "contra-income",
    totalDebit: 0,
    totalCredit: 0,
    isSystem: true,
  },
];

const seed = async () => {
  try {
    const existing = await ControlAccount.find({});
    if (existing.length > 0) {
      console.log("Control accounts already exist. Skipping seed.");
      return process.exit(0);
    }

    await ControlAccount.insertMany(controlAccounts);
    console.log("Control accounts seeded successfully.");
  } catch (err) {
    console.error("Seed error:", err);
  }
};

module.exports = { seed };
