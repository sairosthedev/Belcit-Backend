const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const ROLES = require("../config/roles");
const {
  seedControlAccounts,
  getControlAccounts,
  createControlAccount,
  updateControlAccount,
  getTrialBalance,
  getControlAccountById,
  getLedgerSummary,
  transferToAccount
} = require("../controllers/control-accounts/control-accounts.controller");
/*
 * Create Control Account
 */
router.post(
  "/",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]),
  createControlAccount
);

/*
 * Get all control accounts
 */
router.get(
  "/",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]),
  getControlAccounts
);

/*
 * Get all control accounts
 */
router.get(
  "/trial-balance",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]),
  getTrialBalance
);

/*
 * Get ledger summary
 */
router.get(
  "/ledger-summary",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]),
  getLedgerSummary
);

/*
 * Get control account by id
 */
router.get(
  "/:id",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]),
  getControlAccountById
);

/*
 * Seed Control Accounts
 */
router.post(
  "/seed",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]),
  seedControlAccounts
);

/*
 * Transfer Control Accounts
 */
router.post(
  "/transfer",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]),
  transferToAccount
);

router.put(
  "/:id",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]),
  updateControlAccount
);

module.exports = router;
