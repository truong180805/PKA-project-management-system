const express = require('express');
const router = express.Router();
const { createTask, 
        getTaskByProject,
        updateTaskStatus,
        deleteTask
        } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createTask);
router.get('/project/:projectId', protect, getTaskByProject);
router.put('/:id', protect, updateTaskStatus);
router.delete('/:id', protect, deleteTask);

module.exports = router;