const Staff = require('../../models/staff.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { ValidationError } = require('../../utils/errors');
const Shift = require('../../models/shift.model');

exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    
    const staff = await Staff.findOne({ username });
    if (!staff) {
      throw new ValidationError('Invalid credentials');
    }

    // Check if the staff status is inactive
    if (staff.status === 'inactive') {
      throw new ValidationError('Staff account was deactivated');
    }

    const isMatch = await bcrypt.compare(password, staff.password);
    if (!isMatch) {
      throw new ValidationError('Invalid credentials');
    }

    const token = jwt.sign(
      { userId: staff._id, role: staff.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Start shift if the user is a cashier and doesn't have an active shift
    if (staff.role === 'cashier') {
      const activeShift = await Shift.findOne({
        'cashier.id': staff._id,
        status: 'active'
      });

      if (!activeShift) {
        const newShift = new Shift({
          cashier: {
            id: staff._id,
            username: staff.username
          },
          startTime: Date.now(),
          revenue: 0,
          surplus: 0,
          deficit: 0,
          status: 'active'
        });
        await newShift.save();
      }
    }

    res.json({ token, role: staff.role });
  } catch (error) {
    next(error);
  }
};

exports.register = async (req, res, next) => {
  try {
    const { firstName, lastName, idNumber, username, password, role, phonenumber, email } = req.body;

    if (password.length < 6) {
      throw new ValidationError('Password must be at least 6 characters long');
    }
    
    const existingStaff = await Staff.findOne({ username });
    if (existingStaff) {
      throw new ValidationError('Username already exists');
    }

    const staff = new Staff({ firstName, lastName, idNumber, username, password, role, phonenumber, email });
    await staff.save();

    res.status(201).json({ message: 'Staff registered successfully' });
  } catch (error) {
    next(error);
  }
};

exports.deactivateStaff = async (req, res, next) => {
  try {
    const { id } = req.params;

    const staff = await Staff.findById(id);
    if (!staff) {
      throw new ValidationError('Staff member not found');
    }

    staff.status = 'inactive';
    await staff.save();

    res.status(200).json({ message: 'Staff member deactivated successfully' });
  } catch (error) {
    next(error);
  }
};

exports.activateStaff = async (req, res, next) => {
  try {
    const { id } = req.params;

    const staff = await Staff.findById(id);
    if (!staff) {
      throw new ValidationError('Staff member not found');
    }

    staff.status = 'active';
    await staff.save();

    res.status(200).json({ message: 'Staff member activated successfully' });
  } catch (error) {
    next(error);
  }
};

// Reset password
exports.resetPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newPassword, currentPassword } = req.body;

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({ message: 'Staff member not found' });
    }

    // Check if the current password matches
    const isMatch = await staff.comparePassword(currentPassword); // Assuming comparePassword is a method on the Staff model
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    staff.password = newPassword;
    await staff.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }
    next(error);
  }
};