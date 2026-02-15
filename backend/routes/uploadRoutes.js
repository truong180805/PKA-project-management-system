const express = require('express');
const router = express.Router();
const { upload, uploadFile } = require('../controllers/uploadController');
const { protect } = require('../middleware/authMiddleware');

// Route này dùng chung cho cả Avatar và Tài liệu
// 'file' là tên trường (field name) mà Frontend phải gửi đúng tên này
router.post('/', protect, upload.single('file'), uploadFile);

module.exports = router;