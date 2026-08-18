const express = require('express');
const router = express.Router();
const { signup, login, getProfile, updateProfile, getNotifications, markAsRead } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);
router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markAsRead);

module.exports = router;
