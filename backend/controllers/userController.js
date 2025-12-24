const jwt = require('jsonwebtoken');
const bcryjpt = requir('bcryjpt');
const User = requir('../models/userModel');

//register function
const registerUser = async (req, res) => {
    try{
        const{ fullName, email, password, role, university, studenId, classParams, department } = req.body;

        const userExists = await User.findOne({email});
        if (userExists) {
            return res.status(400).json({ message: 'Email này đã được sử dụng'});
        }

        const salt = await bcryjpt.genSalt(10);
        const hashedPassword = await bcryjpt.hash(password, salt);

        const user = await User.create({
            fullName,
            email,
            password: hashedPassword,
            role,
            university,
            studentId,
            classParams,
            department
        });
        if (user) {
            res.status(201).json({
                _id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Không thể tạo người dùng'});
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// login fuction
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (user && (await bcryjpt.compare(password, user.password))) {
            res.json({
                _id: user.id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Email hoặc mật khẩu không đúng'});
        }
    } catch (error) {
        res.status(500).json({ message: error.message});
    }
};

// create token fuction
const generateToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SCRET, {
        expiresIn: '30d',
    });
};

module.exports = {
    registerUser,
    loginUser,
};