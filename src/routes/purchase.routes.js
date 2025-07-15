const express = require("express");
const router = express.Router();
const purchasesController = require("../controllers/purchases.controller");

router.post("/", purchasesController.createPurchase);
router.post("/:id/receive", purchasesController.receivePurchase);
router.post("/:id/cancel", purchasesController.cancelPurchase);
router.get("/", purchasesController.getPurchases);
router.get("/:id", purchasesController.getPurchaseById);

module.exports = router; 