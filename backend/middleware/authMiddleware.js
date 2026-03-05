const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

//check token fuction
const protect = async (req, res, next ) => {    let token;
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            req.user = await User.findById(decoded.id).select('-password');

            return next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Token không hợp lệ, vui lòng đăng nhập lại '});
        }
    }
    if (!token) {
        res.status(401).json({ message: 'không có quyền truy cập, thiếu token'});
    }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next(); // Cho phép đi tiếp
  } else {
    res.status(403).json({ message: 'Không có quyền truy cập! Cần tài khoản Quản trị viên.' });
  }
};

module.exports = { protect, admin };