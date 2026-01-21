const express = require('express');
const router = express.Router();
const { createProject,
        getProjectsByClass, 
        joinProject,
        approveProject,
        getProjectDetails
    } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createProject);

router.post('/join', protect, joinProject);

router.get('/class/:classId', protect, getProjectsByClass);

router.get('/:id', protect, getProjectDetails);

router.put('/:id/approve', protect, approveProject);

module.exports = router;