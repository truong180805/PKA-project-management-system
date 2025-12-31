const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: { type: String, required: true},
    description: { type: String },

    // connect class
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },

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
    
    isLeaderOnly: { 
        type: Boolean, default: false 
    },

    isStudentProposed: {
        type: Boolean, default: false
    },

    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'completed'],
        default: 'pending'
    },
    
    repositoryLink: { type: String },
    lecturerFeedback: { type: String },
    score: { type: Number}
}, {timestamps: true});

module.exports = mongoose.model('Project', projectSchema);