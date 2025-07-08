const express = require("express");
const router = express.Router();
const reconciliationController = require("../controllers/reconciliation/reconciliation.controller");
const totalsController = require('../controllers/reconciliation/totals.controller');
const auth = require("../middleware/auth.middleware");
const ROLES = require("../config/roles");

/**
 * @swagger
 * tags:
 *   - name: Reconciliations
 *     description: Reconciliate day payments
 */

/**
 * @swagger
 * /api/reconciliation/{cashierId}:
 *   post:
 *     summary: Reconcile payments for a specific cashier
 *     tags: [Reconciliations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cashierId
 *         required: true
 *         description: ID of the cashier to reconcile payments for
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amountReceived:
 *                 type: number
 *                 description: The amount received from the cashier
 *               comment:
 *                 type: string
 *                 description: Optional comment for the reconciliation
 *             required:
 *               - amountReceived
 *     responses:
 *       200:
 *         description: Reconciliation successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 totalAmount:
 *                   type: number
 *                 deficit:
 *                   type: number
 *                 surplus:
 *                   type: number
 *       404:
 *         description: No payments found for this cashier today
 *       500:
 *         description: Failed to reconcile payments
 */
router.post("/", auth([ROLES.ACCOUNTANT, ROLES.SUPER_ADMIN]), reconciliationController.createReconciliation);

/**
 * @swagger
 * /api/reconciliation/totals/{cashierId}:
 *   get:
 *     summary: Get total payments for today by cashier ID
 *     tags: [Reconciliations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cashierId
 *         required: true
 *         description: ID of the cashier to get total payments for today
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Total payments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cashierId:
 *                   type: string
 *                 totalAmount:
 *                   type: number
 *       404:
 *         description: No payments found for this cashier today
 *       500:
 *         description: Failed to get total payments
 */
router.get("/totals/:cashierId", auth([ROLES.ACCOUNTANT, ROLES.SUPER_ADMIN]), totalsController.getTotalPaymentsForToday);

/**
 * @swagger
 * /api/reconciliation/:
 *   get:
 *     summary: Get all reconciliations
 *     tags: [Reconciliations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of reconciliations
 *       500:
 *         description: Internal server error
 */
router.get("/", auth([ROLES.ACCOUNTANT, ROLES.SUPER_ADMIN]), reconciliationController.getAllReconciliations);

/**
 * @swagger
 * /api/reconciliation/{cashierId}/date:
 *   get:
 *     summary: Get reconciliations by date and cashier ID
 *     tags: [Reconciliations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cashierId
 *         required: true
 *         description: ID of the cashier to get reconciliations for
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         required: true
 *         description: Date to filter reconciliations
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reconciliations found successfully
 *       404:
 *         description: No reconciliations found for this cashier on the specified date
 *       500:
 *         description: Internal server error
 */
router.get("/:cashierId/date", auth([ROLES.ACCOUNTANT, ROLES.SUPER_ADMIN]), reconciliationController.getReconciliationsByDateAndCashier);

/**
 * @swagger
 * /api/reconciliation/date-period:
 *   get:
 *     summary: Get reconciliations by date period
 *     tags: [Reconciliations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         description: Start date for the period
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         required: true
 *         description: End date for the period
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reconciliations found successfully
 *       404:
 *         description: No reconciliations found in the specified date period
 *       500:
 *         description: Internal server error
 */
router.get("/date-period", auth([ROLES.ACCOUNTANT, ROLES.SUPER_ADMIN]), reconciliationController.getReconciliationsByDatePeriod);

module.exports = router;