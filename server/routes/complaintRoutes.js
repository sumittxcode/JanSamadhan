const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getMyComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  categorizeComplaint,
  getMyAnalytics
} = require('../controllers/complaintController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// AI Categorization endpoint
router.post('/ai-categorize', protect, categorizeComplaint);

// Citizen Analytics endpoint
router.get('/my/analytics', protect, getMyAnalytics);

router.route('/')
  .post(protect, upload.single('image'), createComplaint);

router.get('/my', protect, getMyComplaints);

router.route('/:id')
  .get(protect, getComplaintById)
  .put(protect, upload.single('image'), updateComplaint)
  .delete(protect, deleteComplaint);

module.exports = router;
