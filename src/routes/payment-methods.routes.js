const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const ROLES = require("../config/roles");
const paymentsMethodsController = require("../controllers/payments/payment-methods.controller");

/**
 * @swagger
 * tags:
 *   name: Payment Methods
 *   description: Payment Methods management
 */

router.post(
  "/",
  auth([ROLES.ACCOUNTANT]),
  paymentsMethodsController.createPaymentMethod
);

router.get(
  "/",
  auth([ROLES.ACCOUNTANT, ROLES.CASHIER]),
  paymentsMethodsController.getAllPaymentMethods
);

router.get(
  "/:id",
  auth([ROLES.ACCOUNTANT, ROLES.CASHIER]),
  paymentsMethodsController.getPaymentMethodById
);

router.put(
  "/:id",
  auth([ROLES.ACCOUNTANT]),
  paymentsMethodsController.updatePaymentMethod
);

router.delete(
  "/:id",
  auth([ROLES.ACCOUNTANT]),
  paymentsMethodsController.deletePaymentMethod
);

module.exports = router;
