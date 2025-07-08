const Vendor = require("../../models/vendor.model");

const findSpecificVendor = async (req, res) => {
    const { id } = req.params;
    const vendor = await Vendor.findById(id);
    if (!vendor) {
        return res.status(404).json({ message: "Vendor not found" });
    }
    res.status(200).json(vendor);
};

module.exports = findSpecificVendor;