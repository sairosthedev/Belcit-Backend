const express = require("express");
const {
  createFine,
  getAllFines,
  updateFine,
} = require("../controllers/tickets/fine.controller");
const auth = require("../middleware/auth.middleware"); // Using auth from ticket.routes.js
const ROLES = require("../config/roles"); // Importing roles

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Fines
 *   description: Fine management
 */

/**
 * @swagger
 * /api/fines/create:
 *   post:
 *     summary: Create a new fine
 *     tags: [Fines]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               offense:
 *                 type: string
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *             required:
 *               - offense
 *               - amount
 *     responses:
 *       201:
 *         description: Fine created successfully
 *       400:
 *         description: Offense already exists
 *       500:
 *         description: Error creating fine
 */
router.post("/", auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]), createFine);

/**
 * @swagger
 * /api/fines/:
 *   get:
 *     summary: Get all fines
 *     tags: [Fines]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of fines
 *       500:
 *         description: Failed to retrieve fines
 */
router.get(
  "/",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT, ROLES.CASHIER]),
  getAllFines
);

/**
 * @swagger
 * /api/fines/update/{id}:
 *   put:
 *     summary: Update a fine by ID
 *     tags: [Fines]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the fine to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               offense:
 *                 type: string
 *               description:
 *                 type: string
 *               amount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Fine updated successfully
 *       404:
 *         description: Fine not found
 *       500:
 *         description: Error updating fine
 */
router.put("/:id", auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]), updateFine);

module.exports = router;
