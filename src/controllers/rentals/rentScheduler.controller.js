const Rental = require('../../models/rental.model');
const Vendor = require('../../models/vendor.model');
const Setting = require('../../models/settings.model');
const cron = require('node-cron');

// Function to process fortnightly rent debit
const processFortnightlyRentDebit = async () => {
    console.log('Starting rent debit process:', new Date().toISOString());
    try {
        // Get the weekly rent amount from settings
        const rentSetting = await Setting.findOne({ key: 'rent-ticket-fee-per-week' });
        if (!rentSetting) {
            console.error('Weekly rent setting not found');
            return;
        }

        // Calculate fortnightly rent (2 weeks worth of rent)
        const weeklyRentAmount = rentSetting.value;
        const fortnightlyRentAmount = weeklyRentAmount * 2;
        console.log(`Weekly rent amount configured: ${weeklyRentAmount}`);
        console.log(`Fortnightly rent amount to deduct: ${fortnightlyRentAmount}`);

        // Get all active rentals
        const rentals = await Rental.find({ status: 'active' }).populate('stallId');

        console.log(`Processing ${rentals.length} active rentals for rent deduction`);

        // Process each rental
        for (const rental of rentals) {
            try {
                const beforeBalance = rental.balance;
                await rental.debitBalance(fortnightlyRentAmount);
                console.log(`Rental ${rental._id}: Balance changed from ${beforeBalance} to ${rental.balance}`);

                // Check if vendor exists before updating vendor balance
                if (rental.stallId && rental.stallId.vendor) {
                    const vendorId = rental.stallId.vendor.id;
                    const vendor = await Vendor.findById(vendorId);
                    if (vendor) {
                        vendor.account_balance -= fortnightlyRentAmount; // Update account balance
                        await vendor.save(); // Save updated vendor
                        console.log(`Vendor ${vendorId}: Account balance updated after rent deduction`);
                    } else {
                        console.error(`Vendor ${vendorId} not found.`);
                    }
                } else {
                    console.error(`Rental ${rental._id} does not have a valid stallId or vendor information.`);
                }
            } catch (error) {
                console.error(`Error processing rental ${rental._id}:`, error);
            }
        }
        console.log('Completed rent debit process:', new Date().toISOString());
    } catch (error) {
        console.error('Error in rent debit process:', error);
    }
};

// Schedule the rent debit to run every fortnight (1st and 15th of each month at midnight)
cron.schedule('0 0 1,15 * *', () => {
    console.log('Fortnightly rent deduction cron job triggered:', new Date().toISOString());
    processFortnightlyRentDebit();
}, {
    timezone: "Africa/Harare"
});

// Export for manual triggering if needed
exports.processFortnightlyRentDebit = processFortnightlyRentDebit;

// Function to manually trigger rent debit process
exports.manualRentDebit = async (req, res) => {
    try {
        // Check if user has superAdmin role
        if (!req.user || req.user.role !== 'superAdmin') {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized: Only super administrators can trigger manual rent debit'
            });
        }

        console.log('Manual rent debit process triggered by:', req.user.username);
        
        // Execute the rent debit process
        await processFortnightlyRentDebit();

        return res.status(200).json({
            success: true,
            message: 'Rent debit process completed successfully'
        });
    } catch (error) {
        console.error('Error in manual rent debit process:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to process rent debit',
            error: error.message
        });
    }
};