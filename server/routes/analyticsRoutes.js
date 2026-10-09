const express = require('express');
const router = express.Router();
const { protect, authorizeRoles } = require('../middleware/auth');
const { getMyAnalytics } = require('../controllers/complaintController');
const { getOfficerDashboardMetrics } = require('../controllers/officerController');
const { getAdminDashboardMetrics } = require('../controllers/adminController');

// All analytics routes require authentication
router.use(protect);

// Citizen Analytics: Strictly authorized for Citizen role, aggregates only logged-in citizen's complaints
router.get('/citizen', authorizeRoles('Citizen'), getMyAnalytics);

// Department Officer Analytics: Strictly authorized for Department Officer, aggregates only assigned/departmental tickets
router.get('/officer', authorizeRoles('Department Officer'), getOfficerDashboardMetrics);

// Administrator Analytics: Strictly authorized for Administrator, computes system-wide aggregations across MongoDB
router.get('/admin', authorizeRoles('Administrator'), getAdminDashboardMetrics);

module.exports = router;
