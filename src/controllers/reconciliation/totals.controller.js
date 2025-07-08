const Ticket = require('../../models/ticket.model');
const Payment = require('../../models/payment.model');

// Get tickets by cashier ID
exports.getTicketsByCashierId = async (req, res) => {
    const cashierId = req.params.cashierId; 
    try {
        const tickets = await Ticket.find({ 'cashier.id': cashierId })
            .select('ticketType paymentMethod amount')
            .sort({ createdAt: -1 });
        if (!tickets.length) return res.status(404).json({ message: 'No tickets found for this cashier' });
        res.status(200).json({ cashierId, tickets });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get tickets by cashier ID and date
exports.getTicketsByCashierIdAndDate = async (req, res) => {
    const { cashierId, date } = req.params;
    try {
        const startOfDay = new Date(date);
        const endOfDay = new Date(startOfDay);
        endOfDay.setDate(startOfDay.getDate() + 1);
        
        const tickets = await Ticket.find({ 'cashier.id': cashierId, 'details.entryTime': { $gte: startOfDay, $lt: endOfDay } })
            .select('ticketType paymentMethod amount')
            .sort({ createdAt: -1 });
        if (!tickets.length) return res.status(404).json({ message: 'No tickets found for this cashier on the specified date' });
        res.status(200).json({ cashierId, tickets });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get tickets by cashierId for the current day
exports.getTicketsForToday = async (req, res) => {
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    const cashierId = req.params.cashierId;
    
    try {
        const tickets = await Ticket.find({ 'cashier.id': cashierId, 'details.entryTime': { $gte: startOfDay, $lt: endOfDay } })
            .select('ticketType paymentMethod amount')
            .sort({ createdAt: -1 });
        if (!tickets.length) return res.status(404).json({ message: 'No tickets found for this cashier today' });
        res.status(200).json({ cashierId, tickets });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get total payments for the current day by cashier ID
exports.getTotalPaymentsForToday = async (req, res) => {
    const cashierId = req.params.cashierId;
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    try {
        const payments = await Payment.find({ 'cashier.id': cashierId, createdAt: { $gte: startOfDay, $lt: endOfDay } });
        const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
        res.status(200).json({ cashierId, totalAmount });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
