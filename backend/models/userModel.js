const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    // login
    numberPhone: { type: String, required: true, unique: true},
    fullName: { type: String, required: true},
    password: { type: String, required: true},
    
    //later update in profile
    email: { type: String, required: true, unique: true},
    university: { type: String, required: true, default: 'Phenikaa'},
    gender: { type: String, enum: ['Nam', 'Nữ', 'Khác']},
    dateOfBirth: { type: Date},
    avatarUrl: { type: String, default: "" },

    role: {
        type: String,
        enum: ['admin', 'lecturer', 'student'], 
        required: true
    },

    //Student
    studentId: { type: String },
    className: { type: String },
    major: {type: String},

    //lecturer
    department: { type: String },

    isActive: { type: Boolean, default: true }
}, { timestamps: true});

module.exports = mongoose.model('User', userSchema);
