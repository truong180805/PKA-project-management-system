const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Assignment', 
    required: true 
  },

  submitter: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },

  submissionUrl: { type: String, required: true },
  note: { type: String }, 

  score: { type: Number },
  feedback: { type: String },
  
  gradedAt: { type: Date }

}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);