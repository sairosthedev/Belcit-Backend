const Payment = require('../../models/payment.model');
const Ticket = require('../../models/ticket.model');
const Staff = require('../../models/staff.model');
const Vendor = require('../../models/vendor.model');
// Removed: const {Stall} = require('../../models/stall.model');
// Removed: const Farmer = require('../../models/farmer.model');

const getAdminDashboardStats = async (req, res) => {
    try {
        // Get total staff count
        const totalStaff = await Staff.countDocuments();

        // Get total payments
        const totalPayments = await Payment.countDocuments({
            status: { $ne: 'pending' } // Exclude pending payments if necessary
        });

        // Get total tickets
        const totalTickets = await Ticket.countDocuments();

        // Get total vendors
        const totalVendors = await Vendor.countDocuments();

        // Removed: Get total stalls
        // Removed: Get total farmers

        return res.status(200).json({
            totalStaff,
            totalPayments,
            totalTickets,
            totalVendors
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to retrieve admin dashboard stats' });
    }
};

module.exports = {
    getAdminDashboardStats
}; 