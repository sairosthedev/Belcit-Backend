const express = require("express");
const router = express.Router();
const salesController = require("../controllers/sales.controller");

router.post("/", salesController.createSale);
router.get("/", salesController.getSales);
router.get("/daily", salesController.getDailySales);
router.get("/:id", salesController.getSaleById);
router.get("/:id/receipt", salesController.getSaleReceipt);

module.exports = router; 