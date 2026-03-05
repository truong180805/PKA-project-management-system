const express = require('express');
const router = express.Router();
const { createClass, getMyClasses, joinClass,
    getClassDetails, approveStudent,getAllClassesAdmin,
    deleteClassAdmin
 } = require('../controllers/classController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/admin/all', protect, admin, getAllClassesAdmin);
router.delete('/admin/:id', protect, admin, deleteClassAdmin);

router.route('/')
    .post(protect, createClass)
    .get(protect, getMyClasses);

router.post('/join', protect, joinClass);
router.get('/:id', protect, getClassDetails);
router.put('/:id/approve', protect, approveStudent);

module.exports = router;