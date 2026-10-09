const mongoose = require('mongoose');
const Complaint = require('../models/Complaint');
const ActivityLog = require('../models/ActivityLog');
const { sendNotification } = require('../utils/notificationService');
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

// @desc    Get all complaints assigned to the officer or unassigned in their department
// @route   GET /api/officer/complaints
// @access  Private (Department Officer)
exports.getAssignedComplaints = async (req, res) => {
  try {
    const { status, priority, search } = req.query;

    const baseFilter = {
      $or: [
        { assignedOfficer: req.user._id },
        {
          department: req.user.department || '',
          assignedOfficer: null
        }
      ]
    };

    let andConditions = [baseFilter];

    if (status) {
      andConditions.push({ status });
    }
    if (priority) {
      andConditions.push({ priority });
    }
    if (search) {
      andConditions.push({
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
          { complaintId: { $regex: search, $options: 'i' } }
        ]
      });
    }

    const query = { $and: andConditions };

    const complaints = await Complaint.find(query)
      .populate('citizenId', 'fullName email phone address')
      .populate('assignedOfficer', 'fullName email phone department')
      .sort({ updatedAt: -1 });

    res.json({ success: true, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update complaint status, remarks, and upload resolution proof
// @route   PUT /api/officer/complaints/:id
// @access  Private (Department Officer)
exports.updateAssignedComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Verify officer authorization: must be assigned to them, OR unassigned and in their department
    const assignedOfficerId = complaint.assignedOfficer?._id || complaint.assignedOfficer;
    const isAssignedToMe = assignedOfficerId && assignedOfficerId.toString() === req.user.id;
    const isUnassignedInMyDept = !assignedOfficerId && complaint.department === req.user.department;

    if (!isAssignedToMe && !isUnassignedInMyDept) {
      return res.status(403).json({ success: false, message: 'Not authorized. This complaint is not assigned to you or your department.' });
    }

    const { status, remarks } = req.body;

    // Allowed status transitions for officers
    const allowedStatuses = ['Under Review', 'Assigned', 'In Progress', 'Resolved'];
    if (status && !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status update. Officers can only set status to: ' + allowedStatuses.join(', ')
      });
    }

    const oldStatus = complaint.status;
    if (status) complaint.status = status;
    if (remarks !== undefined) complaint.remarks = remarks;

    // If it was unassigned, automatically assign it to the claiming officer
    if (!assignedOfficerId) {
      complaint.assignedOfficer = req.user._id;
      // If the status is still Pending/Under Review/Assigned, progress it to In Progress automatically on action
      if (complaint.status === 'Pending' || complaint.status === 'Under Review' || complaint.status === 'Assigned') {
        complaint.status = 'In Progress';
      }
    }

    if (req.file) {
      // Remove old resolution image if exists
      if (complaint.resolutionImage) {
        const oldProofPath = path.join(__dirname, '..', complaint.resolutionImage);
        if (fs.existsSync(oldProofPath)) {
          fs.unlinkSync(oldProofPath);
        }
      }
      complaint.resolutionImage = `/uploads/${req.file.filename}`;
    }

    const updatedComplaint = await complaint.save();

    // Log Activity
    await logActivity(
      'OFFICER_UPDATE',
      req.user._id,
      updatedComplaint._id,
      `Officer ${req.user.fullName} updated complaint ${updatedComplaint.complaintId} status from ${oldStatus} to ${updatedComplaint.status}`
    );

    // Notify Citizen about status change
    let notifyMessage = `Your complaint ${updatedComplaint.complaintId} status has been updated to '${updatedComplaint.status}'.`;
    if (updatedComplaint.status === 'In Progress') {
      notifyMessage = `Your complaint ${updatedComplaint.complaintId} is now in progress.`;
    } else if (updatedComplaint.status === 'Resolved') {
      notifyMessage = `Your complaint ${updatedComplaint.complaintId} has been resolved. Remarks: "${updatedComplaint.remarks}"`;
    } else if (updatedComplaint.status === 'Assigned') {
      notifyMessage = `Your complaint ${updatedComplaint.complaintId} has been assigned to an officer.`;
    }

    await sendNotification(updatedComplaint.citizenId, notifyMessage);

    res.json({ success: true, complaint: updatedComplaint });
  } catch (error) {
    console.error('Officer Update Complaint Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard metrics for Officer
// @route   GET /api/officer/dashboard & GET /api/analytics/officer
// @access  Private (Department Officer)
exports.getOfficerDashboardMetrics = async (req, res) => {
  try {
    const officerObjectId = new mongoose.Types.ObjectId(req.user._id);
    const baseMatch = {
      $or: [
        { assignedOfficer: officerObjectId },
        {
          department: req.user.department || '',
          assignedOfficer: null
        }
      ]
    };

    // Aggregate strictly for the logged-in officer via MongoDB aggregation pipeline
    const [aggregated] = await Complaint.aggregate([
      { $match: baseMatch },
      {
        $facet: {
          total: [{ $count: 'count' }],
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          byPriority: [
            { $group: { _id: '$priority', count: { $sum: 1 } } }
          ],
          resolvedTimes: [
            { $match: { status: 'Resolved' } },
            {
              $project: {
                durationMs: { $subtract: ['$updatedAt', '$createdAt'] }
              }
            },
            {
              $group: {
                _id: null,
                avgDurationMs: { $avg: '$durationMs' }
              }
            }
          ]
        }
      }
    ]);

    const total = aggregated?.total[0]?.count || 0;
    const statusMap = {};
    (aggregated?.byStatus || []).forEach(item => {
      statusMap[item._id] = item.count;
    });

    const priorityMap = {};
    (aggregated?.byPriority || []).forEach(item => {
      priorityMap[item._id] = item.count;
    });

    const pending = statusMap['Pending'] || 0;
    const underReview = statusMap['Under Review'] || 0;
    const assigned = statusMap['Assigned'] || 0;
    const inProgress = statusMap['In Progress'] || 0;
    const resolved = statusMap['Resolved'] || 0;
    const rejected = statusMap['Rejected'] || 0;
    const pendingTasks = pending + underReview + assigned;

    const highPriority = priorityMap['High'] || 0;
    const mediumPriority = priorityMap['Medium'] || 0;
    const lowPriority = priorityMap['Low'] || 0;

    const resolutionPercentage = total > 0 ? Math.round((resolved / total) * 100) : 0;

    let avgResolutionDays = 0;
    if (aggregated?.resolvedTimes?.length > 0 && aggregated.resolvedTimes[0].avgDurationMs) {
      avgResolutionDays = +(aggregated.resolvedTimes[0].avgDurationMs / (1000 * 60 * 60 * 24)).toFixed(1);
    }

    const statusDistribution = [
      { name: 'Resolved', count: resolved, color: '#10b981' },
      { name: 'In Progress', count: inProgress, color: '#3b82f6' },
      { name: 'Assigned', count: assigned, color: '#6366f1' },
      { name: 'Under Review', count: underReview, color: '#a855f7' },
      { name: 'Pending', count: pending, color: '#f59e0b' },
      { name: 'Rejected', count: rejected, color: '#ef4444' }
    ];

    const priorityDistribution = [
      { priority: 'High', count: highPriority, color: '#ef4444' },
      { priority: 'Medium', count: mediumPriority, color: '#f59e0b' },
      { priority: 'Low', count: lowPriority, color: '#64748b' }
    ];

    res.json({
      success: true,
      metrics: {
        total,
        pending: pendingTasks,
        active: inProgress,
        inProgress,
        resolved,
        rejected,
        underReview,
        assigned,
        highPriority,
        mediumPriority,
        lowPriority,
        resolutionPercentage,
        avgResolutionDays,
        statusDistribution,
        priorityDistribution
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
