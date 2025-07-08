const express = require("express");
const router = express.Router();
const {
  createTicket,
  getAllTickets,
  getTicketByNumber,
  updateTicketStatus,
} = require("../controllers/tickets/ticket.controller");
const {
  getTicketsByCashierId,
  getTicketsByCashierIdAndDate,
  getTicketsForToday,
  getTotalPaymentsForToday,
} = require("../controllers/reconciliation/totals.controller");
const auth = require("../middleware/auth.middleware");
const ROLES = require("../config/roles");

/**
 * @swagger
 * tags:
 *   name: Tickets
 *   description: Ticket management
 */

/**
 * @swagger
 * /api/tickets/create:
 *   post:
 *     summary: Create a ticket
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ticketType:
 *                 type: string
 *                 enum: [parking, toilet, fine, rent, onboarding]
 *               entryTime:
 *                 type: string
 *                 format: date-time
 *               ticketStatus:
 *                 type: string
 *                 enum: [checked-in, checked-out, paid]
 *               offense:
 *                 type: string
 *               cashierId:
 *                 type: string
 *               amount:
 *                 type: number
 *               vendorId:
 *                 type: string
 *             required:
 *               - ticketType
 *               - cashierId
 *     responses:
 *       200:
 *         description: Ticket created successfully
 *       400:
 *         description: Bad request
 *       409:
 *         description: Duplicate ticket number
 *       500:
 *         description: Server error
 */
router.post(
  "/",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT, ROLES.CASHIER]),
  createTicket
);

/**
 * @swagger
 * /api/tickets/:
 *   get:
 *     summary: Get all tickets
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of tickets
 *       500:
 *         description: Server error
 */
router.get(
  "/",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT, ROLES.CASHIER]),
  getAllTickets
);

router.get(
  "/:ticketNumber/number",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT, ROLES.CASHIER]),
  getTicketByNumber
);

/**
 * @swagger
 * /api/tickets/update/{id}:
 *   put:
 *     summary: Update ticket status
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Ticket ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ticketStatus:
 *                 type: string
 *                 enum: [checked-in, checked-out, paid]
 *             required:
 *               - ticketStatus
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 *       404:
 *         description: Ticket not found
 *       500:
 *         description: Server error
 */
router.put(
  "/update/:id",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT, ROLES.CASHIER]),
  updateTicketStatus
);

/**
 * @swagger
 * /api/tickets/total/{cashierId}:
 *   get:
 *     summary: Get tickets by cashier ID
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: cashierId
 *         in: path
 *         required: true
 *         description: Cashier ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of tickets for the specified cashier
 *       500:
 *         description: Server error
 */
router.get(
  "/total/:cashierId",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT, ROLES.CASHIER]),
  getTicketsByCashierId
);

/**
 * @swagger
 * /api/tickets/total/{date}/{cashierId}:
 *   get:
 *     summary: Get tickets by cashier ID and date
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: date
 *         in: path
 *         required: true
 *         description: Date in YYYY-MM-DD format
 *         schema:
 *           type: string
 *       - name: cashierId
 *         in: path
 *         required: true
 *         description: Cashier ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of tickets for the specified cashier and date
 *       500:
 *         description: Server error
 */
router.get(
  "/total/:date/:cashierId",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT, ROLES.CASHIER]),
  getTicketsByCashierIdAndDate
);

/**
 * @swagger
 * /api/tickets/total/today/{cashierId}:
 *   get:
 *     summary: Get tickets for today by cashier ID
 *     tags: [Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: cashierId
 *         in: path
 *         required: true
 *         description: Cashier ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of tickets for today for the specified cashier
 *       500:
 *         description: Server error
 */
router.get(
  "/total/today/:cashierId",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT, ROLES.CASHIER]),
  getTicketsForToday
);

module.exports = router;
