const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/reports.controller");

router.get("/profit-loss", reportsController.profitLoss);
router.get("/category-sales", reportsController.categorySales);
router.get("/top-selling-products", reportsController.topSellingProducts);
router.get("/sales-by-cashier", reportsController.salesByCashier);
router.get("/expense-breakdown", reportsController.expenseBreakdown);

module.exports = router; 