const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    name: { type: String, required: true },
    classCode: { type: String, required: true, unique: true },

    lecturer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    student:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }],

    pendingStudents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    settings: {
        autoApprove: { type: Boolean, default: false},
        allowStudentPropose: {type: Boolean, default: true}
    },

    semester: { type: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true});

module.exports = mongoose.model('Class', classSchema);