const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignment: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Assignment', 
    required: true 
  },

  // Người nộp (đại diện)
  submitter: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },

  // Nếu là bài tập nhóm, lưu ID nhóm vào đây
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project'
  },

  // Nội dung nộp (Link hoặc File)
  submissionUrl: { type: String, required: true },
  note: { type: String }, // Ghi chú của SV

  // Chấm điểm của GV
  score: { type: Number },
  feedback: { type: String },
  
  gradedAt: { type: Date }

}, { timestamps: true });

module.exports = mongoose.model('Submission', submissionSchema);