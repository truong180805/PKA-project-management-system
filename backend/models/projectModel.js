const mongoose = require('mongoos');
const { applyTimestamps } = require('./userModel');

const projectSchema = new mongoose({
    name: { type: String, required: true},
    description: { type: String },

    //member group(student)
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    //leader
    leader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    
    //mentor(lecturer)
    mentor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    isStudentProposed: {
        type: Boolean, default: false
    },

    status: {
        type: String,
        enum: ['planning', 'pending_approval', 'approved', 'rejected', 'completed'],
        default: 'planning'
    },
    
    semester: {type: String, required: true},
    finalScore: { type: Number}
}, {timestamps: true}
);

module.exports = mongoose.model('Project', projectSchema);