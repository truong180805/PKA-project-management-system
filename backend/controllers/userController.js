const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/userModel');

//register function
const registerUser = async (req, res) => {
    try{
        const{ fullName, numberPhone, gender, major, email, password, role, university, studentId, className, department } = req.body;
        
        //check info register
        if (!numberPhone && !email){
            return res.status(400).json({message: 'Vui lòng cung cấp email hoặc số điện thoại'});
        }
        if (!fullName || !password || !role){
            return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin'});
        }
        
        const query = { $or: [] };
        if (email) query.$or.push({ email });
        if (numberPhone) query.$or.push({ numberPhone });

        const userExists = await User.findOne(query);
        
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

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            fullName,
            numberPhone,
            email,
            password: hashedPassword,
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

module.exports = {
    registerUser,
    loginUser,
};