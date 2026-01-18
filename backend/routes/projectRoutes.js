const express = require('express');
const router = express.Router();
const { createProject,
        getProjectsByClass, 
        joinProject,
        approveProject
    } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createProject);

router.get('/join', protect, joinProject);

router.route('/class/:classId', protect, getProjectsByClass);

router.put('/:id/approve', protect, approveProject);

module.exports = router;