const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const ROLES = require("../config/roles");
const {
  generateBill,
  getBills,
  findBillByNumber,
  findAllTransactions
} = require("../controllers/tickets/billing.controller");
/*
 * Create Bill Document
 */
router.post(
  "/",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT, ROLES.CASHIER]),
  (req, res) => generateBill(req, res)
);

/*
 * Get all bills
 */
router.get("/", auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]), getBills);

/*
 * Get all transactions
 */
router.get(
  "/transactions",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT, ROLES.CASHIER]),
  findAllTransactions
);

/*
 * Get bill by bill number
 */
router.get(
  "/:billNumber",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT, ROLES.CASHIER]),
  findBillByNumber
);

module.exports = router;
