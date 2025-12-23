const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true},
    email: { type: String, required: true, unique: true},
    password: { type: String, required: true},
    university: { type: String, required: true, default: 'Phenikaa'},

    role: {
        type: String,
        enum: ['admin', 'lecturer', 'student'], 
        default: 'student'
    },

    //Student
    studentId: { type: String },
    classParmas: { type: String },

    //lecturer
    department: { type: String },

    avatarUrl: { type: String, default: "" }
}, { timestamps: true});

module.exports = mongoose.model('User', userSchema);
