const Complaint = require('../models/Complaint');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const fs = require('fs');
const path = require('path');

// Helper to log activities
const logActivity = async (action, performedBy, complaintId, details) => {
  try {
    await ActivityLog.create({ action, performedBy, complaintId, details });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

// Helper to send notifications
const sendNotification = async (userId, message) => {
  try {
    await Notification.create({ userId, message });
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (Citizen)
exports.createComplaint = async (req, res) => {
  try {
    const { title, description, category, location, priority } = req.body;

    let imagePath = null;
    if (req.file) {
      // Store relative path for static serving
      imagePath = `/uploads/${req.file.filename}`;
    }

    const complaint = new Complaint({
      title,
      description,
      category,
      location,
      image: imagePath,
      citizenId: req.user._id,
      priority: priority || 'Medium',
      department: category
    });

    const savedComplaint = await complaint.save();

    // Log action
    await logActivity(
      'COMPLAINT_CREATED',
      req.user._id,
      savedComplaint._id,
      `Citizen ${req.user.fullName} created complaint ${savedComplaint.complaintId}`
    );

    // Notify Citizen
    await sendNotification(
      req.user._id,
      `Your complaint ${savedComplaint.complaintId} has been successfully filed under '${category}'.`
    );

    res.status(201).json({ success: true, complaint: savedComplaint });
  } catch (error) {
    console.error('Create Complaint Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's complaints
// @route   GET /api/complaints/my
// @access  Private (Citizen)
exports.getMyComplaints = async (req, res) => {
  try {
    const { status, category, priority, search } = req.query;
    
    let query = { citizenId: req.user._id };

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { complaintId: { $regex: search, $options: 'i' } }
      ];
    }

    const complaints = await Complaint.find(query).sort({ createdAt: -1 });
    res.json({ success: true, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get complaint by ID
// @route   GET /api/complaints/:id
// @access  Private
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('citizenId', 'fullName email phone address')
      .populate('assignedOfficer', 'fullName email phone department');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Citizen can only view their own complaints. Officer and Admin can view all.
    if (req.user.role === 'Citizen' && complaint.citizenId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this complaint' });
    }

    res.json({ success: true, complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update pending complaint
// @route   PUT /api/complaints/:id
// @access  Private (Citizen - Pending only)
exports.updateComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Check ownership
    if (complaint.citizenId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this complaint' });
    }

    // Check status
    if (complaint.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending complaints can be updated. This complaint is already ' + complaint.status
      });
    }

    const { title, description, category, location, priority } = req.body;

    complaint.title = title || complaint.title;
    complaint.description = description || complaint.description;
    complaint.category = category || complaint.category;
    complaint.location = location || complaint.location;
    complaint.priority = priority || complaint.priority;

    if (req.file) {
      // Delete old file if exists
      if (complaint.image) {
        const oldPath = path.join(__dirname, '..', complaint.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      complaint.image = `/uploads/${req.file.filename}`;
    }

    const updatedComplaint = await complaint.save();

    await logActivity(
      'COMPLAINT_UPDATED',
      req.user._id,
      updatedComplaint._id,
      `Citizen updated details of complaint ${updatedComplaint.complaintId}`
    );

    res.json({ success: true, complaint: updatedComplaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete pending complaint
// @route   DELETE /api/complaints/:id
// @access  Private (Citizen - Pending only)
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Check ownership
    if (complaint.citizenId.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this complaint' });
    }

    // Check status
    if (complaint.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending complaints can be deleted. This complaint is already ' + complaint.status
      });
    }

    // Delete image file if exists
    if (complaint.image) {
      const imgPath = path.join(__dirname, '..', complaint.image);
      if (fs.existsSync(imgPath)) {
        fs.unlinkSync(imgPath);
      }
    }

    const complaintIdVal = complaint.complaintId;
    await Complaint.findByIdAndDelete(req.params.id);

    await logActivity(
      'COMPLAINT_DELETED',
      req.user._id,
      null,
      `Citizen deleted pending complaint ${complaintIdVal}`
    );

    res.json({ success: true, message: `Complaint ${complaintIdVal} deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
