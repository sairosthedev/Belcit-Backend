const express = require("express");
const router = express.Router();
const getAllPaymentsController = require("../controllers/payments/getPayments.controller");
const auth = require("../middleware/auth.middleware");
const ROLES = require("../config/roles");
const paymentsController = require("../controllers/payments/payments.controller");
const getRevenueController = require("../controllers/payments/getRevenue.controller");

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment management
 */

/**
 * @swagger
 * /api/payments/:
 *   post:
 *     summary: Make a payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *               paymentType:
 *                 type: string
 *               ticketId:
 *                 type: string
 *               cashierId:
 *                 type: string
 *               stallId:
 *                 type: string
 *             required:
 *               - amount
 *               - paymentMethod
 *               - paymentType
 *               - cashierId
 *     responses:
 *       200:
 *         description: Payment successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 payment:
 *                   type: object
 *       400:
 *         description: Invalid payment method or type
 *       500:
 *         description: Failed to make payment
 */
router.post(
  "/",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT, ROLES.CASHIER]),
  paymentsController.createPayment
);

/**
 * @swagger
 * /api/payments/:
 *   get:
 *     summary: Get all payments
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all payments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *       404:
 *         description: No payments found
 *       500:
 *         description: Failed to get payments
 */
router.get(
  "/",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT, ROLES.CASHIER]),
  getAllPaymentsController.getAllPayments
);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the payment to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Failed to get payment
 */
router.get(
  "/:id",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT, ROLES.CASHIER]),
  getAllPaymentsController.getPaymentById
);

/**
 * @swagger
 * /api/payments/poll/{paymentId}:
 *   get:
 *     summary: Poll payment status by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         description: ID of the payment to poll
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Failed to poll payment status
 */
router.get(
  "/poll/:paymentId",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT, ROLES.CASHIER]),
  paymentsController.pollPayment
);

/**
 * @swagger
 * /api/payments/revenue:
 *   get:
 *     summary: Get current revenue for the current date
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current revenue retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRevenue:
 *                   type: number
 *       500:
 *         description: Failed to retrieve current revenue
 */
router.get(
  "/revenue",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]),
  getRevenueController.getCurrentRevenue
);

router.post(
  "/:paymentId/reversal",
  auth([ROLES.ACCOUNTANT]),
  paymentsController.paymentReversal
);

module.exports = router;
