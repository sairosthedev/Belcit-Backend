const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const ROLES = require("../config/roles");
const {
  createLineItem,
  getAllLineItems,
  getLineItemById,
  updateLineItem,
} = require("../controllers/line-items/line-items.controller");
/*
 * Create Line item
 */
router.post("/", auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]), createLineItem);

/*
 * Get all line items
 */
router.get(
  "/",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT, ROLES.CASHIER]),
  getAllLineItems
);

/*
 * Get line item by id
 */
router.get(
  "/:id",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT, ROLES.CASHIER]),
  getLineItemById
);

module.exports = router;
