const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/reports.controller");

router.get("/profit-loss", reportsController.profitLoss);
router.get("/category-sales", reportsController.categorySales);
router.get("/top-selling-products", reportsController.topSellingProducts);
router.get("/sales-by-cashier", reportsController.salesByCashier);
router.get("/expense-breakdown", reportsController.expenseBreakdown);
router.get("/top-products", reportsController.topProducts);
router.get("/sales-over-time", reportsController.salesOverTime);
router.get("/expenses-over-time", reportsController.expensesOverTime);
router.get("/sales-by-category", reportsController.salesByCategory);

module.exports = router; 