const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createAssignment, getAssignmentsByClass,
    submitAssignment, getSubmissions, gradeSubmission,
    uploadMaterial, getMaterials,
    createTopic, getTopics, registerTopic,
    approveTopicProposal, approveTopicRegistration,
    getClassGradebook, getClassStream
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
router.put('/topics/approve-proposal', protect, approveTopicProposal); // Duyệt đề tài
router.put('/topics/approve-registration', protect, approveTopicRegistration); // Duyệt nhóm

router.get('/grades/class/:classId', protect, getClassGradebook);

router.get('/stream/class/:classId', protect, getClassStream);

module.exports = router;