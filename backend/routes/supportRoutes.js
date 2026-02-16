const express = require('express');
const router = express.Router();
const { sendSupportRequest } = require('../controllers/supportController');
const { protect } = require('../middleware/authMiddleware');

// Chỉ user đã đăng nhập mới được gửi hỗ trợ
router.post('/', protect, sendSupportRequest);

module.exports = router;