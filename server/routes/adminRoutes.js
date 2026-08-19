const express = require('express');
const router = express.Router();
const {
  getAdminDashboardMetrics,
  getUsers,
  updateUserRole,
  getAllComplaints,
  assignComplaint,
  rejectComplaint,
  createCategory,
  updateCategory,
  deleteCategory,
  getActivityLogs,
  exportComplaintData
} = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/auth');

router.use(protect);
router.use(authorizeRoles('Administrator'));

// Dashboard
router.get('/dashboard', getAdminDashboardMetrics);

// User Management
router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);

// Complaint Management
router.get('/complaints', getAllComplaints);
router.put('/complaints/:id/assign', assignComplaint);
router.put('/complaints/:id/reject', rejectComplaint);

// Category Management
router.post('/categories', createCategory);
router.route('/categories/:id')
  .put(updateCategory)
  .delete(deleteCategory);

// Activity Logs
router.get('/activity-logs', getActivityLogs);

// Export Report
router.get('/export-csv', exportComplaintData);

module.exports = router;
