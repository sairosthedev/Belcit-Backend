const express = require("express");
const router = express.Router();
const findAllVendors = require("../controllers/vendors/findAllVendors.controller");
const createVendor = require("../controllers/vendors/createVendor.controller");

router.post("/", createVendor);
router.get("/", findAllVendors);

module.exports = router; 