const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const auth = require('../middleware/auth.middleware');

// Check in/out routes (available to all staff)
// Note: checkin doesn't require auth for auto check-in on login
router.post('/checkin', attendanceController.checkIn);
router.post('/checkout', auth(), attendanceController.checkOut);
router.post('/auto-checkout', auth(), attendanceController.autoCheckOut);

// View own attendance (all staff)
router.get('/my-attendance', auth(['cashier', 'stockClerk', 'manager', 'admin', 'superAdmin']), attendanceController.getStaffAttendance);

// Get own attendance without admin role requirement
router.get('/my-attendance-simple', auth(), attendanceController.getMyAttendance);

// Admin routes
router.get('/', auth(['manager', 'admin', 'superAdmin']), attendanceController.getAllAttendance);
router.get('/staff/:staffId', auth(['manager', 'admin', 'superAdmin']), attendanceController.getStaffAttendance);
router.get('/summary', auth(['manager', 'admin', 'superAdmin']), attendanceController.getMonthlySummary);
router.post('/manual', auth(['admin', 'superAdmin']), attendanceController.createAttendance);

module.exports = router;
