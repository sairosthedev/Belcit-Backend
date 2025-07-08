const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shift/shift.controller');
const auth = require("../middleware/auth.middleware");
const ROLES = require("../config/roles");

/**
 * @swagger
 * /api/shifts/:
 *   post:
 *     summary: Start a new shift
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cashierId:
 *                 type: string
 *               username:
 *                 type: string
 *     responses:
 *       201:
 *         description: Shift started successfully
 *       500:
 *         description: Failed to start shift
 */
router.post('/', auth([ROLES.CASHIER, ROLES.ACCOUNTANT, ROLES.SUPER_ADMIN]), shiftController.startShift);

/**
 * @swagger
 * /api/shifts/{shiftId}:
 *   put:
 *     summary: End a shift
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: shiftId
 *         required: true
 *         description: ID of the shift to end
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
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Shift ended successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 shift:
 *                   type: object
 *                 reconciliation:
 *                   type: object
 *                   properties:
 *                     totalRevenue:
 *                       type: number
 *                     amountReceived:
 *                       type: number
 *                     deficit:
 *                       type: number
 *                     surplus:
 *                       type: number
 *                     comment:
 *                       type: string
 *       400:
 *         description: Shift is already ended
 *       404:
 *         description: Shift not found
 *       500:
 *         description: Failed to end shift
 */
router.put('/:shiftId', auth([ROLES.ACCOUNTANT, ROLES.SUPER_ADMIN]), shiftController.endShift);

/**
 * @swagger
 * /api/shifts/:
 *   get:
 *     summary: Get all shifts
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of shifts
 *       500:
 *         description: Failed to retrieve shifts
 */
router.get('/', auth([ROLES.ACCOUNTANT, ROLES.SUPER_ADMIN]), shiftController.getAllShifts);

/**
 * @swagger
 * /api/shifts/date-range:
 *   get:
 *     summary: Get shifts by date range
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         description: Start date for the range
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         required: true
 *         description: End date for the range
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shifts found successfully
 *       500:
 *         description: Failed to retrieve shifts
 */
router.get('/date-range', auth([ROLES.ACCOUNTANT, ROLES.SUPER_ADMIN]), shiftController.getShiftsByDateRange);

/**
 * @swagger
 * /api/shifts/cashier/{cashierId}:
 *   get:
 *     summary: Get shifts by cashier ID
 *     tags: [Shifts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: cashierId
 *         required: true
 *         description: ID of the cashier to get shifts for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shifts found successfully
 *       500:
 *         description: Failed to retrieve shifts
 */
router.get('/cashier/:cashierId', auth([ROLES.ACCOUNTANT, ROLES.SUPER_ADMIN]), shiftController.getShiftsByCashierId);

module.exports = router;
