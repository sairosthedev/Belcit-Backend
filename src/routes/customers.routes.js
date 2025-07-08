const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const ROLES = require("../config/roles");
const {
  getAllCustomers,
  findCustomerById,
  getCustomerAccountStatement,
} = require("../controllers/customers/customers.controller");

/*
 * Get all customers
 */
router.get(
  "/",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT, ROLES.CASHIER]),
  getAllCustomers
);

/*
 * Get customer by id
 */
router.get(
  "/:id",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT, ROLES.CASHIER]),
  findCustomerById
);

/*
 * Get customer by id
 */
router.get(
  "/:customerId/account-statement",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT, ROLES.CASHIER]),
  getCustomerAccountStatement
);

module.exports = router;
