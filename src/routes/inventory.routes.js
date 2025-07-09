const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventory.controller");
const auth = require("../middleware/auth.middleware");
const ROLES = require("../config/roles");

router.post("/stock-in", auth([ROLES.MANAGER, ROLES.STOCK_CLERK, ROLES.ADMIN, ROLES.SUPER_ADMIN]), inventoryController.stockIn);
router.post("/stock-out", auth([ROLES.MANAGER, ROLES.STOCK_CLERK, ROLES.ADMIN, ROLES.SUPER_ADMIN]), inventoryController.stockOut);
router.post("/adjust", auth([ROLES.MANAGER, ROLES.STOCK_CLERK, ROLES.ADMIN, ROLES.SUPER_ADMIN]), inventoryController.adjustStock);
router.get("/transactions", auth([ROLES.MANAGER, ROLES.STOCK_CLERK, ROLES.ADMIN, ROLES.SUPER_ADMIN]), inventoryController.getInventoryTransactions);
router.get("/low-stock", auth([ROLES.MANAGER, ROLES.STOCK_CLERK, ROLES.ADMIN, ROLES.SUPER_ADMIN]), inventoryController.getLowStockProducts);

module.exports = router; 