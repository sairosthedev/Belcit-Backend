const express = require("express");
const router = express.Router();
const productsController = require("../controllers/products.controller");

router.post("/", productsController.createProduct);
router.get("/", productsController.getProducts);
router.get("/barcode/:barcode", productsController.getProductByBarcode);
router.get("/:id", productsController.getProductById);
router.put("/:id", productsController.updateProduct);
router.delete("/:id", productsController.deleteProduct);

module.exports = router; 