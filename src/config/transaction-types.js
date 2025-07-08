const TRANSACTION_TYPES = [
  "bill payment",
  "refund",
  "transfer",
  "withdrawal",
  "deposit",
  "purchase",
  "sale",
  "exchange",
  "fee",
  "interest",
  "dividend",
  "royalty",
  "commission",
  "bonus",
  "reward",
  "gift card",
  "loyalty point",
  "cashback",
  "rebate",
  "discount",
  "surcharge",
  "penalty",
  "fine",
  "accrual",
  "reversal",
];

const TRANSACTION_TYPES_ENUM = Object.fromEntries(
  TRANSACTION_TYPES.map((type) => [type.toUpperCase().replace(/ /g, "_"), type])
);

module.exports = {
  TRANSACTION_TYPES,
  TRANSACTION_TYPES_ENUM,
};
