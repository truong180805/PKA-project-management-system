const express = require('express');
const router = express.Router();
const { createProject,
        getProjectsByClass, 
        joinProject,
        approveProject,
        getProjectDetails,
        submitProject
    } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createProject);

router.post('/join', protect, joinProject);

router.get('/class/:classId', protect, getProjectsByClass);

router.get('/:id', protect, getProjectDetails);

router.put('/:id/approve', protect, approveProject);

router.put('/:id/submit', protect, submitProject);
module.exports = router;