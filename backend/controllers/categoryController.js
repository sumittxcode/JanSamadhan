const ComplaintCategory = require('../models/ComplaintCategory');

// @desc    Get all complaint categories
// @route   GET /api/categories
// @access  Public (or Private)
exports.getCategories = async (req, res) => {
  try {
    const categories = await ComplaintCategory.find().sort({ name: 1 });
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
