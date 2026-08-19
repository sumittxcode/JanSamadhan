const User = require('../models/User');
const Complaint = require('../models/Complaint');
const ComplaintCategory = require('../models/ComplaintCategory');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');

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

// ==========================================
// 1. DASHBOARD & ANALYTICS
// ==========================================
exports.getAdminDashboardMetrics = async (req, res) => {
  try {
    // Basic counts
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: 'Pending' });
    const underReview = await Complaint.countDocuments({ status: 'Under Review' });
    const assigned = await Complaint.countDocuments({ status: 'Assigned' });
    const inProgress = await Complaint.countDocuments({ status: 'In Progress' });
    const resolved = await Complaint.countDocuments({ status: 'Resolved' });
    const rejected = await Complaint.countDocuments({ status: 'Rejected' });

    // Complaints by Category
    const categoryStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly trends (group by month/year)
    const monthlyStats = await Complaint.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    // Department performance (Average resolution rate/count per department)
    const departmentStats = await Complaint.aggregate([
      {
        $group: {
          _id: '$department',
          total: { $sum: 1 },
          resolved: {
            $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] }
          }
        }
      }
    ]);

    // Resolution percentage
    const resolutionPercentage = total > 0 ? Math.round((resolved / total) * 100) : 0;

    res.json({
      success: true,
      metrics: {
        total,
        pending: pending + underReview, // combine early stages for simple card
        assigned,
        inProgress,
        resolved,
        rejected,
        resolutionPercentage,
        categoryStats: categoryStats.map(stat => ({ name: stat._id, value: stat.count })),
        monthlyStats: monthlyStats.map(stat => ({
          month: `${stat._id.month}/${stat._id.year}`,
          count: stat.count
        })),
        departmentStats: departmentStats.map(stat => ({
          department: stat._id,
          total: stat.total,
          resolved: stat.resolved,
          rate: stat.total > 0 ? Math.round((stat.resolved / stat.total) * 100) : 0
        }))
      }
    });
  } catch (error) {
    console.error('Admin Metrics Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. USER MANAGEMENT
// ==========================================
exports.getUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = {};

    if (role) query.role = role;
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role, department } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const oldRole = user.role;
    user.role = role || user.role;
    if (role === 'Department Officer') {
      user.department = department || user.department || 'Unassigned';
    } else {
      user.department = null;
    }

    const updatedUser = await user.save();

    await logActivity(
      'USER_ROLE_UPDATE',
      req.user._id,
      null,
      `Admin updated role of ${updatedUser.fullName} from ${oldRole} to ${updatedUser.role} (Dept: ${updatedUser.department || 'None'})`
    );

    await sendNotification(
      updatedUser._id,
      `Your account role has been updated by the administrator to '${updatedUser.role}'.`
    );

    res.json({ success: true, user: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. COMPLAINT MANAGEMENT
// ==========================================
exports.getAllComplaints = async (req, res) => {
  try {
    const { status, category, priority, department, search } = req.query;
    let query = {};

    if (status) query.status = status;
    if (category) query.category = category;
    if (priority) query.priority = priority;
    if (department) query.department = department;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { complaintId: { $regex: search, $options: 'i' } }
      ];
    }

    const complaints = await Complaint.find(query)
      .populate('citizenId', 'fullName email phone')
      .populate('assignedOfficer', 'fullName email phone department')
      .sort({ createdAt: -1 });

    res.json({ success: true, complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.assignComplaint = async (req, res) => {
  try {
    const { department, assignedOfficer, priority, status } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.priority = priority || complaint.priority;
    
    if (assignedOfficer) {
      // Find the officer to verify role and get department
      const officer = await User.findById(assignedOfficer);
      if (!officer) {
        return res.status(404).json({ success: false, message: 'Assigned officer not found' });
      }
      if (officer.role !== 'Department Officer') {
        return res.status(400).json({ success: false, message: 'Assigned user is not a Department Officer' });
      }

      complaint.assignedOfficer = officer._id;
      complaint.department = officer.department || 'Unassigned';
      complaint.status = 'Assigned'; // Auto-transition to Assigned
    } else {
      // Clear officer assignment if assignedOfficer is falsy (e.g. null, undefined, empty string)
      complaint.assignedOfficer = null;
      if (department) {
        complaint.department = department;
        if (complaint.status === 'Pending') {
          complaint.status = 'Under Review'; // If dept is assigned but no officer, mark Under Review
        }
      }
      if (status) {
        complaint.status = status;
      }
    }

    const updatedComplaint = await complaint.save();

    // Populate for details
    const populated = await Complaint.findById(updatedComplaint._id)
      .populate('assignedOfficer', 'fullName');

    const officerName = populated.assignedOfficer ? populated.assignedOfficer.fullName : 'None';

    await logActivity(
      'COMPLAINT_ASSIGNED',
      req.user._id,
      updatedComplaint._id,
      `Admin assigned complaint ${updatedComplaint.complaintId} to Dept: ${updatedComplaint.department}, Officer: ${officerName}, Priority: ${updatedComplaint.priority}`
    );

    // Notify citizen
    let msg = `Your complaint ${updatedComplaint.complaintId} has been updated. Status: '${updatedComplaint.status}', Dept: '${updatedComplaint.department}'`;
    if (updatedComplaint.assignedOfficer) {
      msg = `Your complaint ${updatedComplaint.complaintId} has been assigned to officer ${officerName}.`;
    }
    await sendNotification(updatedComplaint.citizenId, msg);

    // Notify assigned officer if present
    if (updatedComplaint.assignedOfficer) {
      await sendNotification(
        updatedComplaint.assignedOfficer,
        `Complaint ${updatedComplaint.complaintId} has been assigned to you.`
      );
    }

    res.json({ success: true, complaint: updatedComplaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectComplaint = async (req, res) => {
  try {
    const { remarks } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    complaint.status = 'Rejected';
    complaint.remarks = remarks || 'Rejected by Administrator.';
    const updatedComplaint = await complaint.save();

    await logActivity(
      'COMPLAINT_REJECTED',
      req.user._id,
      updatedComplaint._id,
      `Admin rejected complaint ${updatedComplaint.complaintId}. Reason: ${remarks}`
    );

    await sendNotification(
      updatedComplaint.citizenId,
      `Your complaint ${updatedComplaint.complaintId} was rejected. Remarks: "${updatedComplaint.remarks}"`
    );

    res.json({ success: true, complaint: updatedComplaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 4. CATEGORY MANAGEMENT
// ==========================================
exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const categoryExists = await ComplaintCategory.findOne({ name });
    if (categoryExists) {
      return res.status(400).json({ success: false, message: 'Category already exists' });
    }

    const category = await ComplaintCategory.create({ name, description });

    await logActivity('CATEGORY_CREATED', req.user._id, null, `Admin created category: ${category.name}`);

    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const category = await ComplaintCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const oldName = category.name;
    category.name = name || category.name;
    category.description = description || category.description;
    const updatedCategory = await category.save();

    await logActivity(
      'CATEGORY_UPDATED',
      req.user._id,
      null,
      `Admin updated category from ${oldName} to ${updatedCategory.name}`
    );

    res.json({ success: true, category: updatedCategory });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const category = await ComplaintCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const categoryName = category.name;
    await ComplaintCategory.findByIdAndDelete(req.params.id);

    await logActivity('CATEGORY_DELETED', req.user._id, null, `Admin deleted category: ${categoryName}`);

    res.json({ success: true, message: `Category ${categoryName} deleted successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 5. ACTIVITY LOGS
// ==========================================
exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate('performedBy', 'fullName email role')
      .populate('complaintId', 'complaintId title')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 6. REPORTS & EXPORTS
// ==========================================
exports.exportComplaintData = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('citizenId', 'fullName email phone')
      .populate('assignedOfficer', 'fullName email')
      .sort({ createdAt: -1 });

    // Format as CSV
    let csv = 'Complaint ID,Title,Category,Location,Priority,Status,Citizen Name,Citizen Email,Assigned Department,Assigned Officer,Date Created,Resolution Remarks\n';
    
    complaints.forEach(c => {
      const citizenName = c.citizenId ? `"${c.citizenId.fullName.replace(/"/g, '""')}"` : 'N/A';
      const citizenEmail = c.citizenId ? c.citizenId.email : 'N/A';
      const officerName = c.assignedOfficer ? `"${c.assignedOfficer.fullName.replace(/"/g, '""')}"` : 'Unassigned';
      const title = `"${c.title.replace(/"/g, '""')}"`;
      const loc = `"${c.location.replace(/"/g, '""')}"`;
      const date = c.createdAt.toISOString().split('T')[0];
      const rem = c.remarks ? `"${c.remarks.replace(/"/g, '""')}"` : 'None';

      csv += `${c.complaintId},${title},${c.category},${loc},${c.priority},${c.status},${citizenName},${citizenEmail},${c.department},${officerName},${date},${rem}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=jansamadhan_complaints_report.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
