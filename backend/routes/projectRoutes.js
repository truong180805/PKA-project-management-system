const express = require('express');
const router = express.Router;
const { createProject, getProjects, findProjectById } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
    .get(protect, getProjects)
    .post(protect, createProject);

router.route('/:id')
    .get(protect, findProjectById);

module.exports = router;