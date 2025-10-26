const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Staff',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  checkIn: {
    type: Date,
    required: true
  },
  checkOut: {
    type: Date,
    required: false
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'half-day', 'leave'],
    default: 'present'
  },
  notes: {
    type: String
  },
  hoursWorked: {
    type: Number,
    default: 0
  },
  overtime: {
    type: Number,
    default: 0
  },
  sessionId: {
    type: String,
    required: true,
    default: () => new mongoose.Types.ObjectId().toString()
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

// Index for efficient queries
attendanceSchema.index({ staff: 1, date: 1 });

// Virtual for calculating hours
attendanceSchema.virtual('totalHours').get(function() {
  if (this.checkOut && this.checkIn) {
    return Math.round((this.checkOut - this.checkIn) / (1000 * 60 * 60) * 10) / 10;
  }
  return 0;
});

module.exports = mongoose.model('Attendance', attendanceSchema);
