const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createAssignment, getAssignmentsByClass,
    submitAssignment, getSubmissions, gradeSubmission,
    uploadMaterial, getMaterials,
    createTopic, getTopics, registerTopic
} = require('../controllers/courseworkController');

// --- ASSIGNMENTS ---
router.post('/assignments', protect, createAssignment);
router.get('/assignments/class/:classId', protect, getAssignmentsByClass);

// --- SUBMISSIONS ---
router.post('/submissions', protect, submitAssignment); // SV nộp
router.get('/submissions/assignment/:assignmentId', protect, getSubmissions); // GV xem
router.put('/submissions/:submissionId/grade', protect, gradeSubmission); // GV chấm

// --- MATERIALS ---
router.post('/materials', protect, uploadMaterial);
router.get('/materials/class/:classId', protect, getMaterials);

// --- TOPICS ---
router.post('/topics', protect, createTopic);
router.get('/topics/class/:classId', protect, getTopics);
router.post('/topics/register', protect, registerTopic);

module.exports = router;