const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  action: {
    type: String,
    required: true
  },
  performedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Complaint',
    default: null
  },
  details: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
