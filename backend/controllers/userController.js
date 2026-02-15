const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');

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
        token: req.header('Authorization')?.replace('Bearer ', '') // Giữ nguyên token cũ
      });

    } else {
      res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
    registerUser,
    loginUser,
    updateUserProfile
};