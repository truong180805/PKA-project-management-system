const express = require('express');
const router = express.Router();
const { getDashboardStats, getAdminStats } = require('../controllers/dashboardController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/', protect, getDashboardStats);
router.get('/admin-stats', protect, admin, getAdminStats);

module.exports = router;