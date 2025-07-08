const Payment = require('../../models/payment.model');

const getCurrentRevenue = async (req, res) => {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const startOfYear = new Date();
    startOfYear.setMonth(0, 1);
    startOfYear.setHours(0, 0, 0, 0);

    try {
        const dailyRevenue = await Payment.aggregate([
            { $match: { createdAt: { $gte: startOfDay } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const weeklyRevenue = await Payment.aggregate([
            { $match: { createdAt: { $gte: startOfWeek } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const monthlyRevenue = await Payment.aggregate([
            { $match: { createdAt: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const yearlyRevenue = await Payment.aggregate([
            { $match: { createdAt: { $gte: startOfYear } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        return res.status(200).json({
            dailyRevenue: dailyRevenue[0]?.total || 0,
            weeklyRevenue: weeklyRevenue[0]?.total || 0,
            monthlyRevenue: monthlyRevenue[0]?.total || 0,
            yearlyRevenue: yearlyRevenue[0]?.total || 0,
        });
    } catch (error) {
        console.error('Error retrieving revenue:', error);
        return res.status(500).json({ message: 'Failed to retrieve revenue' });
    }
};

module.exports = { getCurrentRevenue };
