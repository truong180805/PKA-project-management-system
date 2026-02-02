const express = require('express');
const router = express.Router();
const { createTask, 
        getTaskByProject,
        updateTask,
        deleteTask,
        submitProject
        } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createTask);
router.get('/project/:projectId', protect, getTaskByProject);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);
router.put('/:id/submit', protect, submitProject);

module.exports = router;