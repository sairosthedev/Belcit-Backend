const Vendor = require('../../models/vendor.model');

const deleteVendor = async (req, res) => {
    const { id } = req.params;

    try {
        const vendor = await Vendor.findByIdAndDelete(id);
        if (!vendor) {
            return res.status(404).json({ message: "Vendor not found" });
        }
        res.status(200).json({ message: "Vendor deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    deleteVendor
};
