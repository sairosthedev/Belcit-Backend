const customerModel = require("../../models/customer.model");
const Vendor = require("../../models/vendor.model");

const updateVendor = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const vendor = await Vendor.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    // if vendor has customer profile, also update it
    const customerProfile = await customerModel.findOne({
      trader: vendor._id,
    });
    if (customerProfile) {
      const {
        first_name,
        last_name,
        phone,
        email,
        address_line1,
        address_line2,
        city,
      } = vendor;
      await customerModel.updateOne(
        { trader: vendor._id },
        {
          $set: {
            firstName: first_name,
            lastName: last_name,
            phoneNumber: phone,
            email,
            address: {
              line1: address_line1,
              line2: address_line2,
              city: city,
            },
          },
        }
      );
    }
    res.status(200).json({ message: "Vendor updated successfully", vendor });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  updateVendor,
};
