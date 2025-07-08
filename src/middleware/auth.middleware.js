const jwt = require('jsonwebtoken');
const Staff = require('../models/staff.model');

const auth = (roles = []) => {
  return async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;

      // Check if the staff member is active
      const staff = await Staff.findById(req.user.userId);
      if (!staff || staff.status !== 'active') {
        return res.status(403).json({ message: 'Unauthorized access' });
      }

      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Unauthorized access' });
      }

      next();
    } catch (error) {
      res.status(401).json({ message: 'Invalid token' });
    }
  };
};

module.exports = auth;