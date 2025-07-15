const Vendor = require("../../models/vendor.model");

const createVendor = async (req, res) => {
  try {
    const { name, address, contactInfo, email, phone } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const vendor = new Vendor({ name, address, contactInfo, email, phone });
    await vendor.save();
    res.status(201).json(vendor);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = createVendor; 