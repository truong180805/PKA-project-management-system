const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
    class: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: true
    },

    title: { 
        type: String,
        required: true
    },

    description: { type: String },
    deadline: { type: Date, required: true },
    
    type: { type: String, enum: ['submission', 'meeting', 'defense'], default: 'submission'}   
}, { timestamps: true });

module.exports = mongoose.model('Milestone', milestoneSchema);