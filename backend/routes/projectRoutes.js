const express = require('express');
const router = express.Router();
const { createProject,
        getProjectsByClass, 
        joinProject,
        approveProject,
        getProjectDetails,
        submitProject,
        getMyProjects,
        getSupervisedProjects,
        updateProject, deleteProject, requestToJoin,
        handleJoinRequest, removeMember
    } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createProject);
router.post('/join', protect, joinProject);

router.get('/class/:classId', protect, getProjectsByClass);
router.get('/my-projects', protect, getMyProjects);
router.get('/supervised', protect, getSupervisedProjects);

router.put('/handle-request', protect, handleJoinRequest); 

router.post('/:id/request-join', protect, requestToJoin);
router.delete('/:projectId/members/:memberId', protect, removeMember);
router.put('/:id/approve', protect, approveProject);
router.put('/:id/submit', protect, submitProject);

router.get('/:id', protect, getProjectDetails); 
router.put('/:id', protect, updateProject);
router.delete('/:id', protect, deleteProject);

module.exports = router;