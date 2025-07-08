const Staff = require('../../models/staff.model');

const getAllStaff = async (req, res) => {
    try {
        const staff = await Staff.find({}).sort({ createdAt: -1 });
        res.status(200).json(staff);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

const getStaffById = async (req, res) => {
    try {
        const { id } = req.params;
        const staff = await Staff.findById(id);
        if (!staff) {
            return res.status(404).json({ message: "Staff not found" });
        }
        res.status(200).json(staff);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports = {
    getAllStaff,
    getStaffById
};
