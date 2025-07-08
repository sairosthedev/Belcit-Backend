const express = require("express");
const router = express.Router();
const inventoryController = require("../controllers/inventory.controller");

router.post("/stock-in", inventoryController.stockIn);
router.post("/stock-out", inventoryController.stockOut);
router.post("/adjust", inventoryController.adjustStock);
router.get("/transactions", inventoryController.getInventoryTransactions);
router.get("/low-stock", inventoryController.getLowStockProducts);

module.exports = router; 