const express = require('express');
const router = express.Router();
const { createClass, getMyClasses, joinClass,
    getClassDetails, approveStudent
 } = require('../controllers/classController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createClass)
    .get(protect, getMyClasses);

router.post('/join', protect, joinClass);
router.get('/:id', protect, getClassDetails);
router.put('/:id/approve', protect, approveStudent);

module.exports = router;