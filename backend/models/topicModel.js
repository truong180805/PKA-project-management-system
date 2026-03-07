const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String },
    
    class: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Class', 
        required: true 
    },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },

    maxGroups: { type: Number, default: 1 },

    registeredGroups: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],

    requestQueue: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],

    isFull: { type: Boolean, default: false }

}, { timestamps: true});

module.exports = mongoose.model('Topic', topicSchema);