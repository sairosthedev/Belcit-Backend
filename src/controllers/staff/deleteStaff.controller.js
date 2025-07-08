const Staff = require('../../models/staff.model');

const deleteStaff = async (req, res) => {
    const { id } = req.params;

    try {
        const staff = await Staff.findByIdAndDelete(id);
        if (!staff) {
            return res.status(404).json({ message: "Staff not found" });
        }
        res.status(200).json({ message: "Staff deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    deleteStaff
};
