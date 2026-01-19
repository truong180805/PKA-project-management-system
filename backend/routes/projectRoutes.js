const express = require('express');
const router = express.Router();
const { createProject,
        getProjectsByClass, 
        joinProject,
        approveProject
    } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createProject);

router.post('/join', protect, joinProject);

router.get('/class/:classId', protect, getProjectsByClass);

router.put('/:id/approve', protect, approveProject);

module.exports = router;