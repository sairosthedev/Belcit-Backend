const express = require("express");
const router = express.Router();
const {
  getAllCurrencies,
  createCurrency,
  updateCurrency,
  deleteCurrency,
  getExchangeRates,
  createExchangeRate,
  updateExchangeRate,
  deleteExchangeRate,
  getAllExchangeRates
} = require("../controllers/payments/currency.controller");
const auth = require("../middleware/auth.middleware");
const ROLES = require("../config/roles");

/**
 * @swagger
 * tags:
 *   name: Currencies
 *   description: Currency management
 */

/**
 * @swagger
 * /api/currencies/:
 *   get:
 *     summary: Get all currencies
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of currencies
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Currency'
 *       500:
 *         description: Failed to get currencies
 */
router.get("/", auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT, ROLES.CASHIER]), getAllCurrencies);

/**
 * @swagger
 * /api/currencies/:
 *   post:
 *     summary: Create a new currency
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Currency'
 *     responses:
 *       201:
 *         description: Currency created successfully
 *       500:
 *         description: Failed to create currency
 */
router.post("/", auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]), createCurrency);

/**
 * @swagger
 * /api/currencies/{id}:
 *   put:
 *     summary: Update a currency
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the currency to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Currency'
 *     responses:
 *       200:
 *         description: Currency updated successfully
 *       404:
 *         description: Currency not found
 *       500:
 *         description: Failed to update currency
 */
router.put("/:id", auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]), updateCurrency);

/**
 * @swagger
 * /api/currencies/{id}:
 *   delete:
 *     summary: Delete a currency
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the currency to delete
 *     responses:
 *       200:
 *         description: Currency deleted successfully
 *       404:
 *         description: Currency not found
 *       500:
 *         description: Failed to delete currency
 */
router.delete("/:id", auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]), deleteCurrency);

/**
 * @swagger
 * /api/currencies/exchange-rates/{currencyCode}:
 *   get:
 *     summary: Get exchange rates for a specific currency
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: currencyCode
 *         in: path
 *         required: true
 *         description: The currency code to get exchange rates for
 *     responses:
 *       200:
 *         description: A list of exchange rates
 *       404:
 *         description: No exchange rates found for this currency
 *       500:
 *         description: Failed to get exchange rates
 */
router.get("/exchange-rates/:currencyCode", auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT, ROLES.CASHIER]), getExchangeRates);

/**
 * @swagger
 * /api/currencies/exchange-rate:
 *   post:
 *     summary: Create a new exchange rate
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               toCurrency:
 *                 type: string
 *               rate:
 *                 type: number
 *             required:
 *               - toCurrency
 *               - rate
 *     responses:
 *       201:
 *         description: Exchange rate created successfully
 *       500:
 *         description: Failed to create exchange rate
 */
router.post("/exchange-rate", auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]), createExchangeRate);

/**
 * @swagger
 * /api/currencies/exchange-rate/{id}:
 *   put:
 *     summary: Update an exchange rate
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the exchange rate to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               toCurrency:
 *                 type: string
 *               rate:
 *                 type: number
 *             required:
 *               - toCurrency
 *               - rate
 *     responses:
 *       200:
 *         description: Exchange rate updated successfully
 *       404:
 *         description: Exchange rate not found
 *       500:
 *         description: Failed to update exchange rate
 */
router.put("/exchange-rate/:id", auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]), updateExchangeRate);

/**
 * @swagger
 * /api/currencies/exchange-rate/{id}:
 *   delete:
 *     summary: Delete an exchange rate
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: The ID of the exchange rate to delete
 *     responses:
 *       200:
 *         description: Exchange rate deleted successfully
 *       404:
 *         description: Exchange rate not found
 *       500:
 *         description: Failed to delete exchange rate
 */
router.delete("/exchange-rate/:id", auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT]), deleteExchangeRate);

/**
 * @swagger
 * /api/currencies/exchange-rates:
 *   get:
 *     summary: Get all exchange rates
 *     tags: [Currencies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of exchange rates
 *       500:
 *         description: Failed to get exchange rates
 */
router.get("/exchange-rates", auth([ROLES.SUPER_ADMIN, ROLES.ACCOUNTANT, ROLES.CASHIER]), getAllExchangeRates);

module.exports = router;
