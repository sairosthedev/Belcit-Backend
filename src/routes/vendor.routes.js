const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const vendorController = require('./../controllers/vendors/vendor.controller');
const findSpecificVendor = require('./../controllers/vendors/findSpecificVendor.controller');
const findAllVendors = require('./../controllers/vendors/findAllVendors.controller');
const uploadImageController = require('../controllers/vendors/uploadImage.controller');
const auth = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const ROLES = require('./../config/roles');
const { updateVendor } = require('./../controllers/vendors/updateVendor.controller');
const { deleteVendor } = require('./../controllers/vendors/deleteVendor.controller');

/**
 * @swagger
 * tags:
 *   name: Vendors
 *   description: Vendor management
 */

/**
 * @swagger
 * /api/vendors/register:
 *   post:
 *     summary: Register a new vendor
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               proof_of_residence:
 *                 type: boolean
 *               id_document:
 *                 type: boolean
 *               id_number:
 *                 type: string
 *               gender:
 *                 type: string
 *               address_line1:
 *                 type: string
 *               address_line2:
 *                 type: string
 *               city:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               old_stall_number:
 *                 type: string
 *               picture:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum:
 *                   - electrical
 *                   - dryGoods
 *                   - fruitsAndVeggies
 *                   - clothing
 *                   - packagingMaterials
 *                   - others
 *     responses:
 *       201:
 *         description: Vendor registered successfully
 *       400:
 *         description: Invalid input
 */
router.post('/register', auth([ROLES.SUPER_ADMIN, ROLES.CPU_OFFICER, ROLES.DATA_CAPTURER]), vendorController.registerValidation, vendorController.register);

/**
 * @swagger
 * /api/vendors/upload-image:
 *   post:
 *     summary: Upload vendor image
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *       400:
 *         description: Invalid input
 */
router.post('/upload-image', auth([ROLES.SUPER_ADMIN, ROLES.CPU_OFFICER, ROLES.DATA_CAPTURER]), uploadImageController);

/**
 * @swagger
 * /api/vendors/{vendorId}/verified:
 *   put:
 *     summary: Verify a vendor
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: vendorId
 *         in: path
 *         required: true
 *         description: ID of the vendor to verify
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               verification_status:
 *                 type: string
 *                 enum: [verified, rejected]
 *               verificationNotes:
 *                 type: string
 *               first_name:
 *                 type: string
 *               last_name:
 *                 type: string
 *               email:
 *                 type: string
 *               phone:
 *                 type: string
 *               proof_of_residence:
 *                 type: boolean
 *               id_document:
 *                 type: boolean
 *               id_number:
 *                 type: string
 *               gender:
 *                 type: string
 *               address_line1:
 *                 type: string
 *               address_line2:
 *                 type: string
 *               city:
 *                 type: string
 *               dob:
 *                 type: string
 *                 format: date
 *               old_stall_number:
 *                 type: string
 *               picture:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vendor verified successfully
 *       404:
 *         description: Vendor not found
 */
router.put('/:vendorId/verified', auth([ROLES.SUPER_ADMIN, ROLES.CPU_OFFICER]), vendorController.verifyValidation, vendorController.verify);

/**
 * @swagger
 * /api/vendors/:
 *   get:
 *     summary: Get all vendors
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of vendors
 *       404:
 *         description: No vendors found
 */
router.get('/', auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT, ROLES.CPU_OFFICER, ROLES.DATA_CAPTURER]), findAllVendors);

/**
 * @swagger
 * /api/vendors/{id}:
 *   get:
 *     summary: Get a specific vendor by ID
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the vendor to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor found
 *       404:
 *         description: Vendor not found
 */
router.get('/:id', auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT, ROLES.CPU_OFFICER, ROLES.DATA_CAPTURER]), findSpecificVendor);

/**
 * @swagger
 * /api/vendors/{id}:
 *   put:
 *     summary: Update a vendor
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the vendor to update
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor updated successfully
 *       404:
 *         description: Vendor not found
 */
router.put('/:id', auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT, ROLES.CPU_OFFICER, ROLES.DATA_CAPTURER]), updateVendor);

/**
 * @swagger
 * /api/vendors/{id}:
 *   delete:
 *     summary: Delete a vendor
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the vendor to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Vendor deleted successfully
 *       404:
 *         description: Vendor not found
 */
router.delete('/:id', auth([ROLES.SUPER_ADMIN, ROLES.CPU_OFFICER]), deleteVendor);

/**
 * @swagger
 * /api/vendors/update-image:
 *   put:
 *     summary: Update vendor image
 *     tags: [Vendors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Image updated successfully
 *       400:
 *         description: Invalid input
 */
router.put('/update-image', auth([ROLES.SUPER_ADMIN, ROLES.CPU_OFFICER, ROLES.DATA_CAPTURER]), uploadImageController);

module.exports = router;    