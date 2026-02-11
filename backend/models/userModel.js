const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    // login
    numberPhone: { type: String, sparse: true, unique: true},
    password: { type: String, required: true},
    
    //user information
    fullName: { type: String, required: true},
    email: { type: String, sparse: true, unique: true},
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

module.exports = mongoose.model('User', userSchema);
