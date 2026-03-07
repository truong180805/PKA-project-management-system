const sendEmail = require('../utils/sendEmail');
const User = require('../models/userModel');

const sendSupportRequest = async (req, res) => {
  try {
    const { subject, description } = req.body;
    const sender = req.user; // Lấy thông tin người gửi từ middleware protect

    // 1. Tạo nội dung email gửi cho Admin
    const message = `
      CÓ YÊU CẦU HỖ TRỢ MỚI TỪ HỆ THỐNG DEVMANAGER:
      ------------------------------------------------
      NGƯỜI GỬI:
      - Tên: ${sender.fullName}
      - Email: ${sender.email}
      - Vai trò: ${sender.role === 'lecturer' ? 'Giảng viên' : 'Sinh viên'}
      - ID: ${sender._id}
      ------------------------------------------------
      NỘI DUNG VẤN ĐỀ:
      Tiêu đề: ${subject}
      
      Chi tiết:
      ${description}
      ------------------------------------------------
      (Email này được gửi tự động từ hệ thống)
    `;

    // 2. Gửi email đến chính email quản trị (trong .env) hoặc email support riêng
    await sendEmail({
      email: process.env.EMAIL_USER, 
      subject: `[SUPPORT] ${subject} - từ ${sender.fullName}`,
      message: message,
    });

    res.status(200).json({ success: true, message: 'Đã gửi yêu cầu hỗ trợ thành công!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi gửi email hỗ trợ. Vui lòng thử lại sau.' });
  }
};

module.exports = { sendSupportRequest };