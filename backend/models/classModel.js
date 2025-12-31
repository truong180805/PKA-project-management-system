const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
    name: { type: String, require: true },
    classCode: { type: String, require: true, unique: true },

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
    isActive: { type: Boolean, deafault: true }
}, { timestamps: true});

module.exports = mongoose.model('Class', classSchema);