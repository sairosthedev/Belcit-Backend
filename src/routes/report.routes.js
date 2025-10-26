const express = require("express");
const router = express.Router();
const reportsController = require("../controllers/reports.controller");
const auth = require("../middleware/auth.middleware");
const ROLES = require("../config/roles");


// All reports require authentication and admin/manager roles
router.get("/profit-loss", auth([ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPER_ADMIN]), reportsController.profitLoss);
router.get("/category-sales", auth([ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPER_ADMIN]), reportsController.categorySales);
router.get("/top-selling-products", auth([ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPER_ADMIN]), reportsController.topSellingProducts);
router.get("/sales-by-cashier", auth([ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPER_ADMIN]), reportsController.salesByCashier);
router.get("/expense-breakdown", auth([ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPER_ADMIN]), reportsController.expenseBreakdown);
router.get("/top-products", auth([ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPER_ADMIN]), reportsController.topProducts);
router.get("/sales-over-time", auth([ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPER_ADMIN]), reportsController.salesOverTime);
router.get("/expenses-over-time", auth([ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPER_ADMIN]), reportsController.expensesOverTime);
router.get("/sales-by-category", auth([ROLES.ADMIN, ROLES.MANAGER, ROLES.SUPER_ADMIN]), reportsController.salesByCategory);

module.exports = router; 