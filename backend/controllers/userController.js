const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');

//register function
const registerUser = async (req, res) => {
    try{
        const{ fullName, account, gender, major, password, role, university, studentId, className, department } = req.body;
        
        //check info register
        if (!account){
            return res.status(400).json({message: 'Vui lòng cung cấp email hoặc số điện thoại'});
        }
        if (!fullName || !password || !role){
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin'});
        }
        
        const isEmail = /\S+@\S+\.\S+/.test(account);
        const isPhone = /^[0-9]{9,11}$/.test(account);

        if (!isEmail && !isPhone) {
            return res.status(400).json({ message: 'Email hoặc số điện thoại không hợp lệ' });
        }

        const email = isEmail ? account : undefined;
        const numberPhone = isPhone ? account : undefined;

        const userExists = await User.findOne({
            $or: [
                email ? { email } : null,
                numberPhone ? { numberPhone } : null
            ].filter(Boolean)
        });
        
        if (userExists) {
        // Báo lỗi cụ thể hơn
        if (email && userExists.email === email) {
            return res.status(400).json({ message: 'Email này đã được sử dụng' });
        }
        if (numberPhone && userExists.numberPhone === numberPhone) {
            return res.status(400).json({ message: 'Số điện thoại này đã được sử dụng' });
        }
        }
        
        if (password.length < 6) {
            return res.status(400).json({ message: 'Mật khẩu phải ít nhất 6 ký tự'});
        }

        if (role === 'student') {
            if(!studentId || !className || !major){
                return res.status(400).json({ message: 'Sinh viên cần nhập mã Sinh viên, tên lớp và chuyên ngành'});
            }
        } else if (role === 'lecturer') {
            if (!department){
                return res.status(400).json({ message: 'Giảng viên cần nhập Khoa'});
            }
        }   

        const user = await User.create({
            fullName,
            numberPhone,
            email,
            password,
            role,
            gender,
            university,
            studentId: role === 'student' ? studentId : undefined,
            major: role === 'student' ? major : undefined,
            className: role === 'student' ? className : undefined,
            department: role === 'lecturer' ? department : undefined,
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                fullName: user.fullName,
                account: user.email || user.numberPhone,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Dữ liệu không hợp lệ'});
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// login fuction
const loginUser = async (req, res) => {
    try {
        const { account, password } = req.body;

        if (!account || !password){
            return res.status(400).json({ message: 'Vui lòng nhập tài khoản và mật khẩu'})
        }

        const user = await User.findOne({ 
            $or: [
                { email: account },
                { numberPhone: account}
            ]
         });

        if (user && (await bcrypt.compare(password, user.password))) {
            if (!user.isActive){
                return res.status(403).json({ message: 'Tài khoản đã bị khóa'});
            }

            res.json({
                _id: user.id,
                fullName: user.fullName,
                email: user.email,
                numberPhone: user.numberPhone,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Tài khoản hoặc mật khẩu không đúng'});
        }
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};

// create token fuction
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
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