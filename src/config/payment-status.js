const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "cancelled",
  "reversed",
  "reversal",
  "refunded",
  "refund",
];
const PAYMENT_STATUSES_ENUM = {
  PENDING: "pending",
  PAID: "paid",
  CANCELLED: "cancelled",
  REVERSED: "reversed",
  REVERSAL: "reversal",
  REFUNDED: "refunded",
  REFUND: "refund",
};

module.exports = { PAYMENT_STATUSES, PAYMENT_STATUSES_ENUM };
