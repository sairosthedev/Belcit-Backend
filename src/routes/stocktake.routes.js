const express = require("express");
const router = express.Router();
const stocktakeController = require("../controllers/stocktake.controller");
const auth = require("../middleware/auth.middleware");
const ROLES = require("../config/roles");

router.post("/", auth([ROLES.STOCK_CLERK, ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]), stocktakeController.submitStocktake);
router.get("/", auth([ROLES.STOCK_CLERK, ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]), stocktakeController.getStocktakes);
router.get("/discrepancies", auth([ROLES.STOCK_CLERK, ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]), stocktakeController.getDiscrepancies);
router.post("/:id/confirm", auth([ROLES.STOCK_CLERK, ROLES.MANAGER, ROLES.ADMIN, ROLES.SUPER_ADMIN]), stocktakeController.confirmAdjustment);

module.exports = router; 