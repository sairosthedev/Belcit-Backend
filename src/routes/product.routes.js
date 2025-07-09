const express = require("express");
const router = express.Router();
const productsController = require("../controllers/products.controller");
const auth = require("../middleware/auth.middleware");
const ROLES = require("../config/roles");

const ALLOWED_ROLES = [ROLES.MANAGER, ROLES.STOCK_CLERK, ROLES.ADMIN, ROLES.SUPER_ADMIN, ROLES.CASHIER];

router.post("/", auth([ROLES.MANAGER, ROLES.STOCK_CLERK, ROLES.ADMIN, ROLES.SUPER_ADMIN]), productsController.createProduct);
router.get("/", auth(ALLOWED_ROLES), productsController.getProducts);
router.get("/barcode/:barcode", auth(ALLOWED_ROLES), productsController.getProductByBarcode);
router.get("/:id", auth([ROLES.MANAGER, ROLES.STOCK_CLERK, ROLES.ADMIN, ROLES.SUPER_ADMIN]), productsController.getProductById);
router.put("/:id", auth([ROLES.MANAGER, ROLES.STOCK_CLERK, ROLES.ADMIN, ROLES.SUPER_ADMIN]), productsController.updateProduct);
router.delete("/:id", auth([ROLES.MANAGER, ROLES.STOCK_CLERK, ROLES.ADMIN, ROLES.SUPER_ADMIN]), productsController.deleteProduct);

module.exports = router; 