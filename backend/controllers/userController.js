const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');
const sendEmail = require('../utils/sendEmail');

// create token fuction
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

//register function
const registerUser = async (req, res) => {
  const { fullName, email, password, numberPhone, role, studentId } = req.body;

  try {
    // 1. Kiểm tra Email đã tồn tại chưa (Quan trọng nhất)
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'Email này đã được sử dụng!' });
    }

    const existedPhone = await User.findOne({ numberPhone });

    if (existedPhone) {
      return res.status(400).json({ message: "Số điện thoại đã tồn tại" });
    }
    
    // 2. Tạo User mới
    const user = await User.create({
      fullName,
      email,
      password,
      numberPhone,
      role,
      studentId: role === 'student' ? studentId : undefined // Chỉ lưu MSSV nếu là SV
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// login fuction
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Chỉ tìm user bằng Email
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        avatarUrl: user.avatarUrl,
        numberPhone: user.numberPhone,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    // Tìm user theo ID trong token
    const user = await User.findById(req.user._id);

    if (user) {
      // 1. Cập nhật thông tin cơ bản
      user.fullName = req.body.fullName || user.fullName;
      user.numberPhone = req.body.numberPhone || user.numberPhone;
      if (req.body.avatarUrl !== undefined) {
        user.avatarUrl = req.body.avatarUrl;
        }
      // Các trường khác (Class, Major, Department) tùy bạn có muốn cho sửa không
      if (req.body.className) user.className = req.body.className;
      if (req.body.major) user.major = req.body.major;
      if (req.body.department) user.department = req.body.department;
      // Lưu ý: Không cho sửa Email, Role, StudentId ở đây để bảo toàn dữ liệu hệ thống

      if (req.body.settings) {
          user.settings = {
              ...user.settings, // Giữ lại các setting cũ
              ...req.body.settings // Ghi đè setting mới
          };
      }

      // 2. Xử lý Đổi mật khẩu (Nếu có gửi lên)
      if (req.body.password) {
        // Nếu muốn đổi mật khẩu, BẮT BUỘC phải gửi kèm mật khẩu cũ (oldPassword)
        if (!req.body.oldPassword) {
            return res.status(400).json({ message: 'Vui lòng nhập mật khẩu hiện tại để xác nhận thay đổi' });
        }

        // Kiểm tra mật khẩu cũ có đúng không
        const isMatch = await bcrypt.compare(req.body.oldPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu hiện tại không đúng' });
        }

        // Nếu đúng, gán mật khẩu mới (Mongoose middleware sẽ tự hash)
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      // Trả về dữ liệu mới (trừ password)
      res.json({
        _id: updatedUser._id,
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        numberPhone: updatedUser.numberPhone,
        role: updatedUser.role,
        studentId: updatedUser.studentId,
        className: updatedUser.className,
        major: updatedUser.major,
        department: updatedUser.department,
        avatarUrl: updatedUser.avatarUrl,
        settings: updatedUser.settings,
        token: req.header('Authorization')?.replace('Bearer ', '') // Giữ nguyên token cũ
      });

    } else {
      res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy tài khoản với email này' });
    }

    // Lấy token từ model
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false }); // Lưu lại token vào DB

    // Tạo URL reset (Frontend URL)
    // Lưu ý: Port 5173 là của Vite Frontend
    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    const message = `Bạn nhận được email này vì đã yêu cầu đặt lại mật khẩu.\n\nVui lòng truy cập đường dẫn sau để đặt lại mật khẩu (Link hết hạn sau 10 phút):\n\n${resetUrl}\n\nNếu bạn không yêu cầu, vui lòng bỏ qua email này.`;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Yêu cầu đặt lại mật khẩu - DevManager',
        message,
      });

      res.status(200).json({ success: true, data: 'Email đã được gửi!' });
    } catch (error) {
      // Nếu gửi lỗi thì xóa token đi để user thử lại
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return res.status(500).json({ message: 'Không thể gửi email. Vui lòng thử lại.' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    // 1. Mã hóa token từ URL để so sánh với DB
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');

    // 2. Tìm user có token đó và chưa hết hạn
    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
    }

    // 3. Đặt mật khẩu mới
    user.password = req.body.password;
    
    // 4. Xóa token
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save(); // Middleware pre-save sẽ tự hash password mới

    res.status(200).json({ success: true, data: 'Cập nhật mật khẩu thành công!' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
    try {
        // Có thể thêm tính năng tìm kiếm hoặc lọc theo role
        const keyword = req.query.keyword ? {
            $or: [
                { fullName: { $regex: req.query.keyword, $options: 'i' } },
                { email: { $regex: req.query.keyword, $options: 'i' } }
            ]
        } : {};

        const users = await User.find(keyword).select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const updateUserRole = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

        user.role = req.body.role || user.role;
        // Có thể sửa thêm các trường khác nếu cần
        
        const updatedUser = await user.save();
        res.json({ message: 'Cập nhật thành công', user: updatedUser });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Không tìm thấy người dùng' });

        if (user.role === 'admin') {
            return res.status(400).json({ message: 'Không thể xóa tài khoản Admin hệ thống' });
        }

        await user.deleteOne();
        res.json({ message: 'Đã xóa người dùng' });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

module.exports = {
    registerUser,
    loginUser,
    updateUserProfile,
    forgotPassword,
    resetPassword,
    getAllUsers, updateUserRole, deleteUser
};