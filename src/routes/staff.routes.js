const express = require('express');
const router = express.Router();
const { getAllStaff, getStaffById } = require('../controllers/staff/getStaff.controller');
const auth = require('../middleware/auth.middleware');
const ROLES = require('../config/roles');
const { updateStaff } = require('../controllers/staff/updateStaff.controller');
const { deleteStaff } = require('../controllers/staff/deleteStaff.controller');
const uploadImageController = require('../controllers/staff/uploadImage.controller');

/**
 * @swagger
 * tags:
 *   name: Staff
 *   description: Staff management
 */

/**
 * @swagger
 * /api/staff/:
 *   get:
 *     summary: Get all staff
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of staff members
 *       500:
 *         description: Internal server error
 */
router.get('/', auth([ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPER_ADMIN]), getAllStaff);

/**
 * @swagger
 * /api/staff/{id}:
 *   get:
 *     summary: Get a specific staff member by ID
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the staff member
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staff member found successfully
 *       404:
 *         description: Staff member not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', auth([ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPER_ADMIN]), getStaffById);

/**
 * @swagger
 * /api/staff/update/{id}:
 *   put:
 *     summary: Update a staff member
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the staff member to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               phonenumber:
 *                 type: string
 *               email:
 *                 type: string
 *             required:
 *               - username
 *               - phonenumber
 *     responses:
 *       200:
 *         description: Staff member updated successfully
 *       404:
 *         description: Staff member not found
 *       500:
 *         description: Internal server error
 */
router.put('/update/:id', auth([ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPER_ADMIN]), updateStaff);

/**
 * @swagger
 * /api/staff/delete/{id}:
 *   delete:
 *     summary: Delete a staff member
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the staff member to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Staff member deleted successfully
 *       404:
 *         description: Staff member not found
 *       500:
 *         description: Internal server error
 */
router.delete('/delete/:id', auth([ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPER_ADMIN]), deleteStaff);

/**
 * @swagger
 * /api/staff/upload-image:
 *   post:
 *     summary: Upload an image for a staff member
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               name:
 *                 type: string
 *               folder:
 *                 type: string
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: No files were uploaded or missing required fields
 *       500:
 *         description: Failed to upload image
 */
router.post('/upload-image', auth([ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPER_ADMIN]), uploadImageController.uploadFile);

/**
 * @swagger
 * /api/staff/update-image:
 *   put:
 *     summary: Update staff member image
 *     tags: [Staff]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *               name:
 *                 type: string
 *               folder:
 *                 type: string
 *               oldImagePath:
 *                 type: string
 *     responses:
 *       200:
 *         description: Image updated successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Failed to update image
 */
router.put('/update-image', auth([ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPER_ADMIN]), uploadImageController.updateImage);

module.exports = router;
