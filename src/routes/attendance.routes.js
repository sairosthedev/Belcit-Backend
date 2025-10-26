const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance.controller');
const auth = require('../middleware/auth.middleware');

// Check in/out routes (available to all staff)
router.post('/checkin', auth(), attendanceController.checkIn);
router.post('/checkout', auth(), attendanceController.checkOut);

// View own attendance (all staff)
router.get('/my-attendance', auth(['cashier', 'stockClerk', 'manager', 'admin', 'superAdmin']), attendanceController.getStaffAttendance);

// Admin routes
router.get('/', auth(['manager', 'admin', 'superAdmin']), attendanceController.getAllAttendance);
router.get('/staff/:staffId', auth(['manager', 'admin', 'superAdmin']), attendanceController.getStaffAttendance);
router.get('/summary', auth(['manager', 'admin', 'superAdmin']), attendanceController.getMonthlySummary);
router.post('/manual', auth(['admin', 'superAdmin']), attendanceController.createAttendance);

module.exports = router;
