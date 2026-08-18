const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Complaint title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Complaint description is required'],
    trim: true
  },
  category: {
    type: String, // Store name directly or ObjectId. Standard string matches input well. Let's store category name.
    required: [true, 'Complaint category is required']
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  image: {
    type: String, // URL/Path to uploaded image
    default: null
  },
  citizenId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  department: {
    type: String,
    default: 'Unassigned'
  },
  assignedOfficer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Pending', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'],
    default: 'Pending'
  },
  remarks: {
    type: String,
    default: ''
  },
  resolutionImage: {
    type: String, // Proof of resolution uploaded by officer
    default: null
  }
}, { timestamps: true });

// Pre-save hook to generate sequential complaintId
complaintSchema.pre('save', async function(next) {
  if (!this.complaintId) {
    try {
      const count = await mongoose.model('Complaint').countDocuments();
      this.complaintId = 'CMP' + (1000 + count + 1);
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Complaint', complaintSchema);
