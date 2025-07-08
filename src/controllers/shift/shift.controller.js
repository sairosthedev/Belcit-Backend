const Shift = require('../../models/shift.model');
const Payment = require('../../models/payment.model');
const Reconciliation = require('../../models/reconciliation.model');

// Start a new shift
const startShift = async (req, res) => {
    const { cashierId, username } = req.body;
    try {
        const newShift = new Shift({
            cashier: {
                id: cashierId,
                username: username
            },
            startTime: Date.now(),
            expectedAmount: 0,
            totalAmount: 0,
            amountReceived: 0,
            surplus: 0,
            deficit: 0,
            status: 'active'
        });
        await newShift.save();
        return res.status(201).json(newShift);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to start shift' });
    }
};

// End a shift
const endShift = async (req, res) => {
    const { shiftId } = req.params;
    const { amountReceived, comment } = req.body;
    
    try {
        const shift = await Shift.findById(shiftId);
        if (!shift) {
            return res.status(404).json({ message: 'Shift not found' });
        }

        if (shift.status === 'inactive') {
            return res.status(400).json({ message: 'Shift is already ended' });
        }

        // Calculate total revenue from payments during the shift period
        const payments = await Payment.find({
            'cashier.id': shift.cashier.id,
            createdAt: { 
                $gte: shift.startTime,
                $lte: Date.now()
            }
        });

        const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0);

        // Calculate deficit and surplus
        const deficit = amountReceived < totalRevenue ? totalRevenue - amountReceived : 0;
        const surplus = amountReceived > totalRevenue ? amountReceived - totalRevenue : 0;

        // Update shift details
        shift.endTime = Date.now();
        shift.status = 'inactive';
        shift.expectedAmount = totalRevenue;
        shift.totalAmount = totalRevenue; 
        shift.amountReceived = amountReceived;
        shift.surplus = surplus;
        shift.deficit = deficit;

        // Create reconciliation record
        const reconciliationData = {
            amount: totalRevenue,
            amountReceived,
            deficit,
            surplus,
            comment: (amountReceived !== totalRevenue) ? comment : 'Equal',
            cashier: {
                id: shift.cashier.id,
                username: shift.cashier.username
            }
        };

        const [updatedShift, reconciliation] = await Promise.all([
            shift.save(),
            Reconciliation.create(reconciliationData)
        ]);

        return res.status(200).json({
            shift: updatedShift,
            reconciliation: {
                totalRevenue,
                amountReceived,
                deficit,
                surplus,
                comment: reconciliation.comment
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to end shift' });
    }
};

// Get shifts by latest record
const getAllShifts = async (req, res) => {
    try {
        const shifts = await Shift.find().sort({ createdAt: -1 });
        return res.status(200).json(shifts);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to retrieve shifts' });
    }
};

// Get shifts by date range
const getShiftsByDateRange = async (req, res) => {
    const { startDate, endDate } = req.query;
    try {
        const shifts = await Shift.find({
            startTime: { $gte: new Date(startDate), $lte: new Date(endDate) }
        }).sort({ createdAt: -1 });
        return res.status(200).json(shifts);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to retrieve shifts' });
    }
};

// Get shifts by cashier ID
const getShiftsByCashierId = async (req, res) => {
    const { cashierId } = req.params;
    try {
        const shifts = await Shift.find({ 'cashier.id': cashierId }).sort({ createdAt: -1 });
        return res.status(200).json(shifts);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Failed to retrieve shifts' });
    }
};

module.exports = {
    startShift,
    endShift,
    getAllShifts,
    getShiftsByDateRange,
    getShiftsByCashierId
};
