const express = require("express");
const router = express.Router();
const salesController = require("../controllers/sales.controller");
const auth = require("../middleware/auth.middleware");
const ROLES = require("../config/roles");

router.post("/", auth([ROLES.CASHIER, ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]), salesController.createSale);
router.get("/", auth([ROLES.CASHIER, ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]), salesController.getSales);
router.get("/daily", auth([ROLES.CASHIER, ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]), salesController.getDailySales);
router.get("/:id", auth([ROLES.CASHIER, ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]), salesController.getSaleById);
router.get("/:id/receipt", auth([ROLES.CASHIER, ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]), salesController.getSaleReceipt);

module.exports = router; 