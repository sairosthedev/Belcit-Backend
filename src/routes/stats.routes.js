const express = require('express');
const router = express.Router();
const { getAccountantDashboardStats } = require('../controllers/stats/accountantStats.controller');
const adminStatsController = require('../controllers/stats/adminStats.controller');
const auth = require("../middleware/auth.middleware");
const ROLES = require("../config/roles");

/**
 * @swagger
 * tags:
 *   name: Stats
 *   description: Statistics management
 */

/**
 * @swagger
 * /api/stats/accountant:
 *   get:
 *     summary: Get accountant dashboard statistics
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved dashboard stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalRevenue:
 *                   type: number
 *                   description: Total revenue for the current date
 *                 totalPayments:
 *                   type: number
 *                   description: Total number of payments for the current date
 *                 totalTickets:
 *                   type: number
 *                   description: Total number of tickets for the current date
 *       500:
 *         description: Failed to retrieve dashboard stats
 */

/**
 * @swagger
 * /api/stats/admin:
 *   get:
 *     summary: Get admin dashboard statistics
 *     tags: [Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved admin dashboard stats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalStaff:
 *                   type: number
 *                   description: Total number of staff for the current date
 *                 totalPayments:
 *                   type: number
 *                   description: Total number of payments for the current date
 *                 totalTickets:
 *                   type: number
 *                   description: Total number of tickets for the current date
 *                 totalVendors:
 *                   type: number
 *                   description: Total number of vendors for the current date
 *                 totalStalls:
 *                   type: number
 *                   description: Total number of stalls for the current date
 *                 totalFarmers:
 *                   type: number
 *                   description: Total number of farmers for the current date
 *       500:
 *         description: Failed to retrieve admin dashboard stats
 */
router.get('/accountant', auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]), getAccountantDashboardStats);
router.get('/admin', auth([ROLES.SUPER_ADMIN]), adminStatsController.getAdminDashboardStats);

module.exports = router;
