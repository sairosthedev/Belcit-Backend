const express = require("express");
const router = express.Router();
const settingsController = require("../controllers/settings/settings.controller");
const auth = require("../middleware/auth.middleware");
const ROLES = require("../config/roles");

/**
 * @swagger
 * tags:
 *   name: Settings
 *   description: Settings management
 */

/**
 * @swagger
 * /settings:
 *   get:
 *     summary: Get all settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of settings
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   key:
 *                     type: string
 *                   value:
 *                     type: object
 *       500:
 *         description: Failed to fetch settings
 */
router.get("/", async (req, res) => {
  try {
    const settings = await settingsController.getAllSettings();
    res.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

/**
 * @swagger
 * /api/settings/{key}:
 *   put:
 *     summary: Update a specific setting
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: key
 *         in: path
 *         required: true
 *         description: The key of the setting to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: object
 *     responses:
 *       200:
 *         description: Setting updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 key:
 *                   type: string
 *                 value:
 *                   type: object
 *       404:
 *         description: Setting not found
 *       500:
 *         description: Failed to update setting
 */
router.put(
  "/:key",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]),
  async (req, res) => {
    const { key } = req.params;
    const { value } = req.body;
    try {
      const updatedSetting = await settingsController.updateSetting(key, value);
      if (!updatedSetting) {
        return res.status(404).json({ error: "Setting not found" });
      }
      res.json(updatedSetting);
    } catch (error) {
      console.error("Error updating setting:", error);
      res.status(500).json({ error: "Failed to update setting" });
    }
  }
);

/**
 * @swagger
 * /api/settings/create:
 *   post:
 *     summary: Create a new setting
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *               value:
 *                 type: object
 *             required:
 *               - key
 *               - value
 *     responses:
 *       201:
 *         description: Setting created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Setting created successfully
 *                 setting:
 *                   type: object
 *       500:
 *         description: Error creating setting
 */
router.post(
  "/",
  auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]),
  settingsController.createSetting
);

module.exports = router;
