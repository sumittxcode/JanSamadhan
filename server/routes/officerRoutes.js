const express = require('express');
const router = express.Router();
const {
  getAssignedComplaints,
  updateAssignedComplaint,
  getOfficerDashboardMetrics
} = require('../controllers/officerController');
const { protect, authorizeRoles } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);
router.use(authorizeRoles('Department Officer'));

router.get('/dashboard', getOfficerDashboardMetrics);
router.get('/complaints', getAssignedComplaints);
router.put('/complaints/:id', upload.single('resolutionImage'), updateAssignedComplaint);

module.exports = router;
