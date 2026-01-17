const express = require('express');
const router = express.Router();
const { createProject, getProjectsByClass, joinProject } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createProject);

router.route('/join')
    .get(protect, joinProject);

router.route('/class/:classId', protect, getProjectsByClass);

module.exports = router;