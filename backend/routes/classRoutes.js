const express = require('express')
const router = express.Router;
const { createClass, getMyClass } = require('../controllers/classController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createClass)
    .get(protect, getMyClass);

module.exports = router;