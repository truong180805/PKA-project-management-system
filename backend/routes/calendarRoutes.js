const express = require('express');
const router = express.Router();
const { getCalendarEvents } = require('../controllers/calendarController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getCalendarEvents);

module.exports = router;