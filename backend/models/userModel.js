const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    // login
    email: { 
    type: String, 
    required: true, 
    unique: true, 
    match: [/.+\@.+\..+/, 'Vui lòng nhập email hợp lệ']
    },
    password: { type: String, required: true},
    
    //user information
    fullName: { type: String, required: true},
    numberPhone: { type: String, required: true },
    university: { type: String, required: true, default: 'Phenikaa'},
    gender: { type: String, enum: ['Nam', 'Nữ', 'Khác']},
    dateOfBirth: { type: Date},
    avatarUrl: { type: String, default: "" },

    role: {
        type: String,
        enum: ['admin', 'lecturer', 'student'], 
        required: true,
        default: 'student'
    },

    //Student
    studentId: { type: String },
    className: { type: String },
    major: {type: String},

    //lecturer
    department: { type: String },

    isActive: { type: Boolean, default: true }
}, { timestamps: true});

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
