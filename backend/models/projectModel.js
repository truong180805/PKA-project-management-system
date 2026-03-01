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

    topic: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },

    //member group(student)
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    //leader
    leader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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

    joinRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    progress: { type: Number, default: 0 },
    
    finalReportUrl: { type: String },
    lecturerFeedback: { type: String, default: "" },
    score: { type: Number, default: 0}
}, {timestamps: true});

module.exports = mongoose.model('Project', projectSchema);