const express = require('express');
const router = express.Router();
const { createClass, getMyClasses } = require('../controllers/classController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createClass)
    .get(protect, getMyClasses);

module.exports = router;