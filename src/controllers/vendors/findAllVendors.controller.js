const Vendor = require("../../models/vendor.model");

const findAllVendors = async (req, res) => {
    const vendors = await Vendor.find().sort({ createdAt: -1 });
    res.status(200).json(vendors);
};

module.exports = findAllVendors;