const Attendance = require('../models/attendance.model');
const Staff = require('../models/staff.model');
const mongoose = require('mongoose');

// Check in for staff
exports.checkIn = async (req, res) => {
  try {
    const { staffId, notes } = req.body;
    console.log('Check-in request for staffId:', staffId);
    
    if (!staffId) {
      console.error('No staffId provided in check-in request');
      return res.status(400).json({ message: 'Staff ID is required' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if there's an active session today (not checked out)
    const activeAttendance = await Attendance.findOne({
      staff: staffId,
      date: { $gte: today },
      checkOut: null,
      isActive: true
    });

    if (activeAttendance) {
      console.log('Staff already has an active session today:', staffId);
      return res.status(400).json({
        message: 'Already checked in today',
        attendance: activeAttendance
      });
    }

    const staff = await Staff.findById(staffId);
    if (!staff) {
      console.error('Staff not found:', staffId);
      return res.status(404).json({ message: 'Staff not found' });
    }

    console.log('Creating new attendance session for staff:', staff.firstName, staff.lastName);
    const attendance = await Attendance.create({
      staff: staffId,
      checkIn: new Date(),
      date: new Date(),
      status: 'present',
      notes,
      sessionId: new mongoose.Types.ObjectId().toString(),
      isActive: true
    });

    await attendance.populate('staff', 'firstName lastName username');

    console.log('Check-in successful for staff:', staffId);
    res.status(201).json({
      message: 'Checked in successfully',
      attendance
    });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Check out for staff
exports.checkOut = async (req, res) => {
  try {
    const { staffId } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      staff: staffId,
      date: { $gte: today },
      checkOut: null,
      isActive: true
    });

    if (!attendance) {
      return res.status(200).json({ 
        message: 'No active check-in found',
        success: false 
      });
    }

    attendance.checkOut = new Date();
    attendance.isActive = false; // Mark session as inactive
    
    // Calculate hours worked
    const hoursWorked = (attendance.checkOut - attendance.checkIn) / (1000 * 60 * 60);
    attendance.hoursWorked = Math.round(hoursWorked * 10) / 10;

    // Calculate overtime (assuming 8 hours is standard day)
    if (hoursWorked > 8) {
      attendance.overtime = Math.round((hoursWorked - 8) * 10) / 10;
    }

    await attendance.save();
    await attendance.populate('staff', 'firstName lastName username');

    res.json({
      message: 'Checked out successfully',
      attendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get attendance for a specific staff member
exports.getStaffAttendance = async (req, res) => {
  try {
    // Get staffId from params or user
    const staffId = req.params.staffId || req.user.userId;
    const { startDate, endDate } = req.query;

    const query = { staff: staffId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .populate('staff', 'firstName lastName username')
      .sort({ date: -1 });

    res.json({ attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get my own attendance (simplified version)
exports.getMyAttendance = async (req, res) => {
  try {
    const staffId = req.user.userId;
    const { startDate, endDate } = req.query;

    const query = { staff: staffId };
    
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const attendance = await Attendance.find(query)
      .populate('staff', 'firstName lastName username')
      .sort({ date: -1 });

    res.json({ attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all attendance
exports.getAllAttendance = async (req, res) => {
  try {
    const { date, status } = req.query;
    const query = {};

    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      query.date = { $gte: startDate, $lte: endDate };
    }

    if (status) {
      query.status = status;
    }

    const attendance = await Attendance.find(query)
      .populate('staff', 'firstName lastName username')
      .sort({ date: -1 });

    res.json({ attendance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get monthly attendance summary
exports.getMonthlySummary = async (req, res) => {
  try {
    const { staffId, month, year } = req.query;
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const query = {
      date: { $gte: startDate, $lte: endDate }
    };

    if (staffId) {
      query.staff = staffId;
    }

    const attendance = await Attendance.find(query)
      .populate('staff', 'firstName lastName');

    const summary = {
      totalDays: attendance.length,
      present: attendance.filter(a => a.status === 'present').length,
      absent: attendance.filter(a => a.status === 'absent').length,
      late: attendance.filter(a => a.status === 'late').length,
      totalHours: attendance.reduce((sum, a) => sum + (a.hoursWorked || 0), 0),
      totalOvertime: attendance.reduce((sum, a) => sum + (a.overtime || 0), 0),
      attendance
    };

    res.json({ summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Auto checkout on logout
exports.autoCheckOut = async (req, res) => {
  try {
    const { staffId } = req.body;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      staff: staffId,
      date: { $gte: today },
      checkOut: null,
      isActive: true
    });

    if (!attendance) {
      return res.status(200).json({ 
        message: 'No active check-in found to checkout',
        success: true 
      });
    }

    attendance.checkOut = new Date();
    attendance.isActive = false; // Mark session as inactive
    
    // Calculate hours worked
    const hoursWorked = (attendance.checkOut - attendance.checkIn) / (1000 * 60 * 60);
    attendance.hoursWorked = Math.round(hoursWorked * 10) / 10;

    // Calculate overtime (assuming 8 hours is standard day)
    if (hoursWorked > 8) {
      attendance.overtime = Math.round((hoursWorked - 8) * 10) / 10;
    }

    await attendance.save();

    res.json({
      message: 'Auto checkout successful',
      attendance
    });
  } catch (error) {
    console.error('Auto checkout error:', error);
    res.status(500).json({ message: error.message });
  }
};

// Manual attendance entry (for admin)
exports.createAttendance = async (req, res) => {
  try {
    const {
      staffId,
      checkIn,
      checkOut,
      date,
      status,
      notes
    } = req.body;

    const attendance = await Attendance.create({
      staff: staffId,
      checkIn: new Date(checkIn),
      checkOut: checkOut ? new Date(checkOut) : null,
      date: date ? new Date(date) : new Date(),
      status: status || 'present',
      notes
    });

    // Calculate hours if check out is provided
    if (attendance.checkOut) {
      const hoursWorked = (attendance.checkOut - attendance.checkIn) / (1000 * 60 * 60);
      attendance.hoursWorked = Math.round(hoursWorked * 10) / 10;
      
      if (hoursWorked > 8) {
        attendance.overtime = Math.round((hoursWorked - 8) * 10) / 10;
      }
      
      await attendance.save();
    }

    await attendance.populate('staff', 'firstName lastName username');

    res.status(201).json({
      message: 'Attendance created successfully',
      attendance
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
