const express = require('express');
const router = express.Router();
const authController = require('./../controllers/auth/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication management
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login a staff member
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - username
 *               - password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 role:
 *                   type: string
 *       400:
 *         description: Invalid credentials
 *       500:
 *         description: Internal server error
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new staff member
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               idNumber:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *               phonenumber:
 *                 type: string
 *               email:
 *                 type: string
 *             required:
 *               - username
 *               - password
 *     responses:
 *       201:
 *         description: Staff registered successfully
 *       400:
 *         description: Username already exists or password too short
 *       500:
 *         description: Internal server error
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/deactivate/{id}:
 *   patch:
 *     summary: Deactivate a staff member
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the staff member to deactivate
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staff member deactivated successfully
 *       404:
 *         description: Staff member not found
 *       500:
 *         description: Internal server error
 */
router.patch('/deactivate/:id', authController.deactivateStaff);

/**
 * @swagger
 * /api/auth/activate/{id}:
 *   patch:
 *     summary: Activate a staff member
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the staff member to activate
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staff member activated successfully
 *       404:
 *         description: Staff member not found
 *       500:
 *         description: Internal server error
 */
router.patch('/activate/:id', authController.activateStaff);

/**
 * @swagger
 * /api/auth/reset-password/{id}:
 *   patch:
 *     summary: Reset a staff member's password
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the staff member to reset password
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *             required:
 *               - currentPassword
 *               - newPassword
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Password must be at least 6 characters long or current password is incorrect
 *       404:
 *         description: Staff member not found
 *       500:
 *         description: Internal server error
 */
router.patch('/reset-password/:id', authController.resetPassword);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 idNumber:
 *                   type: string
 *                 username:
 *                   type: string
 *                 role:
 *                   type: string
 *                 phonenumber:
 *                   type: string
 *                 email:
 *                   type: string
 *       401:
 *         description: Unauthorized - missing or invalid token
 *       500:
 *         description: Internal server error
 */
router.get('/me', authMiddleware(), authController.getMe);

module.exports = router;