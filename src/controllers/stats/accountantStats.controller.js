const Payment = require('../../models/payment.model');
const Ticket = require('../../models/ticket.model');

const getAccountantDashboardStats = async (req, res) => {
    try {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        // Get total revenue for the current date
        const totalRevenue = await Payment.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfDay, $lte: endOfDay },
                    status: { $ne: 'pending' } // Exclude pending payments if necessary
                }
            },
            {
                $group: {
                    _id: null,
                    total: { $sum: '$amount' }
                }
            }
        ]);

        // Get total number of payments for the current date
        const totalPayments = await Payment.countDocuments({
            createdAt: { $gte: startOfDay, $lte: endOfDay },
            status: { $ne: 'pending' } // Exclude pending payments if necessary
        });

        // Get total tickets for the current date
        const totalTickets = await Ticket.countDocuments({
            createdAt: { $gte: startOfDay, $lte: endOfDay }
        });

        // Get count of all ticket types for the current date
        const ticketTypesCount = await Ticket.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfDay, $lte: endOfDay }
                }
            },
            {
                $group: {
                    _id: '$ticketType',
                    count: { $sum: 1 }
                }
            }
        ]);

        return res.status(200).json({
            totalRevenue: totalRevenue[0] ? totalRevenue[0].total : 0,
            totalPayments,
            totalTickets,
            ticketTypesCount: ticketTypesCount.map(ticket => ({ type: ticket._id, count: ticket.count }))
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to retrieve dashboard stats' });
    }
};

module.exports = {
    getAccountantDashboardStats
};
