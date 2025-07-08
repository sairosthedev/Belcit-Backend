const Staff = require('../../models/staff.model');

const updateStaff = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    try {
        const staff = await Staff.findByIdAndUpdate(id, updateData, { new: true });
        if (!staff) {
            return res.status(404).json({ message: "Staff not found" });
        }
        res.status(200).json({ message: "Staff updated successfully", staff });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    updateStaff
};
