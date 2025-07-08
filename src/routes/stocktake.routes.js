const express = require("express");
const router = express.Router();
const stocktakeController = require("../controllers/stocktake.controller");

router.post("/", stocktakeController.submitStocktake);
router.get("/", stocktakeController.getStocktakes);
router.get("/discrepancies", stocktakeController.getDiscrepancies);
router.post("/:id/confirm", stocktakeController.confirmAdjustment);

module.exports = router; 